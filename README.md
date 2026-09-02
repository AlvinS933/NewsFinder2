# News Blog Application

A full-stack news aggregation and blogging platform built with React, Flask, and integrated AI capabilities. This application allows users to view, create, and manage news articles with automatic categorization, and includes an agentic simulator for article analysis.

## Features

- **News Aggregation**: Automatically fetch and categorize news articles from NewsAPI
- **AI-Powered Classification**: Uses the OpenAI API to automatically categorize articles
- **Agentic Tariff Lookup**: The model reads each imported article and decides on its own whether to call a real external tariff API — results surface as a transient notification overlay in the UI (see [Agentic Tariff Lookup](#agentic-tariff-lookup))
- **Full Article Scraping**: Extracts complete article text using newspaper3k
- **Category Navigation**: Browse articles by topic (Politics, Economy, Technology, Health, Entertainment, etc.) and by searchable titles
- **Bilingual UI**: English / Chinese, toggled from the navbar
- **Agentic Simulator (Future feature)**: Analyze articles with AI-powered insights
- **CRUD Operations**: Create, read, update, and delete blog posts
- **Responsive Design**: Modern, gradient-based UI with smooth animations

## Tech Stack

### Frontend
- React 19.2.0
- React Router DOM 5.3.4
- Modern CSS with gradient designs

### Backend
- Flask (Python)
- Flask-CORS for cross-origin requests
- OpenAI API for text classification and function calling (the agentic step)
- USITC Harmonized Tariff Schedule API for live duty rates (no key required)
- newspaper3k for article extraction
- BeautifulSoup4 for HTML parsing

### Data Storage
- JSON Server (port 8000) for blog storage
- Separate JSON Server (port 8001) for simulator outputs

## Prerequisites

- Node.js and npm
- Python 3.7+
- OpenAI API key
- NewsAPI key

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

### 2. Frontend Setup

```bash
npm install
```

### 3. Backend Setup

```bash
pip install flask flask-cors requests newspaper3k beautifulsoup4 openai python-dotenv
```

### 4. Configure API Keys

Keys are read from environment variables — **never** paste them into a source file.

```bash
cp .env.example .env
```

Then edit `.env` and fill in your keys:

```
NEWSAPI_KEY=your_newsapi_key_here
OPENAI_API_KEY=your_openai_key_here
```

`.env` is listed in `.gitignore`, so it is never committed. `.env.example` is
committed and documents the required variables without containing any values.
The Flask server refuses to start with a clear error if either key is missing.

> These keys are used **only** by the Flask backend. Never put a secret in a
> `REACT_APP_*` variable — Create React App inlines those into the JavaScript
> bundle that ships to every visitor's browser.

### Secret-handling checklist

This repo is **public**, so the guarantees below matter. All four were verified
by scanning the working tree and the full commit history:

| Check | Status |
| --- | --- |
| `.env` ignored by git (`.gitignore` also ignores `.env.*`, with `!.env.example` re-included) | Yes |
| `.env` ever committed, on any branch, at any point in history | No — only `.env.example` was ever added |
| Key-shaped strings (`sk-…`, 32-hex API keys, inline `apiKey=`) in tracked files or history | None found |
| Secrets reachable from the browser bundle (`REACT_APP_*`, hard-coded keys in `src/`) | None — keys stay server-side |

To re-run the history scan yourself:

```bash
# any file that ever looked like an env file
git log --all --diff-filter=A --name-only -- .env "*.env" ".env.*"

# key-shaped strings anywhere in history
git log --all -p | grep -nE "sk-[A-Za-z0-9_-]{20,}|(NEWSAPI|OPENAI)_API_KEY\s*=\s*\S+"
```

If a key is ever pasted into a committed file, rotate it at the provider first
— rewriting history does not un-leak a key that was already pushed.

## Running the Application

You need to run four processes simultaneously:

### 1. Start JSON Server (Blog Data)

```bash
npx json-server --watch data/db.json --port 8000
```

### 2. Start JSON Server (Simulator Outputs)

```bash
npx json-server --watch data/output.json --port 8001
```

### 3. Start Flask Backend

```bash
python news_api_server.py
```

The Flask server will run on `http://localhost:5001`

### 4. Start React Frontend

```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
news-blog/
├── public/
├── src/
│   ├── App.js                 # Main application component
│   ├── Navbar.js             # Navigation bar
│   ├── Home.js               # Home page with category navigation
│   ├── Create.js             # Create new articles
│   ├── NewsDetails.js        # Article detail view
│   ├── NewsList.js           # Article list component
│   ├── SearchNews.js         # Search and add news from API
│   ├── TariffNotifications.js # Transient overlay for agentic tariff results
│   ├── Simulator.js          # Agentic simulator interface
│   ├── LanguageContext.js    # EN/ZH translation provider
│   ├── useFetch.js           # Custom hook for data fetching
│   ├── NotFound.js           # 404 page
│   ├── index.css             # Global styles (dark theme)
│   └── indexlight.css        # Global styles (light theme — the one imported by index.js)
├── data/
│   ├── db.json               # Blog data storage (port 8000)
│   └── output.json           # Simulator outputs storage (port 8001)
├── news_api_server.py        # Flask backend server
├── .env.example              # Documents required env vars (no values)
├── package.json              # Node dependencies
└── README.md                 # This file
```

To switch themes, change which stylesheet `src/index.js` imports.

## API Endpoints

### Flask Backend (`http://localhost:5001`)

- `POST /api/search-news` - Search and add news articles

  Request:
  ```json
  {
    "topic": "string",
    "from_date": "YYYY-MM-DD",
    "to_date": "YYYY-MM-DD",
    "pages": 1
  }
  ```

  Response — `tariff_lookups` holds any agentic tariff results for this batch.
  It is **not persisted anywhere**; the frontend flashes it as a notification
  overlay and it is gone:
  ```json
  {
    "success": true,
    "articles_found": 37,
    "articles_added": 2,
    "tariff_lookups": [
      {
        "article_title": "Commerce Department raises duties on Chinese steel",
        "blog_id": "14",
        "triggered": true,
        "keyword": "steel",
        "status": "ok",
        "tariff_data": "Granulated slag … | General duty rate: Free || …",
        "records": [
          {
            "description": "Granulated slag (slag sand) from the manufacture of iron or steel",
            "general_rate": "Free",
            "notes": ["Section 232 (steel/aluminum) tariff applies"]
          }
        ],
        "timestamp": "2026-09-02T21:10:07+00:00"
      }
    ]
  }
  ```
  `status` is `ok`, `empty` (keyword matched nothing), or `error` (USITC
  unreachable); the overlay colors its left border accordingly.

- `GET /api/health` - Health check endpoint

### JSON Server (`http://localhost:8000`)

- `GET /blogs` - Get all blog posts
- `GET /blogs/:id` - Get specific blog post
- `POST /blogs` - Create new blog post
- `DELETE /blogs/:id` - Delete blog post

### JSON Server (`http://localhost:8001`)

- `GET /outputs` - Get simulator outputs

## Features in Detail

### News Search and Import
- Search news by topic and date range
- Automatically scrapes full article content
- AI-powered categorization using OpenAI
- Handles up to 50 articles per search

### Agentic Tariff Lookup

Every article imported through `/api/search-news` passes through an agentic
step in `news_api_server.py`. This is the part of the pipeline where the model
makes a decision and takes a real external action, rather than just returning
text:

1. **Keyword gate** (`article_mentions_trade`) — if the article contains none
   of the terms in `TARIFF_TRIGGER_TERMS` (`tariff`, `import dut…`,
   `anti-dumping`, `section 301`, `section 232`, `trade war`, …), the model is
   never called. Cheap, and keeps the overlay quiet on unrelated news.
2. **Model decision** (`run_tariff_agent`) — articles that clear the gate go to
   the model with `lookup_tariff` exposed as a function. The model decides
   whether a duty-rate lookup would tell the reader anything, and picks the
   keyword. Tariff diplomacy and country-level trade disputes count even when
   no single good is named — it then looks up the commodity most central to the
   dispute. It declines when `tariff` is being used in the utility/electricity
   sense, or is a stray word with no trade subject.
3. **Real tool call** (`lookup_tariff`) — hits the public USITC Harmonized
   Tariff Schedule API and returns the top 3 matching commodity lines with
   their general duty rate, flagging Section 301 / Section 232 exposure.
4. **Transient notification** — the result rides back on the
   `/api/search-news` response and `src/TariffNotifications.js` renders it as a
   toast stack in the top-right corner. Each toast auto-dismisses after ~12s
   (staggered) with a draining progress bar, or on clicking ×. Nothing is
   written to `data/output.json` or any other store. On the Search page the redirect
   home waits until the last toast is gone, so notifications are never
   unmounted before they can be read.

**Tuning how often it fires** — three dials, in increasing bluntness:

| Dial | Location | Effect |
| --- | --- | --- |
| `TARIFF_TRIGGER_TERMS` | `news_api_server.py` | Which articles the model even sees. Add terms to widen, remove to narrow. |
| `lookup_tariff` tool description + the prompt in `run_tariff_agent` | `news_api_server.py` | Where the model draws the line on borderline articles. |
| `TARIFF_TOOL_CHOICE` | `news_api_server.py` | `"auto"` (default) leaves the decision to the model. `"required"` forces a lookup on every article that clears the gate — the model then only picks the keyword. |

Every decision is logged to the Flask console, including the model's one-line
reason when it declines:

```
-> [Agentic] Skipped (no tariff language): "Lakers beat Celtics in overtime thriller"
-> [Agentic] No tariff lookup needed for: "State regulator approves new electricity" | Model said: "tariff" is being used in the utility pricing sense, not import duty.
-> [Agentic] Tariff lookup triggered for keyword: 'steel'
-> [Tariff data] Granulated slag (slag sand) from the manufacture of iron or steel | General duty rate: Free || …
```

### Category System
- Politics
- Economy
- Technology
- Health
- Sports
- Entertainment
- Environment
- Education
- Crime
- International

### Agentic Simulator
- Input article data (title, source, text, URL, date)
- Generate AI-powered analysis
- View simulated transcripts, actions, and shared facts

## Styling

Two complete stylesheets ship with the app — `src/indexlight.css` (light, the
default imported by `src/index.js`) and `src/index.css` (dark). Both provide:
- Gradient backgrounds
- Smooth hover animations
- Responsive design
- Custom scrollbars
- Glassmorphism effects

## Known Limitations

- NewsAPI has rate limits (check their documentation)
- Article scraping may fail on some websites
- OpenAI API costs apply per classification, plus one call per article that
  clears the tariff keyword gate
- `/api/search-news` currently processes only the first 2 articles per search
  (`articles_to_process` in `news_api_server.py`) to keep scraping and model
  costs down, even though the search itself may find many more
- The USITC search is a literal text matcher with no understanding of brand
  names or multi-word qualifiers — it scores each word separately, so
  `hot-rolled steel` can match "hot red peppers". The tool description steers
  the model toward plain commodity nouns, but occasional irrelevant commodity
  lines are inherent to the upstream API
- Tariff notifications are deliberately ephemeral — once dismissed, a result
  is gone, since nothing is written to disk

## Future Enhancements

- User authentication
- Bookmarking functionality
- Advanced search filters
- Article recommendations
- Social sharing features
- Comment system

## Troubleshooting

### Port conflicts
If ports 3000, 5001, 8000, or 8001 are in use, modify the port numbers in the respective configuration files.

### CORS errors
Ensure Flask-CORS is properly installed and configured in `news_api_server.py`.

### Missing articles
Check that both JSON servers are running and the `data/db.json` file exists.

### No tariff notifications appear
Check the Flask console — every article logs its agentic decision. A
`Skipped (no tariff language)` line means the keyword gate filtered it out; a
`No tariff lookup needed` line means the model declined and prints its reason.
See [Tuning how often it fires](#agentic-tariff-lookup) to adjust either.

### Server refuses to start
`Missing required environment variable(s): …` means `.env` is absent or
incomplete. Run `cp .env.example .env`, fill in both keys, and make sure
`python-dotenv` is installed (otherwise export the variables in your shell).

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [NewsAPI](https://newsapi.org/) for article search and metadata
- [OpenAI](https://platform.openai.com/) for classification and function calling
- [USITC](https://hts.usitc.gov/) for the public Harmonized Tariff Schedule API
- [newspaper3k](https://newspaper.readthedocs.io/) for full-text article extraction
- [json-server](https://github.com/typicode/json-server) for the zero-setup REST backends
