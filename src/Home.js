import NewsList from './NewsList';
import useFetch from './useFetch';
import { useRef } from 'react';
import { useLanguage } from './LanguageContext';

const Home = () => {
    const { t } = useLanguage();
    const {data:blogs, isPending, error} = useFetch('http://localhost:8000/blogs');
    
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
        { name: t('allNews'), ref: allNewsRef, filter: null },
        { name: t('politics'), ref: politicsRef, filter: 'politics' },
        { name: t('economy'), ref: economyRef, filter: 'economy' },
        { name: t('technology'), ref: technologyRef, filter: 'technology' },
        { name: t('health'), ref: healthRef, filter: 'health' },
        { name: t('entertainment'), ref: entertainmentRef, filter: 'entertainment' },
        { name: t('environment'), ref: environmentRef, filter: 'environment' },
        { name: t('education'), ref: educationRef, filter: 'education' }
    ];

    return ( 
        <div className="home-container">
            <div className="category-nav">
                <h3>{t('categories')}</h3>
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
                {isPending && <div>{t('loading')}</div>}
                
                <div ref={allNewsRef}>
                    {blogs && <NewsList blogs={blogs} title={t('allNews') + ":"} />}
                </div>
                
                <div ref={politicsRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "politics")} title={t('politicsNews')} />}
                </div>
                
                <div ref={economyRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "economy")} title={t('economyNews')} />}
                </div>
                
                <div ref={technologyRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "technology")} title={t('technologyNews')} />}
                </div>
                
                <div ref={healthRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "health")} title={t('healthNews')} />}
                </div>
                
                <div ref={entertainmentRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "entertainment")} title={t('entertainmentNews')} />}
                </div>
                
                <div ref={environmentRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "environment")} title={t('environmentNews')} />}
                </div>
                
                <div ref={educationRef}>
                    {blogs && <NewsList blogs={blogs.filter((blog)=>blog.category === "education")} title={t('educationNews')} />}
                </div>
            </div>
        </div>
    );
}
 
export default Home;