'use client';
import React, { useState, useEffect, useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';

// Define custom types for speech recognition events
type SpeechRecognitionEvent = Event & {
  results: {
    0: {
      0: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

// Declare the `webkitSpeechRecognition` type
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const textSamples = [
    "Hello world",
    "This is a text to speech game",
    "Try to speak accurately",
    "The quick brown fox jumps over the lazy dog",
    "Next.js is a React framework",
    "Good luck and have fun",
  ];

  useEffect(() => {
    if (!audioContext && typeof window !== 'undefined') {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      setAudioContext(context);
      setAnalyser(analyser);
    }
  }, [audioContext]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && audioContext && analyser) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      const source = audioContext.createMediaElementSource(new Audio());
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const words = text.split(' ');
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        const wordIndex = words.findIndex((word, index) => {
          return event.charIndex < words.slice(0, index + 1).join(' ').length;
        });
        setHighlightedWordIndex(wordIndex);
      };

      utterance.onend = () => {
        setHighlightedWordIndex(null);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  return (
    <div className="text-to-speech">
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Enter text here"
        rows={5}
      />
      <button onClick={handleSpeak}>Speak</button>
      <div className="visualization">
        {audioContext && analyser && (
          <AudioVisualizer audioContext={audioContext} analyser={analyser} isSpeaking={isSpeaking} />
        )}
      </div>
      <div className="text-display">
        {text.split(' ').map((word, index) => (
          <span
            key={index}
            className={index === highlightedWordIndex ? 'highlight' : ''}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TextToSpeech;
