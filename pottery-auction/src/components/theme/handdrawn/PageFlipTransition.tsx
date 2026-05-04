'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const desktopVariants = {
  initial: { opacity: 0, x: -20, rotateY: -3 },
  animate: { opacity: 1, x: 0, rotateY: 0 },
  exit:    { opacity: 0, x: 20, rotateY: 3 },
};

const mobileVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 20 },
};

export default function PageFlipTransition({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  const variants = isMobile ? mobileVariants : desktopVariants;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
