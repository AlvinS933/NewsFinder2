import {Link} from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const Navbar = () => {
    const { language, toggleLanguage, t } = useLanguage();
    
    return ( 
        <nav className="navbar">
            <h1>{t('newsCollection')}</h1>
            <div className="links">
                
                <Link to="/">{t('home')}</Link>
                <Link to="/simulator">{t('agenticSimulator')}</Link>
                <Link to="/create" style={{
                    background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",//"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    color: "white",
                    borderRadius: "8px"
                }}>{t('newPost')}</Link>
                <Link to="/search" style={{
                    color: "white",
                    background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",//"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    borderRadius: "8px"
                }}>{t('searchAdd')}</Link>
                <button 
                    onClick={toggleLanguage}
                    className="language-toggle-btn"
                    title={language === 'en' ? 'Switch to Chinese' : '切換至英文'}
                >
                    {language === 'en' ? 'Language: 中文' : 'Language: EN'}
                </button>
            </div>
        </nav>
    );
}
 
export default Navbar;