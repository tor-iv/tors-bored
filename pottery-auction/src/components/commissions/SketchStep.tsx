'use client';

import { motion } from 'framer-motion';
import DrawingCanvas from '@/components/ui/DrawingCanvas';
import { Pencil, MessageSquare } from 'lucide-react';

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
  onDescriptionChange
}: SketchStepProps) {
  return (
    <div>
      <p className="text-center mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        Add details to help bring your vision to life (both optional)
      </p>

      {/* Description Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={18} style={{ color: 'var(--theme-primary)' }} />
          <label
            className="font-medium"
            style={{
              color: 'var(--theme-text)',
              fontFamily: 'var(--font-caveat), cursive',
              fontSize: '1.2rem'
            }}
          >
            Describe Your Vision
          </label>
        </div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--theme-primary)] transition-colors resize-none"
          style={{
            borderColor: 'rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }}
          placeholder="Tell me about your dream piece! Size preferences, special features, intended use, color ideas, decorative patterns, handles, feet, anything that helps me understand your vision..."
        />
        <p className="text-xs mt-2" style={{ color: 'var(--theme-text-muted)' }}>
          The more details you share, the better I can bring your idea to life
        </p>
      </div>

      {/* Drawing Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pencil size={18} style={{ color: 'var(--theme-primary)' }} />
          <label
            className="font-medium"
            style={{
              color: 'var(--theme-text)',
              fontFamily: 'var(--font-caveat), cursive',
              fontSize: '1.2rem'
            }}
          >
            Sketch Your Idea
          </label>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--theme-primary-light)',
              color: 'var(--theme-text-muted)'
            }}
          >
            Optional
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden"
          style={{
            border: '2px solid rgba(224, 120, 86, 0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <DrawingCanvas
            onSave={onDrawingChange}
            placeholder="Draw your pottery idea - shapes, handles, decorations, patterns..."
          />
        </motion.div>

        <p className="text-xs mt-2 text-center" style={{ color: 'var(--theme-text-muted)' }}>
          Even simple sketches help! Don&apos;t worry about being artistic - I just want to understand your idea
        </p>
      </div>

      {/* Helpful tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 rounded-lg"
        style={{ backgroundColor: 'var(--theme-primary-light)' }}
      >
        <h4
          className="font-medium mb-2"
          style={{
            color: 'var(--theme-text)',
            fontFamily: 'var(--font-caveat), cursive',
            fontSize: '1.1rem'
          }}
        >
          Ideas for what to include:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: 'var(--theme-text-muted)' }}>
          <li>• Approximate size (height, width, or compared to common objects)</li>
          <li>• Special features (handles, lid, spout, feet)</li>
          <li>• Color preferences or color combinations</li>
          <li>• Surface decorations (patterns, textures, carvings)</li>
          <li>• Intended use (display, daily use, gift)</li>
        </ul>
      </motion.div>
    </div>
  );
}
