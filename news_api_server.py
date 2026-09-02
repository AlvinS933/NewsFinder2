from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta, timezone
import time
import re
import json
from newspaper import Article
import os
from openai import OpenAI

try:
    from dotenv import load_dotenv
    load_dotenv()  # loads .env from the project root; .env is git-ignored
except ImportError:
    pass  # no python-dotenv installed — fall back to real shell env vars

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Secrets are read from the environment only. Never hard-code a key here:
# this file is committed, and anything in it ends up on GitHub forever.
NEWSAPI_KEY = os.getenv('NEWSAPI_KEY', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
JSON_SERVER_URL = os.getenv('JSON_SERVER_URL', 'http://localhost:8000/blogs')
OUTPUT_SERVER_URL = os.getenv('OUTPUT_SERVER_URL', 'http://localhost:8001/outputs')

MODEL = "gpt-5.4-mini"

_missing = [name for name, value in (
    ('NEWSAPI_KEY', NEWSAPI_KEY),
    ('OPENAI_API_KEY', OPENAI_API_KEY),
) if not value]

if _missing:
    raise SystemExit(
        f"Missing required environment variable(s): {', '.join(_missing)}\n"
        "Fix: cp .env.example .env, fill in your keys, then\n"
        "     pip install python-dotenv\n"
        "Or export them in your shell instead."
    )

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


def classify_with_openai(text):
    """
    Use OpenAI's ChatGPT API for topic classification
    Get API key at: https://platform.openai.com/api-keys
    """
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """You are a topic classifier. Classify the given article into ONE of these categories:
                    - politics
                    - economy
                    - technology
                    - health
                    - sports
                    - entertainment
                    - environment
                    - education
                    - crime
                    - international
                    
                    Respond with ONLY the category name, nothing else."""
                },
                {
                    "role": "user",
                    "content": f"Classify this article:\n\n{text[:1000]}"
                }
            ],
            temperature=0.3,
            max_completion_tokens=10
        )

        category = response.choices[0].message.content.strip().lower()

        # Validate category
        valid_categories = [
            "politics", "economy", "technology", "health", "sports",
            "entertainment", "environment", "education", "crime", "international"
        ]

        if category in valid_categories:
            return category
        else:
            return "international"

    except Exception as e:
        print(f"OpenAI API classification error: {e}")
        # Fallback to simple classification
        return classify_topic_simple(text)


def classify_topic_simple(text):
    """Simple keyword-based topic classification as fallback"""
    if not text:
        return "unknown"

    text_lower = text.lower()

    # Simple keyword matching
    if any(word in text_lower for word in ['election', 'president', 'government', 'congress', 'senate', 'politics', 'vote', 'trump', 'biden']):
        return "politics"
    elif any(word in text_lower for word in ['economy', 'market', 'stock', 'finance', 'trade', 'business', 'dollar', 'inflation']):
        return "economy"
    elif any(word in text_lower for word in ['technology', 'ai', 'computer', 'software', 'tech', 'digital', 'cyber', 'apple', 'google', 'meta']):
        return "technology"
    elif any(word in text_lower for word in ['health', 'medical', 'doctor', 'hospital', 'disease', 'medicine', 'patient', 'covid', 'vaccine']):
        return "health"
    elif any(word in text_lower for word in ['sport', 'game', 'player', 'team', 'football', 'basketball', 'soccer', 'nfl', 'nba']):
        return "sports"
    elif any(word in text_lower for word in ['movie', 'music', 'celebrity', 'entertainment', 'film', 'actor', 'singer', 'hollywood']):
        return "entertainment"
    elif any(word in text_lower for word in ['climate', 'environment', 'pollution', 'green', 'energy', 'carbon', 'warming']):
        return "environment"
    elif any(word in text_lower for word in ['education', 'school', 'university', 'student', 'teacher', 'learning', 'college']):
        return "education"
    elif any(word in text_lower for word in ['crime', 'police', 'arrest', 'court', 'law', 'justice']):
        return "crime"
    else:
        return "international"


# ============================================================
# AGENTIC TARIFF LOOKUP
# ============================================================
# The model reads the article and decides — on its own — whether a
# tariff lookup is warranted, and if so, what product keyword to search
# for. This is the "agentic" step: everything above this is a single
# classification call, this is a decision + real external action.

def lookup_tariff(keyword):
    """
    Real tool call: hits the free USITC Harmonized Tariff Schedule API.
    No API key required.

    Returns a dict with:
      status  -- "ok" | "empty" | "error"
      summary -- one readable line, used for server-side logging
      records -- structured rows the React notification overlay renders
    """
    url = "https://hts.usitc.gov/reststop/search"
    params = {"keyword": keyword}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        results = response.json()
    except requests.exceptions.RequestException as e:
        return {
            "status": "error",
            "summary": f"Tariff lookup failed: {e}",
            "records": [],
        }

    if not results:
        return {
            "status": "empty",
            "summary": f"No tariff records found for '{keyword}'.",
            "records": [],
        }

    records = []
    lines = []
    for item in results[:3]:
        desc = item.get("description", "N/A")
        general_rate = item.get("general", "N/A")
        section_301 = item.get("isSection301", False)
        section_232 = item.get("isSection232", False)

        flag_notes = []
        if section_301:
            flag_notes.append("Section 301 (China) tariff applies")
        if section_232:
            flag_notes.append("Section 232 (steel/aluminum) tariff applies")

        records.append({
            "description": desc,
            "general_rate": general_rate,
            "notes": flag_notes,
        })

        line = f"{desc} | General duty rate: {general_rate}"
        if flag_notes:
            line += f" | {', '.join(flag_notes)}"
        lines.append(line)

    return {
        "status": "ok",
        "summary": " || ".join(lines),
        "records": records,
    }


TARIFF_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "lookup_tariff",
            "description": (
                "Look up current US import tariff/duty rates for a product, "
                "material, or sector. Call this whenever the article "
                "genuinely discusses tariffs, import duties, or trade "
                "barriers -- including when the discussion is diplomatic or "
                "political (trade negotiations, a G20 or bilateral dispute, "
                "retaliation threats, a tariff deadline) and no single good "
                "is named. In that case, look up the commodity or sector "
                "most central to the dispute the article describes. "
                "Do NOT call it when: 'tariff' is used in a non-trade sense "
                "(an electricity, water, or phone tariff); the word appears "
                "once as a stray aside with no identifiable trade subject; "
                "or the only thing at issue is a service or software, which "
                "is not physically imported and has no duty rate. "
                "IMPORTANT: the underlying database only does literal text "
                "matching against formal customs/commodity descriptions -- "
                "it does NOT understand brand names, company names, or "
                "marketing terms. Use the generic physical product category "
                "instead, e.g. 'cellular telephones' or 'smartphones' (not "
                "'Apple iPhone' or 'Apple'), 'knit apparel' or 'cotton "
                "trousers' (not 'fast fashion' or 'Shein'), 'passenger "
                "vehicles' (not a car brand name)."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": (
                            "The product, material, or sector to look up, "
                            "e.g. 'steel', 'lumber', 'passenger vehicles'. "
                            "If the article names no single good, use the "
                            "broad commodity or sector most central to the "
                            "trade dispute it describes. Prefer the plain "
                            "commodity noun: the matcher is literal and "
                            "scores each word separately, so multi-word "
                            "qualifiers pull in unrelated lines ('hot-rolled "
                            "steel' matches 'hot red peppers'). Use 'steel', "
                            "not 'hot-rolled steel'."
                        ),
                    }
                },
                "required": ["keyword"],
            },
        },
    }
]

TARIFF_AVAILABLE_FUNCTIONS = {"lookup_tariff": lookup_tariff}

# Cheap gate in front of the agentic step: if none of these appear anywhere
# in the article, there is no trade angle to reason about, so skip the model
# call entirely. Keeps the notification overlay quiet on unrelated news.
TARIFF_TRIGGER_TERMS = (
    "tariff", "import dut", "duty rate", "customs dut", "countervailing",
    "anti-dumping", "antidumping", "section 301", "section 232",
    "trade war", "import levy", "import tax", "harmonized tariff", "tariffs"
)


# "auto" leaves the final decision to the model -- this is the agentic step.
# Flip to "required" to force a lookup on every article that clears the
# keyword gate above; the model then only chooses the keyword, not whether.
TARIFF_TOOL_CHOICE = "auto"


def article_mentions_trade(article_title, article_text):
    """True if the article contains any explicit tariff/duty language."""
    haystack = f"{article_title} {article_text}".lower()
    return any(term in haystack for term in TARIFF_TRIGGER_TERMS)


def run_tariff_agent(article_title, article_text):
    """
    Feed one article to the model with the tariff tool available.
    Returns a dict describing what happened — whether the tool was
    triggered, what keyword was used, and what data came back — or
    None if the model decided no lookup was warranted.
    """
    if not article_mentions_trade(article_title, article_text):
        print(f"  -> [Agentic] Skipped (no tariff language): \"{article_title[:60]}\"")
        return None

    messages = [
        {
            "role": "user",
            "content": (
                f"Here is a news article.\n\nTitle: {article_title}\n\n"
                f"Text: {article_text[:3000]}\n\n"
                "This article has already been screened and contains "
                "explicit tariff or import-duty language, so the question "
                "is not whether trade comes up -- it does. Decide which "
                "product, material, or sector a reader of this article "
                "would most want the current US duty rate for, and call "
                "lookup_tariff with it. The article does not have to name a "
                "specific good: if it covers tariff diplomacy or a "
                "country-level trade dispute, look up the commodity or "
                "sector most central to that dispute. Call no tool only if "
                "'tariff' is being used in a non-trade sense, or it is a "
                "stray word with no identifiable trade subject at all -- "
                "then reply with one short sentence saying why."
            ),
        }
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TARIFF_TOOLS,
            tool_choice=TARIFF_TOOL_CHOICE,
        )
    except Exception as e:
        print(f"Tariff agent model call failed: {e}")
        return None

    message = response.choices[0].message

    if not message.tool_calls:
        # message.content may hold the model's reasoning if it chose to
        # explain itself in plain text instead of calling the tool --
        # useful for debugging why a lookup didn't trigger.
        explanation = f" | Model said: {message.content}" if message.content else ""
        print(f"  -> [Agentic] No tariff lookup needed for: \"{article_title[:60]}\"{explanation}")
        return None

    # Only handling the first tool call for now -- extend to a loop if you
    # ever let the model request multiple lookups per article.
    tool_call = message.tool_calls[0]
    args = json.loads(tool_call.function.arguments)
    keyword = args.get("keyword", "")

    print(f"  -> [Agentic] Tariff lookup triggered for keyword: '{keyword}'")
    lookup = TARIFF_AVAILABLE_FUNCTIONS[tool_call.function.name](**args)
    print(f"  -> [Tariff data] {lookup['summary']}")

    # This result is not persisted anywhere -- it is returned up through the
    # /api/search-news response so the React frontend can flash it as a
    # transient notification overlay.
    return {
        "article_title": article_title,
        "triggered": True,
        "keyword": keyword,
        "status": lookup["status"],
        "tariff_data": lookup["summary"],
        "records": lookup["records"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================
# EXISTING SCRAPING / PIPELINE CODE
# ============================================================

def scrape_full_article(url):
    """Scrape the full article text from the URL using newspaper3k"""
    try:
        article = Article(url)
        article.download()
        article.parse()

        full_text = article.text

        if full_text and len(full_text) > 100:
            return full_text
        else:
            return None

    except Exception as e:
        print(f"Error scraping article from {url}: {e}")
        return None


def clean_content(content):
    """Remove truncation markers and clean up content"""
    if not content:
        return ""

    # Remove truncation markers like "[+1411 chars]"
    cleaned = re.sub(r'\[\+\d+\s+chars\]', '', content)
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    return cleaned


def fetch_news_articles(topic, from_date, to_date, pages=1):
    """Fetch articles from NewsAPI"""
    articles = []
    start_date = datetime.strptime(from_date, '%Y-%m-%d')
    end_date = datetime.strptime(to_date, '%Y-%m-%d')

    current_date = start_date

    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)

        for page in range(1, min(pages + 1, 4)):  # Limit to 3 pages per day
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": topic,
                "from": current_date.strftime('%Y-%m-%d'),
                "to": next_date.strftime('%Y-%m-%d'),
                "language": "en",
                "sortBy": "relevancy",
                "pageSize": 20,
                "page": page,
                "apiKey": NEWSAPI_KEY
            }

            try:
                response = requests.get(url, params=params, timeout=10)

                if response.status_code != 200:
                    print(f"Error on {current_date.strftime('%Y-%m-%d')} page {page}: {response.status_code}")
                    if response.status_code == 429:
                        print("Rate limit reached. Please wait before making more requests.")
                    break

                data = response.json()

                for article in data.get("articles", []):
                    if article.get("title") and article.get("description"):
                        # Combine all available text for better content
                        content = article.get("content", "")
                        description = article.get("description", "")

                        # Use description if content is too short or truncated
                        full_text = content if content and len(content) > len(description) else description

                        articles.append({
                            "date": article["publishedAt"][:10] if article.get("publishedAt") else "",
                            "source": article["source"]["name"] if article.get("source") else "Unknown",
                            "title": article["title"],
                            "description": description,
                            "content": full_text,
                            "url": article.get("url", "")
                        })

                time.sleep(0.5)  # Rate limiting

            except Exception as e:
                print(f"Error fetching articles: {e}")
                continue

        current_date = next_date

    return articles


def add_article_to_json_server(article):
    """
    Add a single article to the JSON server with full scraped content.

    Returns (posted_successfully, tariff_result), where tariff_result is
    None unless the agentic step decided a tariff lookup was warranted.
    """
    try:
        print(f"Processing: {article['title'][:60]}...")

        # Try to scrape full article content
        full_content = scrape_full_article(article['url'])

        if full_content:
            print(f"  OK: scraped full article ({len(full_content)} characters)")
            body_text = full_content
        else:
            print(f"  FAIL: could not scrape, using API preview")
            # Fallback to combining description and content from API
            clean_body = clean_content(article['content'])
            clean_description = clean_content(article['description'])
            clean_body = clean_body.rstrip('...').strip()
            clean_description = clean_description.rstrip('...').strip()

            if clean_description and clean_body:
                if clean_description not in clean_body:
                    body_text = f"{clean_description}\n\n{clean_body}"
                else:
                    body_text = clean_body
            else:
                body_text = clean_body or clean_description or "Content not available."

        # Classify the article using OpenAI
        text_for_classification = f"{article['title']} {article['description']} {body_text[:500]}"
        category = classify_with_openai(text_for_classification)
        print(f"  -> Categorized as: {category}")

        # Prepare blog post with full content
        blog_post = {
            "title": article["title"],
            "description": clean_content(article['description']),
            "body": body_text,
            "category": category,
            "source": article["source"],
            "link": article["url"],
            "date": article["date"]
        }

        # Post to JSON server
        response = requests.post(JSON_SERVER_URL, json=blog_post, timeout=5)
        posted_successfully = response.status_code == 201

        # ---- Agentic step: decide whether this article warrants a tariff lookup ----
        # The result is handed back to the caller (and on to the frontend as a
        # notification) rather than written to output.json.
        tariff_result = None
        if posted_successfully:
            tariff_result = run_tariff_agent(article["title"], body_text)
            if tariff_result:
                tariff_result["blog_id"] = response.json().get("id")

        return posted_successfully, tariff_result

    except Exception as e:
        print(f"Error adding article to JSON server: {e}")
        return False, None


@app.route('/api/search-news', methods=['POST'])
def search_news():
    """API endpoint to search news and add to JSON server"""
    try:
        data = request.json
        topic = data.get('topic')
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        pages = data.get('pages', 1)

        # Validate inputs
        if not all([topic, from_date, to_date]):
            return jsonify({"error": "Missing required fields"}), 400

        # Fetch articles
        print(f"Fetching articles for topic: {topic}")
        articles = fetch_news_articles(topic, from_date, to_date, pages)

        if not articles:
            return jsonify({"error": "No articles found", "articles_added": 0}), 404

        # Add articles to JSON server
        articles_to_process = articles[:2]  # Limit to avoid overwhelming
        print(f"Adding {len(articles_to_process)} articles to JSON server (out of {len(articles)} found)...")
        added_count = 0
        tariff_lookups = []

        for article in articles_to_process:
            posted, tariff_result = add_article_to_json_server(article)
            if posted:
                added_count += 1
            if tariff_result:
                tariff_lookups.append(tariff_result)
            time.sleep(0.5)  # Increased delay to be respectful to source websites

        return jsonify({
            "success": True,
            "articles_found": len(articles),
            "articles_added": added_count,
            # Transient: the frontend flashes these as notifications, nothing
            # is persisted server-side.
            "tariff_lookups": tariff_lookups
        }), 200

    except Exception as e:
        print(f"Error in search_news endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    print("Starting Flask server...")
    print("Using OpenAI ChatGPT API for article classification")
    print("Using OpenAI function calling for agentic tariff lookups (USITC HTS API)")
    print("Using newspaper3k library for full article scraping")
    print("Make sure you have installed: pip install newspaper3k lxml_html_clean openai")
    print("Make sure JSON servers are running on http://localhost:8000 (blogs) and http://localhost:8001 (outputs)")
    app.run(debug=True, port=5001)