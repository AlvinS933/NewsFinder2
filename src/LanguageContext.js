import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navbar
    newsCollection: "News Collection",
    home: "Home",
    agenticSimulator: "AGENTIC SIMULATOR",
    newPost: "Insert Custom Article",
    searchAdd: "Search/Add",
    
    // Home page
    categories: "Categories",
    allNews: "All News",
    politics: "Politics",
    economy: "Economy",
    technology: "Technology",
    health: "Health",
    entertainment: "Entertainment",
    environment: "Environment",
    education: "Education",
    loading: "Loading...",
    politicsNews: "Politics News",
    economyNews: "Economy News",
    technologyNews: "Technology News",
    healthNews: "Health News",
    entertainmentNews: "Entertainment News",
    environmentNews: "Environment News",
    educationNews: "Education News",
    
    // Create page
    addMoreNews: "Add More News/Articles",
    newsTitle: "News title:",
    newsBody: "News body:",
    newsCategory: "News Category:",
    addNews: "Add News",
    addingNews: "Adding News...",
    unknown: "unknown",
    
    // Blog Details
    sourceFrom: "Source from:",
    link: "Link:",
    delete: "delete",
    category: "Category:",
    
    // Not Found
    sorry: "Sorry",
    pageNotExist: "The page you are looking for does not exist.",
    goBack: "Go back to the homepage...",
    
    // Search News
    searchAndAddNews: "Search and Add News",
    searchTopic: "Search Topic:",
    topicPlaceholder: "e.g., Trump, Climate Change, AI",
    fromDate: "From Date:",
    toDate: "To Date:",
    numPages: "Number of Pages (1-5):",
    searchAddNewsBtn: "Search & Add News",
    searchingAdding: "Searching and Adding News...",
    successAdded: "Successfully added",
    articlesDb: "articles to the database!",
    error: "Error:",
    
    // Simulator
    inputArticleData: "Input Article Data",
    title: "Title:",
    source: "Source:",
    articleText: "Article Text:",
    url: "URL:",
    date: "Date:",
    language: "Output Language:",
    english: "English",
    chinese: "Chinese (中文)",
    additionalContext: "Additional Context:",
    clear: "CLEAR",
    submit: "SUBMIT",
    simulationResults: "Simulation Results",
    loadingOutput: "Loading output data...",
    errorLoading: "Error loading output:",
    simulatedTranscript: "Simulated Transcript:",
    noTranscript: "No transcript data available",
    simulatedActions: "Simulated Actions:",
    noActions: "No actions data available",
    sharedFacts: "Shared Facts:",
    noSharedFacts: "No shared facts available",
    rawJson: "Raw Json:",
  },
  zh: {
    // Navbar
    newsCollection: "新聞集錦",
    home: "首頁",
    agenticSimulator: "代理模擬器",
    newPost: "自訂文章",
    searchAdd: "搜尋/新增",
    
    // Home page
    categories: "分類",
    allNews: "所有新聞",
    politics: "政治",
    economy: "經濟",
    technology: "科技",
    health: "健康",
    entertainment: "娛樂",
    environment: "環境",
    education: "教育",
    loading: "載入中...",
    politicsNews: "政治新聞",
    economyNews: "經濟新聞",
    technologyNews: "科技新聞",
    healthNews: "健康新聞",
    entertainmentNews: "娛樂新聞",
    environmentNews: "環境新聞",
    educationNews: "教育新聞",
    
    // Create page
    addMoreNews: "新增更多新聞/文章",
    newsTitle: "新聞標題：",
    newsBody: "新聞內容：",
    newsCategory: "新聞分類：",
    addNews: "新增新聞",
    addingNews: "新增中...",
    unknown: "未知",
    
    // Blog Details
    sourceFrom: "來源：",
    link: "連結：",
    delete: "刪除",
    category: "分類：",
    
    // Not Found
    sorry: "抱歉",
    pageNotExist: "您尋找的頁面不存在。",
    goBack: "返回首頁...",
    
    // Search News
    searchAndAddNews: "搜尋並新增新聞",
    searchTopic: "搜尋主題：",
    topicPlaceholder: "例如：川普、氣候變遷、人工智慧",
    fromDate: "起始日期：",
    toDate: "結束日期：",
    numPages: "頁數 (1-5)：",
    searchAddNewsBtn: "搜尋並新增新聞",
    searchingAdding: "搜尋並新增中...",
    successAdded: "成功新增",
    articlesDb: "篇文章到資料庫！",
    error: "錯誤：",
    
    // Simulator
    inputArticleData: "輸入文章資料",
    title: "標題：",
    source: "來源：",
    articleText: "文章內容：",
    url: "網址：",
    date: "日期：",
    language: "Output: 語言：",
    english: "英文",
    chinese: "中文",
    additionalContext: "額外資訊：",
    clear: "清除",
    submit: "提交",
    simulationResults: "模擬結果",
    loadingOutput: "載入輸出資料中...",
    errorLoading: "載入輸出錯誤：",
    simulatedTranscript: "模擬記錄：",
    noTranscript: "無記錄資料",
    simulatedActions: "模擬動作：",
    noActions: "無動作資料",
    sharedFacts: "共享事實：",
    noSharedFacts: "無共享事實",
    rawJson: "原始 Json：",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};