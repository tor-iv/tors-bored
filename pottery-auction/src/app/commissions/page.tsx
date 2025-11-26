'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import DrawingCanvas from '@/components/ui/DrawingCanvas';
import { useAuth } from '@/hooks/useAuth';

const commissionSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  description: z.string().optional(),
});

type CommissionForm = z.infer<typeof commissionSchema>;

export default function CommissionsPage() {
  const { user, userProfile } = useAuth();
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [drawing, setDrawing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommissionForm>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      name: userProfile?.displayName || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: CommissionForm) => {
    // Check if there's any content
    const hasText = data.name || data.email || data.description;
    const hasImages = referenceImages.length > 0;
    const hasDrawing = drawing !== null;

    if (!hasText && !hasImages && !hasDrawing) {
      alert('Please provide at least some content - add text, upload images, or draw something!');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Commission data:', { ...data, referenceImages, drawing });
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      reset();
      setReferenceImages([]);
      setDrawing(null);
    } catch (error) {
      console.error('Error submitting commission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-medium-cream flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-medium-light rounded-lg shadow-sm p-8 max-w-md mx-4 text-center"
        >
          <div className="w-16 h-16 bg-medium-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={32} className={getTextColorClass()} />
          </div>
          <h2 className={`text-2xl font-serif font-bold mb-4 text-[var(--theme-text)]`}>
            Pottery Idea Submitted!
          </h2>
          <p className={`mb-6 opacity-70 text-[var(--theme-text)]`}>
            Thank you for sharing your pottery idea! I&apos;ll review it and get back to you within 3-5 business days to discuss feasibility and next steps.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className={`text-sm hover:opacity-70 transition-opacity underline text-[var(--theme-text)]`}
          >
            Submit Another Idea
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medium-cream">
      <div className="bg-medium-light py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className={`text-4xl md:text-5xl font-serif font-bold mb-4 text-[var(--theme-text)]`}>
              Got a Pottery Idea?
            </h1>
            <p className={`text-lg mb-6 opacity-70 text-[var(--theme-text)]`}>
              Have an idea for a pottery piece you&apos;d love to see? I&apos;d love to hear about it!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-medium-light rounded-lg shadow-sm p-8"
            >
              <h2 className={`text-2xl font-serif font-bold mb-6 text-[var(--theme-text)]`}>
                Share Your Pottery Idea
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 text-[var(--theme-text)]`}>
                      Your Name
                    </label>
                    <input
                      {...register('name')}
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 rounded-none focus:outline-none focus:border-current bg-transparent"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 text-[var(--theme-text)]`}>
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 rounded-none focus:outline-none focus:border-current bg-transparent"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 text-[var(--theme-text)]`}>
                    Describe Your Pottery Idea
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
                    placeholder="Describe your pottery vision in detail. Include size, style, colors, intended use (functional/decorative), glaze preferences, and any specific requirements..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 text-[var(--theme-text)]`}>
                    Reference Images (Optional)
                  </label>
                  <FileUpload
                    onFilesChange={setReferenceImages}
                    maxFiles={5}
                    maxSize={5}
                  />
                  <p className={`text-xs opacity-60 mt-2 text-[var(--theme-text)]`}>
                    Upload images of pottery styles, colors, or designs that inspire your idea
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 text-[var(--theme-text)]`}>
                    Sketch Your Idea (Optional)
                  </label>
                  <p className={`text-xs opacity-60 mb-4 text-[var(--theme-text)]`}>
                    Can&apos;t find a reference? Sketch your pottery idea here - even simple drawings help!
                  </p>
                  <DrawingCanvas
                    onSave={(imageData) => setDrawing(imageData)}
                    placeholder="Draw your pottery idea here - shapes, handles, decorative elements, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 text-sm hover:opacity-70 transition-opacity disabled:opacity-30 underline text-[var(--theme-text)]`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Pottery Idea'}
                </button>
              </form>
            </motion.div>
        </div>
      </div>
    </div>
  );
}