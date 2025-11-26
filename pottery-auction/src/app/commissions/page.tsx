'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PotteryWizard, WizardData } from '@/components/commissions';
import { useAuth } from '@/hooks/useAuth';
import { HandsOnClay, ClayBlob, FloatingDecoration } from '@/components/decorations';
import PotteryLoader from '@/components/ui/PotteryLoader';

export default function CommissionsPage() {
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<WizardData | null>(null);

  const handleWizardComplete = async (data: WizardData) => {
    setIsSubmitting(true);

    try {
      // TODO: Submit to API
      console.log('Commission data:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmittedData(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting commission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1EC' }}>
        <PotteryLoader size="lg" showMessage={true} />
      </div>
    );
  }

  // Success state
  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F1EC' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Sparkles size={40} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4"
            style={{
              color: 'var(--theme-text)',
              fontFamily: 'var(--font-caveat), cursive'
            }}
          >
            Your Dream Pot is On Its Way!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Thank you for sharing your vision! I&apos;ll review your{' '}
            <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
              {submittedData.shape}
            </span>{' '}
            made with{' '}
            <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
              {submittedData.clay}
            </span>{' '}
            and{' '}
            <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
              {submittedData.glaze}
            </span>{' '}
            glaze, and get back to you within 3-5 business days.
          </motion.p>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-6 mb-8"
            style={{
              background: 'white',
              border: '1px solid rgba(224, 120, 86, 0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: '1.3rem'
              }}
            >
              What happens next?
            </h3>
            <div className="text-left space-y-3">
              {[
                "I'll review your pottery idea and assess feasibility",
                "You'll receive an email with my thoughts and any questions",
                "We'll discuss pricing, timeline, and any adjustments",
                "Once agreed, I'll start bringing your vision to life!"
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--font-caveat), cursive',
                      fontSize: '0.9rem'
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedData(null);
              }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-text-on-primary)',
                boxShadow: '0 4px 0 var(--theme-primary-dark)'
              }}
            >
              Submit Another Idea
            </button>
            <Link
              href="/gallery"
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 border-2"
              style={{
                borderColor: 'var(--theme-primary)',
                color: 'var(--theme-text)'
              }}
            >
              Browse Gallery
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main wizard view
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F5F1EC' }}>
      {/* Background decorations */}
      <FloatingDecoration className="absolute top-20 right-10 opacity-20 hidden lg:block" delay={0}>
        <ClayBlob className="w-48 h-48" color="var(--theme-primary)" />
      </FloatingDecoration>
      <FloatingDecoration className="absolute bottom-40 left-10 opacity-15 hidden lg:block" delay={2}>
        <ClayBlob className="w-32 h-32" color="var(--theme-accent)" />
      </FloatingDecoration>

      {/* Header */}
      <div className="relative py-12 sm:py-16" style={{ backgroundColor: 'var(--theme-primary-light)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Hands on clay illustration */}
            <HandsOnClay
              className="w-20 h-20 mx-auto mb-4"
              color="var(--theme-text)"
            />

            <h1
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive'
              }}
            >
              Design Your Dream Pot
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Walk through a few quick steps to tell me about your perfect pottery piece.
              I&apos;ll review your idea and we&apos;ll bring it to life together!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Wizard */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PotteryWizard
          onComplete={handleWizardComplete}
          initialName={userProfile?.displayName || ''}
          initialEmail={user?.email || ''}
        />
      </div>
    </div>
  );
}
