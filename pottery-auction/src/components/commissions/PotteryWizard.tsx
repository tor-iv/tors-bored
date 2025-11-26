'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ShapeSelector from './ShapeSelector';
import ClaySelector from './ClaySelector';
import GlazeSelector from './GlazeSelector';
import SketchStep from './SketchStep';
import ReviewStep from './ReviewStep';
import { PotteryWheelDoodle } from '@/components/decorations';

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

const steps = [
  { id: 'shape', title: 'Choose Shape', subtitle: 'What are we making?' },
  { id: 'clay', title: 'Pick Clay', subtitle: 'The foundation' },
  { id: 'glaze', title: 'Select Glaze', subtitle: 'The finishing touch' },
  { id: 'sketch', title: 'Add Details', subtitle: 'Your vision' },
  { id: 'review', title: 'Review', subtitle: 'Almost there!' },
];

export default function PotteryWizard({ onComplete, initialName = '', initialEmail = '' }: PotteryWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
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
      case 3: return true; // Sketch is optional
      case 4: return true; // Review step
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(wizardData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ShapeSelector
            selected={wizardData.shape}
            onSelect={(shape) => updateData('shape', shape)}
          />
        );
      case 1:
        return (
          <ClaySelector
            selected={wizardData.clay}
            onSelect={(clay) => updateData('clay', clay)}
          />
        );
      case 2:
        return (
          <GlazeSelector
            selected={wizardData.glaze}
            onSelect={(glaze) => updateData('glaze', glaze)}
          />
        );
      case 3:
        return (
          <SketchStep
            drawing={wizardData.drawing}
            description={wizardData.description}
            onDrawingChange={(drawing) => updateData('drawing', drawing)}
            onDescriptionChange={(desc) => updateData('description', desc)}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={wizardData}
            onDataChange={updateData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.button
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  transition-all duration-300
                  ${index === currentStep
                    ? 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] scale-110'
                    : index < currentStep
                      ? 'bg-[var(--theme-primary-light)] text-[var(--theme-text)] cursor-pointer hover:scale-105'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
                style={{ fontFamily: 'var(--font-caveat), cursive' }}
                whileHover={index < currentStep ? { scale: 1.1 } : {}}
                whileTap={index < currentStep ? { scale: 0.95 } : {}}
              >
                {index + 1}
              </motion.button>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-8 sm:w-16 mx-1 rounded-full transition-colors duration-300
                    ${index < currentStep ? 'bg-[var(--theme-primary)]' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step title */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--theme-text)', fontFamily: 'var(--font-caveat), cursive', fontSize: '2rem' }}
          >
            {steps[currentStep].title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            {steps[currentStep].subtitle}
          </p>
        </motion.div>
      </div>

      {/* Step Content */}
      <div
        className="rounded-xl p-6 sm:p-8 mb-6"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
          border: '1px solid rgba(224, 120, 86, 0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-200
            ${currentStep === 0
              ? 'opacity-0 pointer-events-none'
              : 'hover:bg-gray-100'
            }
          `}
          style={{ color: 'var(--theme-text)' }}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={20} />
          Back
        </motion.button>

        {/* Pottery wheel animation in center */}
        <div className="hidden sm:block">
          <PotteryWheelDoodle
            className="w-12 h-12 opacity-20"
            color="var(--theme-text)"
            animate={true}
          />
        </div>

        {currentStep === steps.length - 1 ? (
          <motion.button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-text-on-primary)',
              boxShadow: '0 4px 0 var(--theme-primary-dark)'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 2 }}
          >
            <Sparkles size={20} />
            Submit My Dream Pot
          </motion.button>
        ) : (
          <motion.button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium
              transition-all duration-200
              ${canProceed()
                ? ''
                : 'opacity-50 cursor-not-allowed'
              }
            `}
            style={{
              backgroundColor: canProceed() ? 'var(--theme-primary)' : 'gray',
              color: 'var(--theme-text-on-primary)',
              boxShadow: canProceed() ? '0 4px 0 var(--theme-primary-dark)' : 'none'
            }}
            whileHover={canProceed() ? { scale: 1.02, y: -2 } : {}}
            whileTap={canProceed() ? { scale: 0.98, y: 2 } : {}}
          >
            Next
            <ChevronRight size={20} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
