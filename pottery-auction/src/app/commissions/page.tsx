'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Palette, Clock, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import DrawingCanvas from '@/components/ui/DrawingCanvas';
import { useAuth } from '@/hooks/useAuth';
import { useColorToggle } from '@/contexts/ColorToggleContext';

const commissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  description: z.string().min(50, 'Please provide a detailed description (at least 50 characters)'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type CommissionForm = z.infer<typeof commissionSchema>;

export default function CommissionsPage() {
  const { isAuthenticated, user } = useAuth();
  const { getTextColorClass, getTextColorForBackground } = useColorToggle();
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
      name: user?.displayName || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: CommissionForm) => {
    if (!isAuthenticated) {
      alert('Please sign in to submit a commission request');
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
          <h2 className={`text-2xl font-serif font-bold mb-4 ${getTextColorClass()}`}>
            Request Submitted!
          </h2>
          <p className={`mb-6 opacity-70 ${getTextColorClass()}`}>
            Thank you for your custom request. I'll review your details and get back to you within 3-5 business days.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className={`text-sm hover:opacity-70 transition-opacity underline ${getTextColorClass()}`}
          >
            Submit Another Request
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
            <h1 className={`text-4xl md:text-5xl font-serif font-bold mb-4 ${getTextColorClass()}`}>
              Custom Requests
            </h1>
            <p className={`text-lg mb-6 opacity-70 ${getTextColorClass()}`}>
              Have something specific in mind? Let's bring your unique find to life
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <h2 className={`text-2xl font-serif font-bold mb-6 ${getTextColorClass()}`}>
                Request Process
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Palette,
                    title: 'Share Your Vision',
                    description: 'Tell me about your ideal find and upload reference images or draw it out',
                  },
                  {
                    icon: Clock,
                    title: 'Review & Quote',
                    description: "I'll review your request and provide a custom quote within 3-5 days",
                  },
                  {
                    icon: DollarSign,
                    title: 'Sourcing Process',
                    description: 'Upon approval, I will source or create your unique item over 2-4 weeks',
                  },
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-medium-green bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <step.icon size={20} className={getTextColorClass()} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${getTextColorClass()}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm opacity-70 ${getTextColorClass()}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-medium-cream rounded-lg border">
                <h3 className={`font-semibold mb-2 ${getTextColorClass()}`}>
                  Pricing Guide
                </h3>
                <ul className={`text-sm opacity-70 space-y-1 ${getTextColorClass()}`}>
                  <li>• Small items (gadgets, accessories): $25-75</li>
                  <li>• Medium items (collectibles, gear): $75-150</li>
                  <li>• Large items (custom builds): $150-500+</li>
                  <li>• Complex sourcing: Quote on request</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-medium-light rounded-lg shadow-sm p-8"
            >
              <h2 className={`text-2xl font-serif font-bold mb-6 ${getTextColorClass()}`}>
                Custom Request Form
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass()}`}>
                      Your Name *
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
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass()}`}>
                      Email Address *
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
                  <label className="block text-sm font-medium text-pottery-charcoal mb-2">
                    Project Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pottery-terracotta"
                    placeholder="Describe your vision in detail. Include size, style, colors, intended use, and any specific requirements..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass()}`}>
                      Budget Range (Optional)
                    </label>
                    <select
                      {...register('budget')}
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 rounded-none focus:outline-none focus:border-current bg-transparent"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-50">Under $50</option>
                      <option value="50-100">$50 - $100</option>
                      <option value="100-200">$100 - $200</option>
                      <option value="200-300">$200 - $300</option>
                      <option value="over-300">Over $300</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass()}`}>
                      Timeline (Optional)
                    </label>
                    <select
                      {...register('timeline')}
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 rounded-none focus:outline-none focus:border-current bg-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="flexible">Flexible</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="2-months">Within 2 months</option>
                      <option value="3-months">Within 3 months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextColorClass()}`}>
                    Reference Images (Optional)
                  </label>
                  <FileUpload
                    onFilesChange={setReferenceImages}
                    maxFiles={5}
                    maxSize={5}
                  />
                  <p className={`text-xs opacity-60 mt-2 ${getTextColorClass()}`}>
                    Upload images that inspire your vision or show similar styles you like
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextColorClass()}`}>
                    Can't find a reference image? Draw it out!
                  </label>
                  <p className={`text-xs opacity-60 mb-4 ${getTextColorClass()}`}>
                    If you can't find the perfect reference image, use our drawing tool to sketch your idea
                  </p>
                  <DrawingCanvas
                    onSave={(imageData) => setDrawing(imageData)}
                    placeholder="Draw your idea here - even simple sketches help!"
                  />
                  {drawing && (
                    <p className={`text-xs mt-2 ${getTextColorClass()}`}>
                      ✓ Drawing saved! It will be included with your request.
                    </p>
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="p-4 bg-medium-cream rounded-lg border">
                    <p className={`text-sm opacity-70 ${getTextColorClass()}`}>
                      Please sign in to submit your custom request. This helps us keep track of your projects and communicate updates.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAuthenticated || isSubmitting}
                  className={`w-full py-3 text-sm hover:opacity-70 transition-opacity disabled:opacity-30 underline ${getTextColorClass()}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Custom Request'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}