'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Pottery puns that rotate
const potteryPuns = [
  "Looks like this page didn't survive the kiln.",
  "This pot cracked under pressure.",
  "Someone forgot to center this page on the wheel.",
  "This page is more broken than my first attempt at throwing.",
  "Even the best potters have pieces that don't make it.",
  "This page went a bit wonky during firing.",
  "Oops! This one collapsed on the wheel.",
];

// Broken pot SVG component
function BrokenPotSVG() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-48 h-48 md:w-64 md:h-64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main pot body - left piece */}
      <motion.path
        d="M40 140 C40 100, 50 80, 60 60 L70 60 L75 140 Z"
        fill="#E07856"
        stroke="#C96846"
        strokeWidth="2"
        initial={{ rotate: 0, x: 0 }}
        animate={{ rotate: -15, x: -10 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ transformOrigin: '60px 140px' }}
      />

      {/* Main pot body - right piece */}
      <motion.path
        d="M160 140 C160 100, 150 80, 140 60 L130 60 L125 140 Z"
        fill="#E07856"
        stroke="#C96846"
        strokeWidth="2"
        initial={{ rotate: 0, x: 0 }}
        animate={{ rotate: 15, x: 10 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ transformOrigin: '140px 140px' }}
      />

      {/* Center piece - falling */}
      <motion.path
        d="M75 60 L125 60 L120 140 L80 140 Z"
        fill="#C96846"
        stroke="#A05840"
        strokeWidth="2"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 20, opacity: 0.8 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />

      {/* Rim piece - top left */}
      <motion.path
        d="M55 55 L75 55 L75 65 L60 65 Z"
        fill="#D4A574"
        stroke="#C96846"
        strokeWidth="1.5"
        initial={{ rotate: 0, y: 0 }}
        animate={{ rotate: -25, y: -5, x: -8 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ transformOrigin: '65px 60px' }}
      />

      {/* Rim piece - top right */}
      <motion.path
        d="M125 55 L145 55 L140 65 L125 65 Z"
        fill="#D4A574"
        stroke="#C96846"
        strokeWidth="1.5"
        initial={{ rotate: 0, y: 0 }}
        animate={{ rotate: 20, y: -8, x: 5 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ transformOrigin: '135px 60px' }}
      />

      {/* Scattered pieces */}
      <motion.circle
        cx="30"
        cy="160"
        r="6"
        fill="#C96846"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      <motion.circle
        cx="170"
        cy="155"
        r="4"
        fill="#E07856"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      />
      <motion.circle
        cx="100"
        cy="170"
        r="5"
        fill="#D4A574"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      />

      {/* Crack lines */}
      <motion.path
        d="M85 80 L90 100 L82 120"
        stroke="#A05840"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
      <motion.path
        d="M115 85 L110 105 L118 125"
        stroke="#A05840"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      />
    </svg>
  );
}

export default function NotFound() {
  const [pun, setPun] = useState(potteryPuns[0]);

  useEffect(() => {
    // Pick a random pun on mount
    setPun(potteryPuns[Math.floor(Math.random() * potteryPuns.length)]);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Broken pot illustration */}
        <div className="mb-8 flex justify-center">
          <BrokenPotSVG />
        </div>

        {/* 404 text */}
        <motion.h1
          className="text-8xl md:text-9xl font-bold mb-4 playful-tilt"
          style={{
            color: 'var(--theme-primary)',
            fontFamily: 'var(--font-caveat), cursive'
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          404
        </motion.h1>

        {/* Oops message */}
        <motion.h2
          className="text-2xl md:text-3xl font-semibold mb-4"
          style={{
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-caveat), cursive'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Oops! This page broke in the kiln.
        </motion.h2>

        {/* Random pun */}
        <motion.p
          className="text-lg mb-8 max-w-md mx-auto"
          style={{ color: 'var(--theme-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {pun}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/"
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-text-on-primary)',
              boxShadow: '0 4px 0 var(--theme-primary-dark)'
            }}
          >
            Back to the Studio
          </Link>
          <Link
            href="/gallery"
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 border-2"
            style={{
              borderColor: 'var(--theme-primary)',
              color: 'var(--theme-text)'
            }}
          >
            Browse the Gallery
          </Link>
        </motion.div>

        {/* Fun footer note */}
        <motion.p
          className="mt-12 text-sm italic"
          style={{ color: 'var(--theme-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Don&apos;t worry, Tor makes plenty of pots that actually survive.
        </motion.p>
      </motion.div>
    </div>
  );
}
