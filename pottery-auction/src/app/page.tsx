'use client';

import { motion } from 'framer-motion';
import { Calendar, Award, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ClayBlob,
  PotteryWheelDoodle,
  HandsOnClay,
  SectionDivider,
  FloatingDecoration
} from '@/components/decorations';
import { clayForm, staggerContainer, fadeUp } from '@/lib/animation-variants';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle paper texture background */}
        <div className="absolute inset-0 paper-texture" style={{ backgroundColor: '#F5F1EC' }} />

        {/* Floating clay blob decorations */}
        <FloatingDecoration className="absolute top-20 left-10 opacity-30 hidden lg:block" delay={0}>
          <ClayBlob className="w-40 h-40" color="var(--theme-primary)" />
        </FloatingDecoration>
        <FloatingDecoration className="absolute bottom-40 left-1/4 opacity-20 hidden lg:block" delay={2}>
          <ClayBlob className="w-24 h-24" color="var(--theme-accent)" />
        </FloatingDecoration>

        {/* Background Image - positioned on right side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0 hidden lg:block">
          <Image
            src="/paintings/multicolor-vase.png"
            alt="Pottery background"
            fill
            className="object-contain object-right"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F1EC] via-[#F5F1EC]/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6"
            style={{ color: 'var(--theme-text)' }}
          >
            <span className="playful-tilt inline-block">Tor&apos;s Bored</span>{' '}
            <span className="playful-tilt-right inline-block">Pottery</span>
            <br />
            <motion.span
              className="opacity-70 text-4xl md:text-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3 }}
            >
              Handmade Ceramics
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto"
            style={{ color: 'var(--theme-text)', opacity: 0.8 }}
          >
            Discover unique handcrafted pottery pieces in monthly auctions.
            <br />
            <span
              className="font-medium"
              style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '1.2em' }}
            >
              Every 15th, new ceramic creations ready to find their home!
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              href="/auctions"
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-text-on-primary)',
                boxShadow: '0 4px 0 var(--theme-primary-dark)'
              }}
            >
              View Current Pieces
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 border-2"
              style={{
                borderColor: 'var(--theme-primary)',
                color: 'var(--theme-text)'
              }}
            >
              Browse Gallery
            </Link>
          </motion.div>
        </div>

        {/* Pottery wheel decoration instead of plain circle */}
        <motion.div
          className="absolute bottom-16 right-16 hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <PotteryWheelDoodle
            className="w-24 h-24 opacity-30"
            color="var(--theme-text)"
            animate={true}
          />
        </motion.div>
      </section>

      {/* Section Divider */}
      <SectionDivider className="my-0 py-8 bg-[#F5F1EC]" />

      {/* How It Works Section */}
      <section className="py-20 clay-dots" style={{ backgroundColor: '#F5F1EC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-serif font-bold mb-4"
              style={{ color: 'var(--theme-text)' }}
            >
              How It Works
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--theme-text)', opacity: 0.8 }}
            >
              Join monthly auctions and discover unique handcrafted pottery pieces
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
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
                variants={clayForm}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                className="text-center p-8 rounded-lg shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
                  border: '1px solid rgba(224, 120, 86, 0.15)',
                  borderRadius: '12px 8px 12px 8px'
                }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: 'var(--theme-primary-light)' }}
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  <step.icon size={32} style={{ color: 'var(--theme-text)' }} />
                </motion.div>
                <h3
                  className="text-xl font-serif font-semibold mb-4"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {step.title}
                </h3>
                <p style={{ color: 'var(--theme-text)', opacity: 0.8 }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider className="my-0 py-8" />

      {/* Commission Section */}
      <section className="py-20 paper-texture" style={{ backgroundColor: '#FEFEFE' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-4xl font-serif font-bold mb-6"
                style={{ color: 'var(--theme-text)' }}
              >
                Commission Ideas
              </h2>
              <p
                className="text-lg mb-8"
                style={{ color: 'var(--theme-text)', opacity: 0.8 }}
              >
                Have an idea for a pottery piece? Submit your vision and reference photos,
                and I&apos;ll consider creating it. Whether it&apos;s a functional piece or
                decorative art, I&apos;d love to hear your ideas!
              </p>
              <Link
                href="/commissions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-text-on-primary)',
                  boxShadow: '0 4px 0 var(--theme-primary-dark)'
                }}
              >
                Share Your Idea
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div
                className="aspect-square rounded-lg flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, #FAF8F5 100%)',
                  border: '2px dashed var(--theme-primary)',
                  borderRadius: '16px 8px 16px 8px'
                }}
              >
                {/* Hands on clay illustration */}
                <HandsOnClay
                  className="w-32 h-32 mb-4"
                  color="var(--theme-text)"
                />
                <p
                  className="text-lg font-medium playful-tilt"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--font-caveat), cursive',
                    fontSize: '1.5rem'
                  }}
                >
                  Your Custom Piece
                </p>
                <p
                  className="text-sm mt-2"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Bring your vision to life
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
