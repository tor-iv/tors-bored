'use client';

import { motion } from 'framer-motion';

interface DecorationProps {
  className?: string;
  color?: string;
  animate?: boolean;
}

// ============================================
// Pottery Wheel Doodle
// Hand-drawn style pottery wheel for footer/loading
// ============================================
export function PotteryWheelDoodle({
  className = 'w-16 h-16',
  color = 'currentColor',
  animate = true
}: DecorationProps) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={animate ? { rotate: 360 } : undefined}
      transition={animate ? { duration: 8, repeat: Infinity, ease: "linear" } : undefined}
    >
      {/* Wheel base */}
      <ellipse
        cx="50"
        cy="70"
        rx="40"
        ry="15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        fill="none"
      />
      {/* Inner wheel */}
      <ellipse
        cx="50"
        cy="70"
        rx="25"
        ry="9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center hub */}
      <circle
        cx="50"
        cy="70"
        r="5"
        fill={color}
        opacity="0.3"
      />
      {/* Clay lump */}
      <path
        d="M40 60 Q40 45 50 40 Q60 45 60 60"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Wobbly top */}
      <path
        d="M42 42 Q50 38 58 42"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

// ============================================
// Vase Sketch
// Wobbly vase outline for empty states
// ============================================
export function VaseSketch({
  className = 'w-24 h-24',
  color = 'currentColor'
}: DecorationProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vase body - wobbly line style */}
      <path
        d="M30 100 Q25 80 30 60 Q28 40 35 25 Q40 20 50 18 Q60 20 65 25 Q72 40 70 60 Q75 80 70 100"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Base */}
      <path
        d="M30 100 Q50 105 70 100"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rim */}
      <ellipse
        cx="50"
        cy="18"
        rx="15"
        ry="4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Decoration line */}
      <path
        d="M32 50 Q50 55 68 50"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 3"
        fill="none"
      />
    </svg>
  );
}

// ============================================
// Clay Blob
// Organic shapes for background decorations
// ============================================
export function ClayBlob({
  className = 'w-32 h-32',
  color = 'var(--theme-primary)',
  animate = true
}: DecorationProps) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={animate ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, 0, -5, 0]
      } : undefined}
      transition={animate ? {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      } : undefined}
    >
      <path
        d="M100 20
           Q150 30 170 70
           Q190 120 160 160
           Q120 190 80 170
           Q30 150 20 100
           Q10 50 60 30
           Q80 15 100 20"
        fill={color}
        opacity="0.15"
      />
    </motion.svg>
  );
}

// ============================================
// Brush Stroke
// Horizontal decorative divider
// ============================================
export function BrushStroke({
  className = 'w-full h-4',
  color = 'var(--theme-primary)'
}: DecorationProps) {
  return (
    <svg
      viewBox="0 0 400 20"
      className={className}
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10 Q50 5 100 12 Q150 18 200 8 Q250 2 300 14 Q350 20 400 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

// ============================================
// Hands on Clay
// For commissions page header
// ============================================
export function HandsOnClay({
  className = 'w-32 h-32',
  color = 'currentColor'
}: DecorationProps) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left hand */}
      <path
        d="M20 50 Q15 45 20 35 Q25 30 30 35 L35 50"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 50 Q22 40 28 32"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right hand */}
      <path
        d="M100 50 Q105 45 100 35 Q95 30 90 35 L85 50"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M95 50 Q98 40 92 32"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Clay being shaped */}
      <path
        d="M35 55 Q35 40 60 35 Q85 40 85 55"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Wheel */}
      <ellipse
        cx="60"
        cy="70"
        rx="45"
        ry="12"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="6 4"
        fill="none"
      />
    </svg>
  );
}

// ============================================
// Small Clay Splatter
// Corner decoration for cards
// ============================================
export function ClaySplatter({
  className = 'w-8 h-8',
  color = 'var(--theme-primary)'
}: DecorationProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="8" fill={color} opacity="0.2" />
      <circle cx="12" cy="15" r="3" fill={color} opacity="0.15" />
      <circle cx="28" cy="12" r="4" fill={color} opacity="0.1" />
      <circle cx="25" cy="28" r="2.5" fill={color} opacity="0.15" />
      <circle cx="10" cy="25" r="2" fill={color} opacity="0.1" />
    </svg>
  );
}

// ============================================
// Kiln Icon
// For auction timer/firing references
// ============================================
export function KilnIcon({
  className = 'w-12 h-12',
  color = 'currentColor'
}: DecorationProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Kiln body */}
      <rect
        x="10"
        y="15"
        width="40"
        height="35"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Door */}
      <rect
        x="18"
        y="25"
        width="24"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Fire glow inside */}
      <ellipse
        cx="30"
        cy="35"
        rx="8"
        ry="6"
        fill={color}
        opacity="0.2"
      />
      {/* Chimney */}
      <rect
        x="25"
        y="5"
        width="10"
        height="12"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Smoke */}
      <path
        d="M28 5 Q26 0 30 -2 Q34 0 32 5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Temperature dial */}
      <circle
        cx="45"
        cy="20"
        r="3"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

// ============================================
// Floating Decoration Wrapper
// Adds floating animation to any child
// ============================================
export function FloatingDecoration({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-8, 8, -8],
        rotate: [-3, 3, -3]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Section Divider with Brush Stroke
// ============================================
export function SectionDivider({
  className = 'my-12'
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <BrushStroke className="w-48 h-3 opacity-50" />
    </div>
  );
}

// ============================================
// Empty State Illustration
// Combines vase sketch with message
// ============================================
export function EmptyStateIllustration({
  message = "Nothing here yet...",
  subMessage = "Check back soon!",
  className = ''
}: {
  message?: string;
  subMessage?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VaseSketch
          className="w-24 h-24 mb-4"
          color="var(--theme-text-muted)"
        />
      </motion.div>
      <motion.p
        className="text-lg font-medium"
        style={{
          color: 'var(--theme-text)',
          fontFamily: 'var(--font-caveat), cursive'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
      <motion.p
        className="text-sm mt-1"
        style={{ color: 'var(--theme-text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {subMessage}
      </motion.p>
    </div>
  );
}
