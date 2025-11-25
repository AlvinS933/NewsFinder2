import {Link} from 'react-router-dom';
const Navbar = () => {
    return ( 
        <nav className="navbar">
            <h1>News Collection</h1>
            <div className="links">
                <Link to="/">Home</Link>
                <Link to="/simulator">AGENTIC SIMULATOR</Link>
                <Link to="/create" style ={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",                    color: "white",
                    borderRadius: "8px"
                }}>New Post</Link>
                <Link to="/search"style ={{
                    color: "white",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    borderRadius: "8px"
                }}>Search/Add</Link>
                
            </div>
            
        </nav>
            
     );
}
 
export default Navbar;