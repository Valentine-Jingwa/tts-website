'use client';
import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [mode, setMode] = useState('light');

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    let newMode;
    if (value === 0) {
      newMode = 'light';
    } else if (value === 1) {
      newMode = 'dark';
    } else {
      newMode = 'colorful';
    }
    setMode(newMode);
    document.documentElement.classList.remove('light', 'dark', 'colorful');
    document.documentElement.classList.add(newMode);
  };

  useEffect(() => {
    document.documentElement.classList.add(mode);
  }, []);

  return (
    <div className="theme-toggle-container">
      <input
        type="range"
        min="0"
        max="2"
        step="1"
        value={mode === 'light' ? 0 : mode === 'dark' ? 1 : 2}
        onChange={handleSliderChange}
        className="theme-toggle-slider"
      />
      <div className="theme-toggle-labels">
        <span>Light</span>
        <span>Dark</span>
        <span>Colorful</span>
      </div>
    </div>
  );
};

export default ThemeToggle;
