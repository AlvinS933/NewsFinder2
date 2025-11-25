import { useState } from 'react';
import { useHistory } from 'react-router-dom';
const Create = () => {
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
            //history.go(-1);
            history.push('/');
        })
    }
    return (
        <div className="create">
            <h2>Add More News/Articles</h2>
            <form onSubmit={handleSubmit}>
                <label>News title:</label>
                <input 
                    type="text" 
                    required
                    value = {title}
                    onChange = {(e) => setTitle(e.target.value)}
                />
                <label>News body:</label>

                <textarea 
                    required 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)}
                ></textarea>
                <label>News Category:</label>

                <select value = {category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="economy">economy</option>
                    <option value="technology">technology</option>
                    <option value="health">health</option>
                    <option value="entertainment">entertainment</option>
                    <option value="environment">environment</option>
                    <option value="education">education</option>
                    <option value="unknown">unknown</option>
                </select>
                {!isPending && <button>Add News</button>}
                {isPending && <button disabled>Adding News...</button>}
            </form>
        </div>
    );
}
export default Create