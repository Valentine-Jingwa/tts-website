'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSmile, FaMeh, FaFrown, FaSkullCrossbones } from 'react-icons/fa';
import '@/styles/globals.css';

const GameStart = () => {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [sentenceCount, setSentenceCount] = useState(5);

  const handleStartGame = (difficulty: string) => {
    router.push(`/game/${difficulty}?theme=${theme}&count=${sentenceCount}`);
  };

  return (
    <div className="game-start-container">
      <h1>Select Difficulty</h1>
      <input
        type="text"
        placeholder="Enter a theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of sentences"
        value={sentenceCount}
        onChange={(e) => setSentenceCount(Number(e.target.value))}
      />
      <div className="difficulty-buttons">
        <button onClick={() => handleStartGame('easy')}>
          <FaSmile size={24} /> Easy
        </button>
        <button onClick={() => handleStartGame('normal')}>
          <FaMeh size={24} /> Normal
        </button>
        <button onClick={() => handleStartGame('hard')}>
          <FaFrown size={24} /> Hard
        </button>
        <button onClick={() => handleStartGame('hell')}>
          <FaSkullCrossbones size={24} /> Hell
        </button>
      </div>
    </div>
  );
};

export default GameStart;
