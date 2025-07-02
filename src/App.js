import React, { useState, useCallback } from 'react';
import './App.css';

const App = () => {
  const [description, setDescription] = useState('');
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generateGreeting = useCallback(async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    setGreeting('');
    setCopied(false);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }
      
      const { greeting } = await response.json();
      setGreeting(greeting);
      
    } catch (error) {
      setError(error.message || 'Неизвестная ошибка при генерации поздравления');
      console.error('Ошибка генерации:', error);
    } finally {
      setLoading(false);
    }
  }, [description]);

  const copyToClipboard = useCallback(async () => {
    if (!greeting) return;
    
    try {
      await navigator.clipboard.writeText(greeting);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setError('Не удалось скопировать текст');
      console.error('Ошибка копирования:', error);
    }
  }, [greeting]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Поздравь коллегу с днём рождения!</h1>
      
      <div className="input-section">
        <label htmlFor="description" className="input-label">
          Опишите коллегу:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Пример: Маркетолог Анна, 30 лет, любит путешествия и фотографию"
          rows={5}
          className={`text-input ${error ? 'input-error' : ''}`}
          disabled={loading}
        />
      </div>
      
      <div className="action-section">
        <button 
          onClick={generateGreeting}
          disabled={loading || !description.trim()}
          className={`generate-button ${loading ? 'button-loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span> Генерируем...
            </>
          ) : 'Создать поздравление'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {greeting && (
        <div className="result-container">
          <h2 className="result-title">Ваше поздравление:</h2>
          <div className="greeting-text">
            {greeting}
          </div>
          
          <div className="copy-section">
            <button 
              onClick={copyToClipboard}
              disabled={copied}
              className={`copy-button ${copied ? 'button-copied' : ''}`}
            >
              {copied ? '✓ Скопировано!' : 'Скопировать в буфер'}
            </button>
          </div>
        </div>
      )}
      
      {!greeting && !loading && (
        <div className="instructions">
          <h3>Как использовать:</h3>
          <ol className="steps-list">
            <li>Опишите коллегу в поле ввода</li>
            <li>Нажмите "Создать поздравление"</li>
            <li>ИИ сгенерирует персонализированное поздравление</li>
            <li>Скопируйте текст кнопкой "Скопировать в буфер"</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default App;