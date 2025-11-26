'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, Filter, Flame, Users } from 'lucide-react';
import ItemCard from '@/components/auction/ItemCard';
import BidModal from '@/components/auction/BidModal';
import { Item } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { KilnIcon, ClayBlob, FloatingDecoration } from '@/components/decorations';
import { staggerContainer, clayForm, kilnGlow } from '@/lib/animation-variants';

// Kiln-styled countdown timer component
function KilnTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsUrgent(timeLeft.hours === 0 && timeLeft.minutes < 10);
  }, [timeLeft]);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <motion.div
      className="flex items-center gap-3"
      variants={isUrgent ? kilnGlow : undefined}
      animate={isUrgent ? "glow" : "rest"}
    >
      <KilnIcon
        className={`w-8 h-8 ${isUrgent ? 'text-orange-400' : 'text-white/80'}`}
      />
      <div className="flex items-center gap-1">
        {[
          { value: timeLeft.hours, label: 'h' },
          { value: timeLeft.minutes, label: 'm' },
          { value: timeLeft.seconds, label: 's' },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center">
            <motion.span
              key={`${unit.label}-${unit.value}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`
                text-2xl font-bold tabular-nums
                ${isUrgent ? 'text-orange-300' : 'text-white'}
              `}
              style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '2rem' }}
            >
              {formatNumber(unit.value)}
            </motion.span>
            <span className="text-white/60 text-sm ml-0.5">{unit.label}</span>
            {i < 2 && <span className="text-white/40 mx-1">:</span>}
          </div>
        ))}
      </div>
      {isUrgent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full"
        >
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs text-orange-300">Hot!</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AuctionsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedPiece, setSelectedPiece] = useState<Item | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [sortBy, setSortBy] = useState('ending-soon');

  const mockPieces: Item[] = [
    {
      id: '1',
      title: 'Flower Vase',
      description: 'A beautiful handcrafted vase with intricate floral patterns. Perfect for displaying your favorite flowers.',
      images: ['/current-pieces/flower-vase.png'],
      startingBid: 45,
      currentBid: 85,
      highestBidder: 'collector_42',
      auctionId: 'auction-dec-2024',
      dimensions: { height: 12, width: 6, depth: 6 },
      techniques: ['Handcrafted', 'Glazed'],
      featured: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Green Vase',
      description: 'An elegant vase with a stunning green glaze finish. Handcrafted with care and attention to detail.',
      images: ['/current-pieces/green-vase.png'],
      startingBid: 80,
      currentBid: 155,
      highestBidder: 'pottery_lover',
      auctionId: 'auction-dec-2024',
      dimensions: { height: 10, width: 5, depth: 5 },
      techniques: ['Handcrafted', 'Glazed'],
      featured: false,
      createdAt: new Date(),
    },
  ];

  const handleBid = (piece: Item) => {
    if (!isAuthenticated) {
      alert('Please sign in to place a bid');
      return;
    }
    setSelectedPiece(piece);
    setShowBidModal(true);
  };

  const handleSubmitBid = async (amount: number) => {
    console.log(`Bidding $${amount} on ${selectedPiece?.title}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const sortedPieces = [...mockPieces].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.currentBid - b.currentBid;
      case 'price-high':
        return b.currentBid - a.currentBid;
      case 'ending-soon':
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1EC' }}>
      {/* Header with gradient */}
      <div
        className="relative overflow-hidden py-16"
        style={{
          background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 100%)'
        }}
      >
        {/* Floating decorations */}
        <FloatingDecoration className="absolute top-10 left-10 opacity-10 hidden lg:block" delay={0}>
          <ClayBlob className="w-40 h-40" color="white" />
        </FloatingDecoration>
        <FloatingDecoration className="absolute bottom-10 right-20 opacity-10 hidden lg:block" delay={1.5}>
          <ClayBlob className="w-24 h-24" color="white" />
        </FloatingDecoration>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              Live Auction
            </motion.span>

            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{
                color: 'var(--theme-text-on-primary)',
                fontFamily: 'var(--font-caveat), cursive'
              }}
            >
              December 2024 Collection
            </h1>
            <p
              className="text-xl mb-8"
              style={{ color: 'var(--theme-text-on-primary)', opacity: 0.9 }}
            >
              Featuring 2 exceptional items - limited collection this month
            </p>

            {/* Stats and timer row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <KilnTimer endTime="2h 30m" />

              <div className="h-8 w-px bg-white/20 hidden sm:block" />

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2" style={{ color: 'var(--theme-text-on-primary)' }}>
                  <Trophy size={20} />
                  <span>2 Items</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--theme-text-on-primary)' }}>
                  <Users size={20} />
                  <span>5 Bidders</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section header with filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: '2rem'
              }}
            >
              Current Collection
            </h2>
            <p style={{ color: 'var(--theme-text-muted)' }}>
              Only 2 unique items available this month - place your bids before the auction ends
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Filter size={16} style={{ color: 'var(--theme-text-muted)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
              style={{
                border: '2px solid rgba(224, 120, 86, 0.2)',
                backgroundColor: 'white',
                color: 'var(--theme-text)'
              }}
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </motion.div>

        {/* Items grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {sortedPieces.map((piece) => (
            <motion.div
              key={piece.id}
              variants={clayForm}
            >
              <ItemCard
                piece={piece}
                onBid={handleBid}
                timeRemaining="2h 30m"
                canBid={true}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
              border: '1px solid rgba(224, 120, 86, 0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <h3
              className="text-2xl font-semibold mb-2"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive'
              }}
            >
              Ready to Own a Unique Piece?
            </h3>
            <p className="mb-6" style={{ color: 'var(--theme-text-muted)' }}>
              Sign in to place bids on these exclusive items
            </p>
            <motion.button
              className="px-6 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-text-on-primary)',
                boxShadow: '0 4px 0 var(--theme-primary-dark)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 2 }}
            >
              Sign In to Bid
            </motion.button>
          </motion.div>
        )}
      </div>

      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        piece={selectedPiece}
        onSubmitBid={handleSubmitBid}
      />
    </div>
  );
}
