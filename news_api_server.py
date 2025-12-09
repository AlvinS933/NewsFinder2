from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import time
import re
from newspaper import Article
from bs4 import BeautifulSoup
import os
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# NewsAPI Configuration
NEWSAPI_KEY = ''
JSON_SERVER_URL = 'http://localhost:8000/blogs'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def classify_with_openai(text):
    """
    Use OpenAI's ChatGPT API for topic classification
    Get API key at: https://platform.openai.com/api-keys
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-4" for better accuracy
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
            max_tokens=10
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
    """Add a single article to the JSON server with full scraped content"""
    try:
        print(f"Processing: {article['title'][:60]}...")
        
        # Try to scrape full article content
        full_content = scrape_full_article(article['url'])
        
        if full_content:
            print(f"  ✓ Scraped full article ({len(full_content)} characters)")
            body_text = full_content
        else:
            print(f"  ✗ Could not scrape, using API preview")
            # Fallback to combining description and content from API
            clean_body = clean_content(article['content'])
            clean_description = clean_content(article['description'])
            clean_body = clean_body.rstrip('…').strip()
            clean_description = clean_description.rstrip('…').strip()
            
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
        print(f"  → Categorized as: {category}")
        
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
        return response.status_code == 201
        
    except Exception as e:
        print(f"Error adding article to JSON server: {e}")
        return False

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
        print(f"Adding {len(articles)} articles to JSON server...")
        added_count = 0
        
        for article in articles[:50]:  # Limit to 50 articles to avoid overwhelming
            if add_article_to_json_server(article):
                added_count += 1
            time.sleep(0.5)  # Increased delay to be respectful to source websites
        
        return jsonify({
            "success": True,
            "articles_found": len(articles),
            "articles_added": added_count
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
    print("Using newspaper3k library for full article scraping")
    print("Make sure you have installed: pip install newspaper3k lxml_html_clean openai")
    print("Make sure JSON server is running on http://localhost:8000")
    app.run(debug=True, port=5000)