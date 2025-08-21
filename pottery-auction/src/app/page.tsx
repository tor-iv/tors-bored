'use client';

import { motion } from 'framer-motion';
import { Calendar, Award, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useColorToggle } from '@/contexts/ColorToggleContext';

export default function Home() {
  const { getTextColorForBackground } = useColorToggle();
  
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-medium-light organic-texture">
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-5xl md:text-7xl font-serif font-bold mb-6 ${getTextColorForBackground('light')}`}
          >
            Beat Boredom
            <br />
            <span className="opacity-70">Find Amazing Stuff</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-lg md:text-xl font-serif mb-12 max-w-2xl mx-auto opacity-80 ${getTextColorForBackground('light')}`}
          >
            Discover unique gadgets, collectibles, and cool finds in our monthly auctions.
            Every 15th, new exciting items to cure your boredom!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/auctions" className={`font-serif hover:opacity-70 transition-opacity underline ${getTextColorForBackground('light')}`}>
              View Current Finds
            </Link>
            <Link href="/gallery" className={`font-serif hover:opacity-70 transition-opacity underline ${getTextColorForBackground('light')}`}>
              Browse Past Finds
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
            <h2 className={`text-4xl font-serif font-bold mb-4 ${getTextColorForBackground('medium')}`}>
              How It Works
            </h2>
            <p className={`text-lg font-serif opacity-80 max-w-2xl mx-auto ${getTextColorForBackground('medium')}`}>
              Join our monthly auctions and discover unique items to beat your boredom
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Monthly Drops",
                description: "Every 15th of the month, we release 1-4 unique gadgets, collectibles, or cool finds for auction",
              },
              {
                icon: Award,
                title: "Place Your Bid",
                description: "Secure payment through Stripe. Bid with confidence on authentic and verified items",
              },
              {
                icon: Users,
                title: "Win & Enjoy",
                description: "Successful bidders receive their awesome find, carefully packaged and shipped",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center bg-medium-light p-8 rounded-lg shadow-sm"
              >
                <div className="w-16 h-16 bg-medium-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon size={32} className={getTextColorForBackground('light')} />
                </div>
                <h3 className={`text-xl font-serif font-semibold mb-4 ${getTextColorForBackground('light')}`}>
                  {step.title}
                </h3>
                <p className={`font-serif opacity-80 ${getTextColorForBackground('light')}`}>
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
              <h2 className={`text-4xl font-serif font-bold mb-6 ${getTextColorForBackground('light')}`}>
                Custom Requests
              </h2>
              <p className={`text-lg font-serif opacity-80 mb-8 ${getTextColorForBackground('light')}`}>
                Have something specific in mind? Submit your ideas and reference photos 
                for custom finds. We'll source or create unique items to match your interests 
                and help cure your boredom in style.
              </p>
              <Link href="/commissions" className={`font-serif hover:opacity-70 transition-opacity underline ${getTextColorForBackground('light')}`}>
                Start Your Request
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-medium-cream rounded-lg flex items-center justify-center border">
                <div className={`text-center opacity-60 ${getTextColorForBackground('medium')}`}>
                  <div className="w-32 h-32 bg-medium-green bg-opacity-10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-16 h-16 bg-medium-green bg-opacity-20 rounded-full animate-gentle-bounce" />
                  </div>
                  <p className="text-lg font-serif font-medium">Your Custom Find</p>
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
              Ready to Beat Boredom?
            </h2>
            <p className="text-lg font-serif mb-8 text-white/80">
              Join our community of cool find hunters and never miss an exciting auction
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auctions" className="font-serif text-white hover:opacity-70 transition-opacity underline">
                View Current Finds
              </Link>
              <Link href="/gallery" className="font-serif text-white hover:opacity-70 transition-opacity underline">
                Browse Past Finds
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}