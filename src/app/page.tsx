// src/app/page.tsx

import React from 'react';
import TextToSpeech from '@/components/TextToSpeech';
import ThemeToggle from '@/components/ThemeToggle';
import '@/styles/globals.css';

const Page = () => {
  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Text-to-Speech Converter</h1>
        <ThemeToggle />
      </header>
      <main className="main">
        <TextToSpeech />
      </main>
      <footer className="footer">
        <p>Powered by Next.js and the Web Speech API</p>
      </footer>
    </div>
  );
};

export default Page;
