import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const SearchNews = () => {
    const [searchTopic, setSearchTopic] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pages, setPages] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPending(true);
        setMessage('');
        setError('');

        try {
            // Call your Python backend endpoint
            const response = await fetch('http://localhost:5000/api/search-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: searchTopic,
                    from_date: fromDate,
                    to_date: toDate,
                    pages: parseInt(pages)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw Error(data.error || 'Failed to fetch news');
            }

            setMessage(`Successfully added ${data.articles_added} articles to the database!`);
            setIsPending(false);

            // Optionally redirect to home after 2 seconds
            setTimeout(() => {
                history.push('/');
            }, 2000);

        } catch (err) {
            setError(err.message);
            setIsPending(false);
        }
    };

    return (
        <div className="create">
            <h2>Search and Add News</h2>
            <form onSubmit={handleSubmit}>
                <label>Search Topic:</label>
                <input
                    type="text"
                    required
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    placeholder="e.g., Trump, Climate Change, AI"
                />
                
                <label>From Date:</label>
                <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                
                <label>To Date:</label>
                <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
                
                <label>Number of Pages (1-5):</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                />
                
                {!isPending && <button>Search & Add News</button>}
                {isPending && <button disabled>Searching and Adding News...</button>}
            </form>

            {message && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    backgroundColor: '#d4edda', 
                    color: '#155724',
                    borderRadius: '4px' 
                }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24',
                    borderRadius: '4px' 
                }}>
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default SearchNews;