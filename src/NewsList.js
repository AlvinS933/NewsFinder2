import { Link } from 'react-router-dom';
const NewsList = (props) => {
    const blogs = props.blogs;
    const title = props.title;
    //const handleDelete = props.handleDelete;
    return ( 
        <div className="blog-list">
            <h1>{title}</h1>
            {blogs.map((blog)=>(
                <div className = "blog-preview" key = {blog.id}>
                    <Link to={`/blogs/${blog.id}`}>
                        <h2>{ blog.title }</h2>
                        <p>Category: { blog.category }</p>
                    </Link>
                    {/*<button onClick={() => handleDelete(blog.id)}>delete blog</button>*/}
                </div>
            ))}
        </div>
     );
}
 
export default NewsList;