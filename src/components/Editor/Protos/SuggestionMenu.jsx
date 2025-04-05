
import React, { useState, useEffect } from 'react';

const SuggestionMenu = ({ suggestions }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        setActiveSuggestion((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        setInputValue(filteredSuggestions[activeSuggestion]);
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSuggestions, filteredSuggestions, activeSuggestion]);

  const handleInputChange = (e) => {
    const userInput = e.target.value;
    setInputValue(userInput);

    const filtered = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
    setActiveSuggestion(0);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-64">
      {/* Input Field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type something..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue && (
        <ul className="absolute w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-2 cursor-pointer ${
                index === activeSuggestion
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export  {SuggestionMenu};