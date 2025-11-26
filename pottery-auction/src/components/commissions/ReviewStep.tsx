'use client';

import { motion } from 'framer-motion';
import { User, Mail, Check } from 'lucide-react';
import type { WizardData } from './PotteryWizard';

interface ReviewStepProps {
  data: WizardData;
  onDataChange: (key: keyof WizardData, value: string | null) => void;
}

const shapeNames: Record<string, string> = {
  bowl: 'Bowl',
  vase: 'Vase',
  mug: 'Mug',
  plate: 'Plate',
  planter: 'Planter',
  sculpture: 'Sculpture',
};

const clayNames: Record<string, string> = {
  stoneware: 'Stoneware',
  porcelain: 'Porcelain',
  earthenware: 'Earthenware',
  raku: 'Raku',
};

const glazeNames: Record<string, string> = {
  matte: 'Matte',
  glossy: 'Glossy',
  satin: 'Satin',
  textured: 'Textured',
  crystalline: 'Crystalline',
  raw: 'Unglazed',
};

export default function ReviewStep({ data, onDataChange }: ReviewStepProps) {
  return (
    <div>
      <p className="text-center mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        Review your choices and add your contact info
      </p>

      {/* Choices Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Shape */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 rounded-lg"
          style={{ backgroundColor: 'var(--theme-primary-light)' }}
        >
          <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <Check size={16} className="text-white" />
          </div>
          <p className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>Shape</p>
          <p
            className="font-semibold"
            style={{
              color: 'var(--theme-text)',
              fontFamily: 'var(--font-caveat), cursive',
              fontSize: '1.2rem'
            }}
          >
            {data.shape ? shapeNames[data.shape] : '—'}
          </p>
        </motion.div>

        {/* Clay */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 rounded-lg"
          style={{ backgroundColor: 'var(--theme-primary-light)' }}
        >
          <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <Check size={16} className="text-white" />
          </div>
          <p className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>Clay</p>
          <p
            className="font-semibold"
            style={{
              color: 'var(--theme-text)',
              fontFamily: 'var(--font-caveat), cursive',
              fontSize: '1.2rem'
            }}
          >
            {data.clay ? clayNames[data.clay] : '—'}
          </p>
        </motion.div>

        {/* Glaze */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-4 rounded-lg"
          style={{ backgroundColor: 'var(--theme-primary-light)' }}
        >
          <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <Check size={16} className="text-white" />
          </div>
          <p className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>Glaze</p>
          <p
            className="font-semibold"
            style={{
              color: 'var(--theme-text)',
              fontFamily: 'var(--font-caveat), cursive',
              fontSize: '1.2rem'
            }}
          >
            {data.glaze ? glazeNames[data.glaze] : '—'}
          </p>
        </motion.div>
      </div>

      {/* Description preview */}
      {data.description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-lg border"
          style={{ borderColor: 'rgba(0,0,0,0.1)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'var(--theme-text-muted)' }}>Your description:</p>
          <p className="text-sm" style={{ color: 'var(--theme-text)' }}>
            {data.description.length > 150
              ? `${data.description.substring(0, 150)}...`
              : data.description
            }
          </p>
        </motion.div>
      )}

      {/* Drawing preview */}
      {data.drawing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-xs mb-2" style={{ color: 'var(--theme-text-muted)' }}>Your sketch:</p>
          <div className="w-32 h-32 rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            <img src={data.drawing} alt="Your sketch" className="w-full h-full object-contain bg-white" />
          </div>
        </motion.div>
      )}

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3
          className="font-medium mb-4"
          style={{
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-caveat), cursive',
            fontSize: '1.3rem'
          }}
        >
          Where should I send updates?
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} style={{ color: 'var(--theme-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                Your Name
              </label>
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onDataChange('name', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              placeholder="Your name"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} style={{ color: 'var(--theme-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                Email Address
              </label>
            </div>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onDataChange('email', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
          I&apos;ll review your idea and get back to you within 3-5 business days to discuss the details!
        </p>
      </motion.div>
    </div>
  );
}
