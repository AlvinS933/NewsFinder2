import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const SearchNews = () => {
    const { t } = useLanguage();
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

            setMessage(`${t('successAdded')} ${data.articles_added} ${t('articlesDb')}`);
            setIsPending(false);

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
            <h2>{t('searchAndAddNews')}</h2>
            <form onSubmit={handleSubmit}>
                <label>{t('searchTopic')}</label>
                <input
                    type="text"
                    required
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    placeholder={t('topicPlaceholder')}
                />
                
                <label>{t('fromDate')}</label>
                <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                
                <label>{t('toDate')}</label>
                <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
                
                <label>{t('numPages')}</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                />
                
                {!isPending && <button>{t('searchAddNewsBtn')}</button>}
                {isPending && <button disabled>{t('searchingAdding')}</button>}
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
                    {t('error')} {error}
                </div>
            )}
        </div>
    );
};

export default SearchNews;