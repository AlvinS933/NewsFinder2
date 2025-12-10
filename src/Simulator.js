import { useState } from "react";
import useFetch from './useFetch';
import { useLanguage } from './LanguageContext';

const Simulator = () => {
    const { t } = useLanguage();
    const {data: outputData, isPending, error} = useFetch('http://localhost:8001/outputs');
    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");
    const [articleText, setArticleText] = useState("");
    const [url, setUrl] = useState("");
    const [date, setDate] = useState("");
    const [language, setLanguage] = useState("english");
    const [contextText, setContextText] = useState("");
    
    const handleClear = () => {
        setTitle("");
        setSource("");
        setArticleText("");
        setUrl("");
        setDate("");
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({title, source, articleText, url, date});
    }

    return (
        <div>
            <div className="simulatorInputs">
                <h2>{t('inputArticleData')}</h2>
                <form onSubmit={handleSubmit}>
                    <label>{t('title')}</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    <label>{t('source')}</label>
                    <input type="text" value={source} onChange={(e) => setSource(e.target.value)}/>
                    <label>{t('articleText')}</label>
                    <textarea value={articleText} onChange={(e) => setArticleText(e.target.value)}/>
                    <label>{t('url')}</label>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
                    <label>{t('date')}</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <label>{t('language')}</label>
                    <div className="language-toggle">
                        <label>
                            <input 
                                type="radio" 
                                value="english" 
                                checked={language === "english"} 
                                onChange={(e) => setLanguage(e.target.value)}
                            />
                            <span>{t('english')}</span>
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                value="chinese" 
                                checked={language === "chinese"} 
                                onChange={(e) => setLanguage(e.target.value)}
                            />
                            <span>{t('chinese')}</span>
                        </label>
                    </div>
                    <label>{t('additionalContext')}</label>
                    <textarea value={contextText} onChange={(e) => setContextText(e.target.value)}/>
                    <div className="button-group">
                        <button className="clear-button" type="button" onClick={handleClear}>{t('clear')}</button>
                        <button type="submit">{t('submit')}</button>
                    </div>
                </form>
            </div>
            <div className="simulatorOutputs">
                <h2>{t('simulationResults')}</h2>
                {isPending && <div>{t('loadingOutput')}</div>}
                {error && <div>{t('errorLoading')} {error}</div>}
                {outputData && (
                    <form>
                        <label>{t('simulatedTranscript')}</label>
                        <textarea 
                            readOnly 
                            value={outputData.transcript || t('noTranscript')} 
                        />
                        <label>{t('simulatedActions')}</label>
                        <textarea 
                            readOnly 
                            value={outputData.actions || t('noActions')} 
                        />
                        <label>{t('sharedFacts')}</label>
                        <textarea 
                            readOnly 
                            value={outputData.shared_facts || t('noSharedFacts')} 
                        />
                        <label>{t('rawJson')}</label>
                        <textarea 
                            readOnly 
                            value={JSON.stringify(outputData, null, 2)} 
                        />
                    </form>
                )}
            </div>
        </div>
    );
};

export default Simulator;