import type { Variants, Transition } from 'framer-motion';

// Shared spring configuration for organic, handcrafted feel
export const boredSpring: Transition = {
  type: "spring",
  stiffness: 100,  // Lower = more relaxed
  damping: 15,
  mass: 1.2        // Slightly heavier = more deliberate
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20
};

// ============================================
// Clay-forming reveal animation
// Elements "shape" into view like clay on a wheel
// ============================================
export const clayForm: Variants = {
  hidden: {
    opacity: 0,
    scaleY: 0.7,
    scaleX: 1.1,
    y: 20
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// ============================================
// Shelf lift hover effect
// Cards lift off the shelf like picking up pottery
// ============================================
export const shelfLift: Variants = {
  rest: {
    y: 0,
    rotateX: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  hover: {
    y: -12,
    rotateX: 3,
    boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// ============================================
// Clay press button effect
// Satisfying squish like pressing clay
// ============================================
export const clayPress: Variants = {
  rest: {
    scale: 1,
    y: 0
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.98,
    y: 2,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

// ============================================
// Stagger container for child animations
// ============================================
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// ============================================
// Fade up animation (simpler than clayForm)
// ============================================
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// ============================================
// Scale in animation
// ============================================
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

// ============================================
// Wobble animation for playful elements
// ============================================
export const wobble: Variants = {
  rest: {
    rotate: 0
  },
  wobble: {
    rotate: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.5
    }
  }
};

// ============================================
// Float animation for decorative elements
// ============================================
export const float: Variants = {
  initial: {
    y: 0,
    rotate: 0
  },
  float: {
    y: [-5, 5, -5],
    rotate: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================
// Page transition variants
// ============================================
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// ============================================
// Slide in from sides
// ============================================
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: boredSpring
  }
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: boredSpring
  }
};

// ============================================
// Pop animation for badges, notifications
// ============================================
export const pop: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

// ============================================
// Kiln glow effect for urgent items
// ============================================
export const kilnGlow: Variants = {
  rest: {
    boxShadow: "0 0 0 rgba(224, 120, 86, 0)"
  },
  glow: {
    boxShadow: [
      "0 0 20px rgba(224, 120, 86, 0.3)",
      "0 0 40px rgba(224, 120, 86, 0.5)",
      "0 0 20px rgba(224, 120, 86, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================
// Confetti/celebration variants
// ============================================
export const confettiPiece: Variants = {
  initial: {
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
    scale: 1
  },
  animate: (custom: { x: number; y: number; rotate: number }) => ({
    opacity: [1, 1, 0],
    y: [0, custom.y],
    x: [0, custom.x],
    rotate: [0, custom.rotate],
    scale: [1, 0.8, 0.5],
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  })
};

// ============================================
// Modal/overlay animations
// ============================================
export const modalOverlay: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

// ============================================
// List item animations
// ============================================
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    x: -10
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

// ============================================
// Utility: Generate stagger delay
// ============================================
export function getStaggerDelay(index: number, baseDelay = 0.1): number {
  return index * baseDelay;
}

// ============================================
// Utility: Create custom spring transition
// ============================================
export function createSpring(
  stiffness = 100,
  damping = 15,
  mass = 1
): Transition {
  return {
    type: "spring",
    stiffness,
    damping,
    mass
  };
}
