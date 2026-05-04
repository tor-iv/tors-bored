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
import { clayForm, staggerContainer } from '@/lib/animation-variants';
import RoughBorder from '@/components/theme/handdrawn/RoughBorder';

export default function HanddrawnHome() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 paper-texture" style={{ backgroundColor: 'var(--bg, #f7f3e8)' }} />

        <FloatingDecoration className="absolute top-20 left-10 opacity-30 hidden lg:block" delay={0}>
          <ClayBlob className="w-40 h-40" color="var(--accent, #8c6e4b)" />
        </FloatingDecoration>
        <FloatingDecoration className="absolute bottom-40 left-1/4 opacity-20 hidden lg:block" delay={2}>
          <ClayBlob className="w-24 h-24" color="var(--border, #c4b89a)" />
        </FloatingDecoration>

        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0 hidden lg:block">
          <Image
            src="/paintings/multicolor-vase.png"
            alt="Pottery background"
            fill
            className="object-contain object-right"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg,#f7f3e8)] via-[var(--bg,#f7f3e8)]/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
          >
            <span className="playful-tilt inline-block">Tor&apos;s Bored</span>{' '}
            <span className="playful-tilt-right inline-block">Pottery</span>
            <br />
            <motion.span
              className="opacity-70 text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
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
            style={{ color: 'var(--ink)', opacity: 0.8, fontFamily: 'var(--font-body)' }}
          >
            Discover unique handcrafted pottery pieces in monthly auctions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <RoughBorder roughness={1.5} strokeWidth={2} stroke="var(--accent)" fill="var(--accent)">
              <Link
                href="/browse"
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--bg)',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Browse Pieces
              </Link>
            </RoughBorder>
            <RoughBorder roughness={1.5} strokeWidth={2} stroke="var(--accent)" fill="none">
              <Link
                href="/shop"
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Shop Now
              </Link>
            </RoughBorder>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-16 right-16 hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <PotteryWheelDoodle className="w-24 h-24 opacity-30" color="var(--ink)" animate={true} />
        </motion.div>
      </section>

      <SectionDivider className="my-0 py-8" />

      {/* How It Works */}
      <section className="py-20 clay-dots" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl mb-4"
              style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              How It Works
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
            >
              Join monthly auctions and discover unique handcrafted pottery pieces
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Calendar, title: 'Monthly Releases', description: 'New handcrafted pottery pieces released each month for auction.' },
              { icon: Award, title: 'Place Your Bid', description: 'Secure payment through Stripe. Bid with confidence on authentic handmade ceramics.' },
              { icon: Users, title: 'Win & Enjoy', description: 'Winners receive their pottery piece, carefully packaged and shipped.' },
            ].map((step) => (
              <motion.div
                key={step.title}
                variants={clayForm}
                className="text-center p-8 rounded-lg"
                style={{ background: 'var(--bg-well)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: 'var(--accent-light)' }}
                >
                  <step.icon size={32} style={{ color: 'var(--ink)' }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </h3>
                <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Commission Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg-well)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl mb-6"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 600 }}
              >
                Commission Ideas
              </h2>
              <p
                className="text-lg mb-8"
                style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
              >
                Have an idea for a pottery piece? Submit your vision and reference photos,
                and I&apos;ll consider creating it.
              </p>
              <RoughBorder roughness={1.5} strokeWidth={2} stroke="var(--accent)" fill="var(--accent)" style={{ display: 'inline-block' }}>
                <Link
                  href="/commissions"
                  style={{
                    display: 'block',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--bg)',
                    textDecoration: 'none',
                  }}
                >
                  Share Your Idea
                </Link>
              </RoughBorder>
            </div>
            <div
              className="relative aspect-square rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-light)', border: '2px dashed var(--border)' }}
            >
              <HandsOnClay className="w-32 h-32" color="var(--ink)" />
              <p
                className="absolute bottom-8 text-center"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}
              >
                Your Custom Piece
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
