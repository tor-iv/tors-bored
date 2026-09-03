'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShapeSelector from './ShapeSelector';
import ClaySelector from './ClaySelector';
import GlazeSelector from './GlazeSelector';
import SketchStep from './SketchStep';
import ReviewStep from './ReviewStep';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

export interface WizardData {
  shape: string | null;
  clay: string | null;
  glaze: string | null;
  drawing: string | null;
  description: string;
  name: string;
  email: string;
}

interface PotteryWizardProps {
  onComplete: (data: WizardData) => void;
  initialName?: string;
  initialEmail?: string;
}

const STEPS = [
  { id: 'shape',  section: 'A', label: 'SHAPE / FORM',      sublabel: 'WHAT ARE WE MAKING?' },
  { id: 'clay',   section: 'B', label: 'CLAY BODY',         sublabel: 'THE FOUNDATION' },
  { id: 'glaze',  section: 'C', label: 'GLAZE FINISH',      sublabel: 'THE FINISHING TOUCH' },
  { id: 'sketch', section: 'D', label: 'SKETCH + DETAILS',  sublabel: 'YOUR VISION (OPTIONAL)' },
  { id: 'review', section: 'E', label: 'REVIEW + CONTACT',  sublabel: 'CONFIRM & SUBMIT' },
];

// Step slide variants: forward = slide right-to-left, back = left-to-right
function slideVariants(direction: 1 | -1) {
  return {
    initial:  { opacity: 0, x: direction * 40 },
    animate:  { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
    exit:     { opacity: 0, x: direction * -40, transition: { duration: 0.18 } },
  };
}

export default function PotteryWizard({ onComplete, initialName = '', initialEmail = '' }: PotteryWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    shape: null,
    clay: null,
    glaze: null,
    drawing: null,
    description: '',
    name: initialName,
    email: initialEmail,
  });

  const updateData = (key: keyof WizardData, value: string | null) => {
    setWizardData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return wizardData.shape !== null;
      case 1: return wizardData.clay !== null;
      case 2: return wizardData.glaze !== null;
      case 3: return true;
      case 4: return !!(wizardData.name.trim() && wizardData.email.trim());
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index < currentStep) {
      setDirection(-1);
      setCurrentStep(index);
    }
  };

  const handleSubmit = () => {
    if (canProceed()) onComplete(wizardData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <ShapeSelector selected={wizardData.shape} onSelect={(s) => updateData('shape', s)} />;
      case 1: return <ClaySelector  selected={wizardData.clay}  onSelect={(c) => updateData('clay', c)} />;
      case 2: return <GlazeSelector selected={wizardData.glaze} onSelect={(g) => updateData('glaze', g)} />;
      case 3: return (
        <SketchStep
          drawing={wizardData.drawing}
          description={wizardData.description}
          onDrawingChange={(d) => updateData('drawing', d)}
          onDescriptionChange={(desc) => updateData('description', desc)}
        />
      );
      case 4: return <ReviewStep data={wizardData} onDataChange={updateData} />;
      default: return null;
    }
  };

  const vars = slideVariants(direction);

  return (
    <div>
      {/* ── DOT-MATRIX PROGRESS INDICATOR ── */}
      <div className="mb-4">
        {/* Step tracker row */}
        <div className="flex items-center gap-0 mb-2" aria-label="Progress">
          {STEPS.map((step, i) => {
            const isDone    = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <button
                  onClick={() => goToStep(i)}
                  disabled={i > currentStep}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="flex flex-col items-center"
                  style={{
                    cursor: isDone ? 'pointer' : 'default',
                    opacity: i > currentStep ? 0.35 : 1,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    minWidth: 28,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: `1.5px solid ${isCurrent ? 'var(--ink)' : isDone ? 'var(--ink-muted)' : 'var(--ink-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-thermal)',
                      fontSize: '0.8rem',
                      color: isCurrent ? 'var(--ink)' : isDone ? 'var(--ink-muted)' : 'var(--ink-muted)',
                      backgroundColor: isCurrent ? 'var(--paper-highlight, rgba(255,255,255,0.15))' : 'transparent',
                    }}
                  >
                    {isDone ? '✓' : step.section}
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      borderTop: `1px ${isDone ? 'solid' : 'dashed'} var(--ink-muted)`,
                      opacity: 0.4,
                      margin: '0 2px',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Section label */}
        <div className="text-center" style={{ lineHeight: 1.3 }}>
          <div
            className="text-[0.5rem] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            STEP {currentStep + 1} OF {STEPS.length} &nbsp;·&nbsp; SECTION {STEPS[currentStep].section}
          </div>
          <div
            className="text-[0.875rem] uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
          >
            {STEPS[currentStep].label}
          </div>
          <div
            className="text-[0.5625rem] uppercase"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            {STEPS[currentStep].sublabel}
          </div>
        </div>
      </div>

      <ReceiptDivider variant="minor" />

      {/* ── STEP CONTENT ── */}
      <div className="py-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            variants={vars}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <ReceiptDivider variant="minor" />

      {/* ── NAVIGATION ── */}
      <div className="flex items-center justify-between pt-3 gap-4">
        {/* Back button */}
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="receipt-stamp uppercase tracking-widest px-5 py-2 text-[0.8rem] border border-current"
          style={{
            fontFamily: 'var(--font-stamp)',
            color: currentStep === 0 ? 'var(--ink-muted)' : 'var(--ink)',
            opacity: currentStep === 0 ? 0.3 : 1,
            cursor: currentStep === 0 ? 'default' : 'pointer',
            boxShadow: currentStep === 0 ? 'none' : '2px 2px 0 var(--ink)',
            transition: 'box-shadow 0.1s, transform 0.1s',
          }}
          onMouseEnter={(e) => {
            if (currentStep === 0) return;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 var(--ink)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
          }}
          onMouseLeave={(e) => {
            if (currentStep === 0) return;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 var(--ink)';
            (e.currentTarget as HTMLButtonElement).style.transform = '';
          }}
        >
          ← BACK
        </button>

        {/* Step progress (center) */}
        <div
          className="text-[0.5625rem] uppercase text-center"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', letterSpacing: '0.1em' }}
        >
          {Array.from({ length: STEPS.length }, (_, i) => (
            <span key={i} style={{ color: i <= currentStep ? 'var(--ink)' : undefined }}>
              {i <= currentStep ? '█' : '░'}
            </span>
          ))}
        </div>

        {/* Next / Submit button */}
        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!canProceed()}
            className="receipt-stamp uppercase tracking-widest px-5 py-2 text-[0.8rem] border border-current"
            style={{
              fontFamily: 'var(--font-stamp)',
              color: canProceed() ? 'var(--ink)' : 'var(--ink-muted)',
              opacity: canProceed() ? 1 : 0.45,
              cursor: canProceed() ? 'pointer' : 'default',
              boxShadow: canProceed() ? '2px 2px 0 var(--ink)' : 'none',
              transition: 'box-shadow 0.1s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!canProceed()) return;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 var(--ink)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
            }}
            onMouseLeave={(e) => {
              if (!canProceed()) return;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 var(--ink)';
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
          >
            [ SUBMIT WORK ORDER ]
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="receipt-stamp uppercase tracking-widest px-5 py-2 text-[0.8rem] border border-current"
            style={{
              fontFamily: 'var(--font-stamp)',
              color: canProceed() ? 'var(--ink)' : 'var(--ink-muted)',
              opacity: canProceed() ? 1 : 0.45,
              cursor: canProceed() ? 'pointer' : 'default',
              boxShadow: canProceed() ? '2px 2px 0 var(--ink)' : 'none',
              transition: 'box-shadow 0.1s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!canProceed()) return;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 var(--ink)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
            }}
            onMouseLeave={(e) => {
              if (!canProceed()) return;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 var(--ink)';
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
          >
            NEXT →
          </button>
        )}
      </div>

      {/* Instruction note when can't proceed */}
      {!canProceed() && currentStep < 3 && (
        <div
          className="text-center text-[0.5625rem] uppercase tracking-wider mt-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          * SELECT AN OPTION ABOVE TO CONTINUE *
        </div>
      )}
      {!canProceed() && currentStep === 4 && (
        <div
          className="text-center text-[0.5625rem] uppercase tracking-wider mt-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          * NAME + EMAIL REQUIRED TO SUBMIT *
        </div>
      )}
    </div>
  );
}
