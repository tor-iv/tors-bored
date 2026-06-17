'use client';

import DrawingCanvas from '@/components/ui/DrawingCanvas';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

interface SketchStepProps {
  drawing: string | null;
  description: string;
  onDrawingChange: (drawing: string | null) => void;
  onDescriptionChange: (description: string) => void;
}

export default function SketchStep({
  drawing,
  description,
  onDrawingChange,
  onDescriptionChange,
}: SketchStepProps) {
  return (
    <div>
      {/* ── DESCRIPTION FIELD ── */}
      <div className="mb-4">
        <div
          className="text-[0.625rem] uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          SECTION D1 &nbsp;·&nbsp; DESCRIBE YOUR VISION
        </div>
        <ReceiptDivider variant="minor" />

        <div className="py-2">
          <div
            className="receipt-line-item text-[0.75rem] mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="uppercase whitespace-nowrap">NOTES</span>
            <span className="leader" />
            <span className="text-[0.5rem] uppercase" style={{ color: 'var(--ink-muted)' }}>OPTIONAL</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
            className="receipt-input w-full resize-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              lineHeight: 1.6,
            }}
            placeholder="SIZE PREFERENCES, SPECIAL FEATURES, COLOR IDEAS, SURFACE DECORATIONS, INTENDED USE..."
          />
          <div
            className="text-[0.5rem] uppercase tracking-wider mt-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            * MORE DETAIL = BETTER RESULT *
          </div>
        </div>
      </div>

      {/* ── SKETCH AREA ── */}
      <div>
        <div
          className="text-[0.625rem] uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          SECTION D2 &nbsp;·&nbsp; ATTACH SKETCH
        </div>
        <ReceiptDivider variant="minor" />

        <div className="py-2">
          <div
            className="receipt-line-item text-[0.75rem] mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="uppercase whitespace-nowrap">SKETCH</span>
            <span className="leader" />
            <span className="text-[0.5rem] uppercase" style={{ color: 'var(--ink-muted)' }}>OPTIONAL</span>
          </div>

          {/* Drawing canvas framed as "ATTACH SKETCH ↓" box */}
          <div
            style={{
              border: '1px dashed var(--ink-muted)',
              padding: '2px',
              position: 'relative',
            }}
          >
            <div
              className="text-[0.5rem] uppercase tracking-widest text-center py-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', borderBottom: '1px dashed var(--ink-muted)' }}
            >
              ATTACH SKETCH ↓
            </div>
            <DrawingCanvas
              onSave={onDrawingChange}
              placeholder="DRAW YOUR POTTERY IDEA — SHAPES, HANDLES, DECORATIONS, PATTERNS..."
            />
            {drawing && (
              <div
                className="text-[0.5rem] uppercase tracking-wider text-center py-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', borderTop: '1px dashed var(--ink-muted)' }}
              >
                ✓ SKETCH SAVED
              </div>
            )}
          </div>

          <div
            className="text-[0.5rem] uppercase tracking-wider mt-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            * EVEN SIMPLE SKETCHES HELP — ART SKILL NOT REQUIRED *
          </div>
        </div>
      </div>

      <ReceiptDivider variant="minor" />

      {/* Helpful tips as line items */}
      <div className="mt-2">
        <div
          className="text-[0.5625rem] uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          HELPFUL DETAILS TO INCLUDE:
        </div>
        {[
          'APPROXIMATE SIZE (HEIGHT / WIDTH)',
          'SPECIAL FEATURES (HANDLES, LID, SPOUT, FEET)',
          'COLOR PREFERENCES OR COMBINATIONS',
          'SURFACE DECORATIONS (PATTERNS, TEXTURES)',
          'INTENDED USE (DISPLAY, DAILY USE, GIFT)',
        ].map((tip, i) => (
          <div
            key={i}
            className="receipt-line-item text-[0.5625rem] py-0.5"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span>{String(i + 1).padStart(2, '0')}.</span>
            <span className="leader" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
