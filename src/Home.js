import NewsList from './NewsList';
import useFetch from './useFetch';
import { useRef } from 'react';

const Home = () => {
    const {data:blogs, isPending, error} = useFetch('http://localhost:8000/blogs');
    
    // Create refs for each category section
    const allNewsRef = useRef(null);
    const politicsRef = useRef(null);
    const economyRef = useRef(null);
    const technologyRef = useRef(null);
    const healthRef = useRef(null);
    const entertainmentRef = useRef(null);
    const environmentRef = useRef(null);
    const educationRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const categories = [
        { name: 'All News', ref: allNewsRef, filter: null },
        { name: 'Politics', ref: politicsRef, filter: 'politics' },
        { name: 'Economy', ref: economyRef, filter: 'economy' },
        { name: 'Technology', ref: technologyRef, filter: 'technology' },
        { name: 'Health', ref: healthRef, filter: 'health' },
        { name: 'Entertainment', ref: entertainmentRef, filter: 'entertainment' },
        { name: 'Environment', ref: environmentRef, filter: 'environment' },
        { name: 'Education', ref: educationRef, filter: 'education' }
    ];

    return ( 
        <div className="home-container">
            <div className="category-nav">
                <h3>Categories</h3>
                {categories.map((category) => (
                    <button
                        key={category.name}
                        onClick={() => scrollToSection(category.ref)}
                        className="category-button"
                    >
                        {category.name}
                    </button>
                ))}
            </div>
            
            <div className="home">
                {error && <div>{error}</div>}
                {isPending && <div>Loading...</div>}
                
                <div ref={allNewsRef}>
                    {blogs && <NewsList blogs={blogs} title={"All News:"} />}
                </div>
                
                <div ref={politicsRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "politics")} title={"Politics News"} />}
                </div>
                
                <div ref={economyRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "economy")} title={"Economy News"} />}
                </div>
                
                <div ref={technologyRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "technology")} title={"Technology News"} />}
                </div>
                
                <div ref={healthRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "health")} title={"Health News"} />}
                </div>
                
                <div ref={entertainmentRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "entertainment")} title={"Entertainment News"} />}
                </div>
                
                <div ref={environmentRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "environment")} title={"Environment News"} />}
                </div>
                
                <div ref={educationRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "education")} title={"Education News"} />}
                </div>
            </div>
        </div>
    );
}
 
export default Home;