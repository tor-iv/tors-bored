'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Playful loading messages
const loadingMessages = [
  "Centering the clay...",
  "Wedging out the air bubbles...",
  "Tor is definitely NOT procrastinating...",
  "Heating up the kiln...",
  "Finding the perfect imperfection...",
  "Pulling up the walls...",
  "Adding a touch of wobble...",
  "Waiting for the wheel to stop spinning...",
  "Checking if it's leather hard yet...",
  "Glazing... carefully...",
  "Asking the kiln gods for luck...",
  "Almost there, just one more spin...",
];

interface PotteryLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  className?: string;
}

export default function PotteryLoader({
  size = 'md',
  showMessage = true,
  className = ''
}: PotteryLoaderProps) {
  const [message, setMessage] = useState(loadingMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate through messages
  useEffect(() => {
    if (!showMessage) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [showMessage]);

  useEffect(() => {
    setMessage(loadingMessages[messageIndex]);
  }, [messageIndex]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const wheelSize = {
    sm: 48,
    md: 80,
    lg: 128,
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Pottery wheel animation */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Wheel base */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        >
          {/* Wheel platform - spinning */}
          <motion.ellipse
            cx="50"
            cy="75"
            rx="45"
            ry="12"
            fill="#8B7355"
            stroke="#6B5344"
            strokeWidth="2"
            animate={{ rotateX: [0, 5, 0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />

          {/* Wheel surface markings */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: '50px 75px' }}
          >
            <ellipse cx="50" cy="75" rx="40" ry="10" fill="#A08060" />
            <line x1="50" y1="65" x2="50" y2="85" stroke="#8B7355" strokeWidth="1" />
            <line x1="10" y1="75" x2="90" y2="75" stroke="#8B7355" strokeWidth="1" />
            <line x1="20" y1="68" x2="80" y2="82" stroke="#8B7355" strokeWidth="0.5" />
            <line x1="20" y1="82" x2="80" y2="68" stroke="#8B7355" strokeWidth="0.5" />
          </motion.g>

          {/* Clay lump that morphs */}
          <motion.path
            d="M35 65 Q35 45 50 35 Q65 45 65 65 Q57 70 50 70 Q43 70 35 65 Z"
            fill="#C96846"
            stroke="#A05840"
            strokeWidth="1.5"
            animate={{
              d: [
                "M35 65 Q35 45 50 35 Q65 45 65 65 Q57 70 50 70 Q43 70 35 65 Z", // Bowl shape
                "M38 65 Q38 35 50 25 Q62 35 62 65 Q56 68 50 68 Q44 68 38 65 Z", // Taller vase
                "M40 65 Q38 50 50 40 Q62 50 60 65 Q55 67 50 67 Q45 67 40 65 Z", // Wider bowl
                "M35 65 Q35 45 50 35 Q65 45 65 65 Q57 70 50 70 Q43 70 35 65 Z", // Back to bowl
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Hands suggestion (abstract) */}
          <motion.ellipse
            cx="25"
            cy="55"
            rx="8"
            ry="4"
            fill="#D4A574"
            opacity="0.6"
            animate={{
              x: [0, 3, 0, -3, 0],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.ellipse
            cx="75"
            cy="55"
            rx="8"
            ry="4"
            fill="#D4A574"
            opacity="0.6"
            animate={{
              x: [0, -3, 0, 3, 0],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Clay particles flying off */}
          <motion.circle
            cx="30"
            cy="50"
            r="2"
            fill="#E07856"
            animate={{
              cx: [30, 15, 10],
              cy: [50, 45, 55],
              opacity: [0.8, 0.4, 0],
              scale: [1, 0.5, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="70"
            cy="50"
            r="1.5"
            fill="#C96846"
            animate={{
              cx: [70, 85, 90],
              cy: [50, 48, 58],
              opacity: [0.8, 0.4, 0],
              scale: [1, 0.5, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle
            cx="50"
            cy="35"
            r="1"
            fill="#D4A574"
            animate={{
              cy: [35, 25, 20],
              opacity: [0.6, 0.3, 0],
              scale: [1, 0.5, 0]
            }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
          />
        </motion.svg>
      </div>

      {/* Loading message */}
      {showMessage && (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-center"
          style={{
            color: 'var(--theme-text-muted)',
            fontFamily: 'var(--font-caveat), cursive',
            fontSize: size === 'lg' ? '1.25rem' : size === 'md' ? '1rem' : '0.875rem'
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// Simpler inline spinner for buttons
export function PotterySpinner({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified pottery wheel */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="32 32"
          strokeLinecap="round"
          opacity="0.3"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="16 48"
          strokeLinecap="round"
        />
        {/* Clay blob in center */}
        <ellipse
          cx="12"
          cy="12"
          rx="4"
          ry="3"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
    </motion.div>
  );
}
