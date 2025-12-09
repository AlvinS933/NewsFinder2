# News Blog Application

A full-stack news aggregation and blogging platform built with React, Flask, and integrated AI capabilities. This application allows users to view, create, and manage news articles with automatic categorization, and includes an agentic simulator for article analysis.

## Features

- **News Aggregation**: Automatically fetch and categorize news articles from NewsAPI
- **AI-Powered Classification**: Uses OpenAI's GPT-3.5 to automatically categorize articles
- **Full Article Scraping**: Extracts complete article text using newspaper3k
- **Category Navigation**: Browse articles by topic (Politics, Economy, Technology, Health, Entertainment, etc.)
- **Agentic Simulator**: Analyze articles with AI-powered insights
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
- OpenAI API for text classification
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
cd news-blog
```

### 2. Frontend Setup

```bash
npm install
```

### 3. Backend Setup

```bash
pip install flask flask-cors requests newspaper3k beautifulsoup4 openai
```

### 4. Configure API Keys

Edit `news_api_server.py` and replace the API keys:

```python
NEWSAPI_KEY = 'your_newsapi_key_here'
OPENAI_API_KEY = 'your_openai_key_here'
```

## Running the Application

You need to run three servers simultaneously:

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

The Flask server will run on `http://localhost:5000`

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
│   ├── Simulator.js          # Agentic simulator interface
│   ├── useFetch.js           # Custom hook for data fetching
│   ├── NotFound.js           # 404 page
│   └── index.css             # Global styles
├── news_api_server.py        # Flask backend server
├── db.json                   # Blog data storage
├── output.json               # Simulator outputs storage
├── package.json              # Node dependencies
└── README.md                 # This file
```

## API Endpoints

### Flask Backend (`http://localhost:5000`)

- `POST /api/search-news` - Search and add news articles
  ```json
  {
    "topic": "string",
    "from_date": "YYYY-MM-DD",
    "to_date": "YYYY-MM-DD",
    "pages": 1
  }
  ```
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

The application features a modern dark theme with:
- Gradient backgrounds (blue to purple)
- Smooth hover animations
- Responsive design
- Custom scrollbars
- Glassmorphism effects

## Known Limitations

- NewsAPI has rate limits (check their documentation)
- Article scraping may fail on some websites
- OpenAI API costs apply per classification
- Maximum 50 articles per search operation

## Future Enhancements

- User authentication
- Bookmarking functionality
- Advanced search filters
- Article recommendations
- Social sharing features
- Comment system

## Troubleshooting

### Port conflicts
If ports 3000, 5000, 8000, or 8001 are in use, modify the port numbers in the respective configuration files.

### CORS errors
Ensure Flask-CORS is properly installed and configured in `news_api_server.py`.

### Missing articles
Check that both JSON servers are running and the db.json file exists.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- NewsAPI for