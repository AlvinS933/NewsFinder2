import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const Create = () => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('economy');
    const [isPending, setIsPending] = useState(false);
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();
        const blog = { title, body, category };
        setIsPending(true);
        fetch('http://localhost:8000/blogs', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(blog)
        }).then(() => {
            console.log('new blog added');
            setIsPending(false);
            history.push('/');
        })
    }
    
    return (
        <div className="create">
            <h2>{t('addMoreNews')}</h2>
            <form onSubmit={handleSubmit}>
                <label>{t('newsTitle')}</label>
                <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label>{t('newsBody')}</label>
                <textarea 
                    required 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)}
                ></textarea>
                <label>{t('newsCategory')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="economy">{t('economy')}</option>
                    <option value="technology">{t('technology')}</option>
                    <option value="health">{t('health')}</option>
                    <option value="entertainment">{t('entertainment')}</option>
                    <option value="environment">{t('environment')}</option>
                    <option value="education">{t('education')}</option>
                    <option value="unknown">{t('unknown')}</option>
                </select>
                {!isPending && <button>{t('addNews')}</button>}
                {isPending && <button disabled>{t('addingNews')}</button>}
            </form>
        </div>
    );
}

export default Create;