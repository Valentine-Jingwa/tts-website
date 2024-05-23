'use client';
import React, { useState, useEffect, useRef } from 'react';

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
  const [gameMode, setGameMode] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const textSamples = [
    "Hello world",
    "This is a text to speech game",
    "Try to speak accurately",
    "The quick brown fox jumps over the lazy dog",
    "Next.js is a React framework",
    "Good luck and have fun",
  ];

  useEffect(() => {
    if (gameMode) {
      setText(textSamples[level - 1]);
      setHighlightedWordIndex(null);
      setTimeLeft(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleGameEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, level]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      const words = text.split(' ');
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        const wordIndex = words.findIndex((word, index) => {
          return event.charIndex < words.slice(0, index + 1).join(' ').length;
        });
        setHighlightedWordIndex(wordIndex);
      };

      utterance.onend = () => {
        setHighlightedWordIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const handleStartGame = () => {
    setGameMode(true);
    setScore(0);
    setLevel(1);
    setLives(3);
    setUserInput('');
  };

  const handleGameEnd = () => {
    setGameMode(false);
    alert(`Game Over! Your score: ${score}`);
  };

  const handleRecognitionResult = (transcript: string) => {
    setUserInput(transcript);
    if (transcript.trim().toLowerCase() === text.trim().toLowerCase()) {
      setScore((prevScore) => prevScore + level * 10);
      setLevel((prevLevel) => prevLevel + 1);
    } else {
      setLives((prevLives) => {
        const newLives = prevLives - 1;
        if (newLives <= 0) {
          handleGameEnd();
        }
        return newLives;
      });
    }
  };

  useEffect(() => {
    if (gameMode && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        handleRecognitionResult(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error(event.error);
      };

      recognition.onend = () => {
        if (gameMode) {
          recognition.start();
        }
      };

      recognition.start();

      return () => {
        recognition.stop();
      };
    }
  }, [gameMode, text]);

  return (
    <div className="text-to-speech">
      {!gameMode && (
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Enter text here"
          rows={5}
        />
      )}
      <button onClick={handleSpeak}>Speak</button>
      {!gameMode && <button onClick={handleStartGame}>Start Game</button>}
      {gameMode && <button onClick={handleGameEnd}>End Game</button>}
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
      {gameMode && (
        <div className="game-info">
          <p>Level: {level}</p>
          <p>Time Left: {timeLeft}s</p>
          <p>Lives: {lives}</p>
          <p>Score: {score}</p>
          <p>Your input: {userInput}</p>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
