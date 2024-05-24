'use client';
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  isSpeaking: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioContext, analyser, isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = 'rgb(0, 123, 255)';
      canvasContext.beginPath();

      const sliceWidth = (canvas.width * 1.0) / analyser.fftSize;
      let x = 0;

      for (let i = 0; i < analyser.fftSize; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isSpeaking) {
      animationRef.current = requestAnimationFrame(draw);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isSpeaking, analyser]);

  return <canvas ref={canvasRef} width="500" height="100" />;
};

export default AudioVisualizer;
