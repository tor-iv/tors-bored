'use client';

import { motion } from 'framer-motion';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import type { WizardData } from './PotteryWizard';

interface ReviewStepProps {
  data: WizardData;
  onDataChange: (key: keyof WizardData, value: string | null) => void;
}

const shapeNames: Record<string, string> = {
  bowl: 'BOWL',
  vase: 'VASE',
  mug: 'MUG',
  plate: 'PLATE',
  planter: 'PLANTER',
  sculpture: 'SCULPTURE',
};

const clayNames: Record<string, string> = {
  stoneware: 'STONEWARE',
  porcelain: 'PORCELAIN',
  earthenware: 'EARTHENWARE',
  raku: 'RAKU',
};

const glazeNames: Record<string, string> = {
  matte: 'MATTE',
  glossy: 'GLOSSY',
  satin: 'SATIN',
  textured: 'TEXTURED',
  crystalline: 'CRYSTALLINE',
  raw: 'UNGLAZED',
};

function SpecRow({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div
      className="receipt-line-item text-[0.75rem]"
      style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
    >
      <span className="uppercase whitespace-nowrap">{label}</span>
      <span className="leader" />
      <span
        style={{
          fontFamily: muted ? 'var(--font-display)' : 'var(--font-stamp)',
          color: muted ? 'var(--ink-muted)' : 'var(--ink)',
          fontSize: muted ? '0.6875rem' : '0.875rem',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ReviewStep({ data, onDataChange }: ReviewStepProps) {
  return (
    <div>
      {/* ── ORDER SPEC REVIEW ── */}
      <div
        className="text-[0.625rem] uppercase tracking-widest mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        SECTION E1 &nbsp;·&nbsp; ORDER SPECIFICATIONS
      </div>
      <ReceiptDivider variant="minor" />
      <div className="space-y-1 py-2">
        <SpecRow
          label="SHAPE"
          value={data.shape ? shapeNames[data.shape] ?? data.shape.toUpperCase() : '—'}
        />
        <SpecRow
          label="CLAY BODY"
          value={data.clay ? clayNames[data.clay] ?? data.clay.toUpperCase() : '—'}
        />
        <SpecRow
          label="GLAZE"
          value={data.glaze ? glazeNames[data.glaze] ?? data.glaze.toUpperCase() : '—'}
        />
        <SpecRow
          label="SKETCH"
          value={data.drawing ? 'ATTACHED' : 'NONE'}
          muted={!data.drawing}
        />
        {data.description && (
          <div className="pt-1">
            <div
              className="text-[0.5625rem] uppercase tracking-wider mb-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              CLIENT NOTES:
            </div>
            <div
              className="text-[0.6875rem] leading-snug"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--ink)',
                borderLeft: '1px solid var(--ink-muted)',
                paddingLeft: 8,
                opacity: 0.85,
              }}
            >
              {data.description.length > 180
                ? `${data.description.slice(0, 180)}…`
                : data.description}
            </div>
          </div>
        )}
      </div>

      <ReceiptDivider variant="major" />

      {/* ── CONTACT FIELDS ── */}
      <div
        className="text-[0.625rem] uppercase tracking-widest mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        SECTION E2 &nbsp;·&nbsp; CONTACT INFORMATION
      </div>
      <ReceiptDivider variant="minor" />

      <div className="py-3 space-y-3">
        {/* Name */}
        <div>
          <div
            className="receipt-line-item text-[0.6875rem] mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="uppercase whitespace-nowrap">CLIENT NAME</span>
            <span className="leader" />
            <span className="text-[0.5rem] uppercase" style={{ color: 'var(--error)' }}>REQUIRED</span>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            <input
              type="text"
              value={data.name}
              onChange={(e) => onDataChange('name', e.target.value)}
              className="receipt-input w-full"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem' }}
              placeholder="YOUR NAME"
              autoComplete="name"
            />
          </motion.div>
        </div>

        {/* Email */}
        <div>
          <div
            className="receipt-line-item text-[0.6875rem] mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="uppercase whitespace-nowrap">EMAIL ADDRESS</span>
            <span className="leader" />
            <span className="text-[0.5rem] uppercase" style={{ color: 'var(--error)' }}>REQUIRED</span>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="email"
              value={data.email}
              onChange={(e) => onDataChange('email', e.target.value)}
              className="receipt-input w-full"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem' }}
              placeholder="YOUR@EMAIL.COM"
              autoComplete="email"
            />
          </motion.div>
        </div>
      </div>

      <ReceiptDivider variant="minor" />

      <div
        className="text-[0.5rem] uppercase tracking-wider mt-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        * TOR WILL RESPOND WITHIN 3–5 BUSINESS DAYS WITH A QUOTE *
      </div>
    </div>
  );
}
