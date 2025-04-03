import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleResultFetch = (data) => {
        setResult(data);
        setError('');
    };

    const handleError = (errorMessage) => {
        setResult(null);
        setError(errorMessage);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>Engineering Students Results</h1>
            </header>
            <main className="main-content">
                <div className="container">
                    <SearchForm onResult={handleResultFetch} onError={handleError} />
                    {error && <div className="error-message">{error}</div>}
                    {result && <ResultsDisplay result={result} />}
                </div>
            </main>
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Engineering Results. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;
