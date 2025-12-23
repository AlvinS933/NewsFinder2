import { useState, useRef, useEffect } from "react";
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

    // Movable window state
    const [windowPosition, setWindowPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const windowRef = useRef(null);
    
    const totalSteps = 10; // Define the total number of steps
    
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

    // Dragging handlers
    const handleMouseDown = (e) => {
        if (windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setIsDragging(true);
        }
    };
    
    const handleMouseMove = (e) => {
        if (isDragging) {
            setWindowPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);
    
    // Play/Pause functionality
    useEffect(() => {
        let interval;
        if (isPlaying && currentStep < totalSteps - 1) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= totalSteps - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep, totalSteps]);
    
    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
        setIsPlaying(false);
    };
    
    const handleNext = () => {
        setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1));
        setIsPlaying(false);
    };
    
    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div>
            <div className="simulatorInputs">
                <h2 style={{visibility: 'hidden'}}>{t('inputArticleData')}</h2>
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
                <h2 style={{visibility: 'hidden'}}>{t('simulationResults')}</h2>
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
            
            {/* Movable Control Window */}
            <div
                ref={windowRef}
                className={`movable-window ${isDragging ? 'dragging' : ''}`}
                style={{
                    left: `${windowPosition.x}px`,
                    top: `${windowPosition.y}px`
                }}
            >
                {/* Drag Handle */}
                <div className="window-header" onMouseDown={handleMouseDown}>
                    {t('simulationControls')}
                </div>
                
                {/* Step Display */}
                <div className="step-display">
                    Step {currentStep + 1} of {totalSteps}
                </div>
                
                {/* Progress Bar */}
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    />
                </div>
                
                {/* Control Buttons */}
                <div className="control-buttons">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="control-btn prev-btn"
                    >
                        {t('previous')}
                    </button>
                    
                    <button
                        onClick={handlePlayPause}
                        className={`control-btn play-pause-btn ${isPlaying ? 'playing' : ''}`}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    
                    <button
                        onClick={handleNext}
                        disabled={currentStep === totalSteps - 1}
                        className="control-btn next-btn"
                    >
                        {t('next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Simulator;