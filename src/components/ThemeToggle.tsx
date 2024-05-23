'use client';
import { useState } from 'react';

const ThemeToggle = () => {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'colorful' : 'light';
    setMode(newMode);
    document.documentElement.classList.remove('light', 'dark', 'colorful');
    document.documentElement.classList.add(newMode);
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {mode === 'light' ? 'Dark Mode' : mode === 'dark' ? 'Colorful Mode' : 'Light Mode'}
    </button>
  );
};

export default ThemeToggle;
