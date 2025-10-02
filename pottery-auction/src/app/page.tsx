'use client';

import { motion } from 'framer-motion';
import { Calendar, Award, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useColorToggle } from '@/contexts/ColorToggleContext';

export default function Home() {
  const { getTextColorClass, getPrimaryColorClass, getBgLightColorClass } = useColorToggle();
  
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-medium-light organic-texture">
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-5xl md:text-7xl font-serif font-bold mb-6 ${getTextColorClass()}`}
          >
            Tor&apos;s Pottery
            <br />
            <span className="opacity-70">Handmade Ceramics</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-80 ${getTextColorClass()}`}
          >
            Discover unique handcrafted pottery pieces in monthly auctions.
            Every 15th, new ceramic creations ready to find their home!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/auctions" className={`hover:opacity-70 transition-opacity underline ${getPrimaryColorClass()}`}>
              View Current Pieces
            </Link>
            <Link href="/gallery" className={`hover:opacity-70 transition-opacity underline ${getPrimaryColorClass()}`}>
              Browse Gallery
            </Link>
          </motion.div>
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white/20 rounded-full hidden lg:block"
        />
      </section>

      <section className="py-20 bg-medium-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-serif font-bold mb-4 ${getTextColorClass()}`}>
              How It Works
            </h2>
            <p className={`text-lg opacity-80 max-w-2xl mx-auto ${getTextColorClass()}`}>
              Join monthly auctions and discover unique handcrafted pottery pieces
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Monthly Releases",
                description: "Every 15th of the month, I release 1-4 unique handcrafted pottery pieces for auction",
              },
              {
                icon: Award,
                title: "Place Your Bid",
                description: "Secure payment through Stripe. Bid with confidence on authentic handmade ceramics",
              },
              {
                icon: Users,
                title: "Win & Enjoy",
                description: "Successful bidders receive their pottery piece, carefully packaged and shipped",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
       
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
   
                transition={{ duration: 0.6, delay: index * 0.2 }}
       
                className="text-center bg-medium-light p-8 rounded-lg shadow-sm"
              >
                <div className={`w-16 h-16 ${getBgLightColorClass()} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <step.icon size={32} className={getTextColorClass()} />
                </div>
                <h3 className={`text-xl font-serif font-semibold mb-4 ${getTextColorClass()}`}>
                  {step.title}
                </h3>
                <p className={`opacity-80 ${getTextColorClass()}`}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-medium-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={`text-4xl font-serif font-bold mb-6 ${getTextColorClass()}`}>
                Commission Ideas
              </h2>
              <p className={`text-lg opacity-80 mb-8 ${getTextColorClass()}`}>
                Have an idea for a pottery piece? Submit your vision and reference photos,
                and I&apos;ll consider creating it. Whether it&apos;s a functional piece or
                decorative art, I&apos;d love to hear your ideas!
              </p>
              <Link href="/commissions" className={`hover:opacity-70 transition-opacity underline ${getTextColorClass()}`}>
                Share Your Idea
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-medium-cream rounded-lg flex items-center justify-center border">
                <div className={`text-center opacity-60 ${getTextColorClass()}`}>
                  <div className={`w-32 h-32 ${getBgLightColorClass()} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <div className={`w-16 h-16 ${getBgLightColorClass()} opacity-60 rounded-full animate-gentle-bounce`} />
                  </div>
                  <p className="text-lg font-medium">Your Custom Piece</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-medium-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-6">
              Ready to Start Collecting?
            </h2>
            <p className="text-lg mb-8 text-white/80">
              Join the community of pottery enthusiasts and never miss an auction
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auctions" className="text-white hover:opacity-70 transition-opacity underline">
                View Current Pieces
              </Link>
              <Link href="/gallery" className="text-white hover:opacity-70 transition-opacity underline">
                Browse Gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}