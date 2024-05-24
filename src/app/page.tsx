'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import TextToSpeech from '@/components/TextToSpeech';
import ThemeToggle from '@/components/ThemeToggle';
import '@/styles/globals.css';

const Page = () => {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/game');
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Text-to-Speech Converter</h1>
        <ThemeToggle />
      </header>
      <main className="main">
        <TextToSpeech />
        <button className="start-game-button" onClick={handleStartGame}>Play Game</button>
      </main>
      <footer className="footer">
        <p>Powered by Next.js and the Web Speech API</p>
      </footer>
    </div>
  );
};

export default Page;
