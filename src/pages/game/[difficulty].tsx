'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaHeart, FaHeartBroken, FaRegSadTear, FaRegSmile, FaMicrophone } from 'react-icons/fa';
import AudioVisualizer from '@/components/AudioVisualizer';
import generateSentences from '@/utils/sentenceGenerator';
import '@/styles/globals.css';

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

const difficultySettings = {
  easy: { time: 30, lives: 9 },
  normal: { time: 20, lives: 5 },
  hard: { time: 20, lives: 3 },
  hell: { time: 15, lives: 1 },
};

const GamePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = searchParams?.get('difficulty');
  const theme = searchParams?.get('theme');
  const count = parseInt(searchParams?.get('count') || '5', 10);
  const settings = difficulty ? difficultySettings[difficulty as keyof typeof difficultySettings] : { time: 30, lives: 3 };

  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [text, setText] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(settings.lives);
  const [timeLeft, setTimeLeft] = useState(settings.time);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const correctSound = new Audio('/sounds/correct.mp3');
  const incorrectSound = new Audio('/sounds/incorrect.mp3');

  useEffect(() => {
    const fetchSentences = async () => {
      const generatedSentences = await generateSentences(theme || 'general', count);
      setSentences(generatedSentences);
    };
    fetchSentences();
  }, [theme, count]);

  useEffect(() => {
    if (sentences.length > 0 && difficulty) {
      setText(sentences[0]);
      setHighlightedWordIndex(null);
      setTimeLeft(settings.time);
      setFeedback(null);
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
  }, [sentences, difficulty]);

  useEffect(() => {
    if (!audioContext && typeof window !== 'undefined') {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      setAudioContext(context);
      setAnalyser(analyser);
    }
  }, [audioContext]);

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

  const handleRecognitionResult = (transcript: string) => {
    setUserInput(transcript);
    const words = text.split(' ');
    const transcriptWords = transcript.split(' ');

    let correctWords = 0;
    transcriptWords.forEach((word, index) => {
      if (word.trim().toLowerCase() === words[index]?.trim().toLowerCase()) {
        correctWords++;
      }
    });

    const incorrectWords = words.length - correctWords;

    setScore((prevScore) => prevScore + correctWords * 10 - incorrectWords * 15);
    setLives((prevLives) => {
      const newLives = prevLives - (incorrectWords > 0 ? 1 : 0);
      if (newLives <= 0) {
        handleGameEnd();
      }
      return newLives;
    });

    if (transcript.trim().toLowerCase() === text.trim().toLowerCase()) {
      correctSound.play();
      setFeedback('correct');
      setScore((prevScore) => prevScore + 30);
    } else {
      incorrectSound.play();
      setFeedback('incorrect');
    }

    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex((prevIndex) => prevIndex + 1);
      setText(sentences[currentSentenceIndex + 1]);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    alert(`Game Over! Your score: ${score}`);
    router.push('/game');
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
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
        if (lives > 0) {
          recognition.start();
        }
      };

      recognition.start();

      return () => {
        recognition.stop();
      };
    }
  }, [lives]);

  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < settings.lives; i++) {
      hearts.push(i < lives ? <FaHeart key={i} color="red" /> : <FaHeartBroken key={i} color="grey" />);
    }
    return hearts;
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="timer" style={{ color: timeLeft <= 5 ? 'red' : 'black' }}>Time Left: {timeLeft}s</div>
        <div className="score">Score: {score}</div>
      </div>
      <h1 className="game-title">Difficulty: {difficulty}</h1>
      <div className="text-display">
        {text.split(' ').map((word: string, index: number) => (
          <span
            key={index}
            className={index === highlightedWordIndex ? 'highlight' : ''}
          >
            {word}{' '}
          </span>
        ))}
      </div>
      <div className="controls">
        <button onClick={handleSpeak}>
          <FaMicrophone size={24} />
        </button>
      </div>
      <div className="visualization">
        {audioContext && analyser && (
          <AudioVisualizer audioContext={audioContext} analyser={analyser} isSpeaking={isSpeaking} />
        )}
      </div>
      <div className="game-info">
        <div className="lives">
          {renderHearts()}
        </div>
        <p>Your input: {userInput}</p>
        {feedback && (
          <p className={feedback}>{feedback === 'correct' ? <FaRegSmile color="green" /> : <FaRegSadTear color="red" />}</p>
        )}
      </div>
    </div>
  );
};

export default GamePage;
