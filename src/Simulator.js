import { useState } from "react";
import useFetch from './useFetch';

const Simulator = () => {
    const {data: outputData, isPending, error} = useFetch('http://localhost:8001/outputs');
    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");
    const [articleText, setArticleText] = useState("");
    const [url, setUrl] = useState("");
    const [date, setDate] = useState("");
    
    const handleClear = () => {
        setTitle("");
        setSource("");
        setArticleText("");
        setUrl("");
        setDate("");
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your submit logic here
        console.log({title, source, articleText, url, date});
    }

    return (
        <div>
            <div className="simulatorInputs">
                <h2>Input Article Data</h2>
                <form onSubmit={handleSubmit}>
                    <label>Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    <label>Source:</label>
                    <input type="text" value={source} onChange={(e) => setSource(e.target.value)}/>
                    <label>Article Text:</label>
                    <textarea value={articleText} onChange={(e) => setArticleText(e.target.value)}/>
                    <label>URL:</label>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
                    <label>Date:</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <div className="button-group">
                        <button className="clear-button" type="button" onClick={handleClear}>CLEAR</button>
                        <button type="submit">SUBMIT</button>
                    </div>
                </form>
            </div>
            <div className="simulatorOutputs">
                <h2>Simulation Results</h2>
                {isPending && <div>Loading output data...</div>}
                {error && <div>Error loading output: {error}</div>}
                {outputData && (
                    <form>
                        <label>Simulated Transcript:</label>
                        <textarea 
                            readOnly 
                            value={outputData.transcript || "No transcript data available"} 
                        />
                        <label>Simulated Actions:</label>
                        <textarea 
                            readOnly 
                            value={outputData.actions || "No actions data available"} 
                        />
                        <label>Shared Facts:</label>
                        <textarea 
                            readOnly 
                            value={outputData.shared_facts || "No shared facts available"} 
                        />
                        <label>Raw Json:</label>
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