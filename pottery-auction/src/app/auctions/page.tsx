'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trophy, Filter } from 'lucide-react';
import PotteryCard from '@/components/auction/PotteryCard';
import BidModal from '@/components/auction/BidModal';
import { PotteryPiece } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function AuctionsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedPiece, setSelectedPiece] = useState<PotteryPiece | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [sortBy, setSortBy] = useState('ending-soon');

  const mockPieces: PotteryPiece[] = [
    {
      id: '1',
      title: 'Retro Gaming Controller Collection',
      description: 'A rare collection of vintage gaming controllers from the 80s and 90s. Includes original Nintendo, Sega, and Atari controllers in pristine condition.',
      images: [],
      startingBid: 45,
      currentBid: 85,
      highestBidder: 'retro_gamer_42',
      auctionId: 'auction-dec-2024',
      dimensions: { height: 3, width: 12, depth: 8 },
      techniques: ['Authenticated', 'Original packaging'],
      featured: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Mystery Tech Gadget Box',
      description: 'A curated box of unique tech gadgets and electronic accessories. Contains 5-7 items including quirky USB devices, LED accessories, and mini electronics.',
      images: [],
      startingBid: 65,
      currentBid: 120,
      auctionId: 'auction-dec-2024',
      dimensions: { height: 6, width: 10, depth: 10 },
      techniques: ['Curated', 'Tech verified'],
      featured: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Custom Mechanical Keyboard',
      description: 'A hand-built mechanical keyboard with custom keycaps, RGB lighting, and tactile switches. Perfect for gaming or professional work.',
      images: [],
      startingBid: 80,
      currentBid: 155,
      highestBidder: 'keyboard_enthusiast',
      auctionId: 'auction-dec-2024',
      dimensions: { height: 2, width: 14, depth: 6 },
      techniques: ['Hand-assembled', 'Custom programmed'],
      featured: false,
      createdAt: new Date(),
    },
  ];

  const handleBid = (piece: PotteryPiece) => {
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
    <div className="min-h-screen bg-bored-cream/30">
      <div className="bored-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              December 2024 Drop
            </h1>
            <p className="text-xl mb-6">
              Featuring 3 exceptional finds to cure your boredom
            </p>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>Ends in 2h 30m</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={20} />
                <span>3 Active Items</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-bored-dark mb-2">
              Current Auction Items
            </h2>
            <p className="text-bored-dark/70">
              Place your bids before the auction ends
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Filter size={16} className="text-bored-dark" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-bored-neon/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bored-electric"
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedPieces.map((piece, index) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PotteryCard
                piece={piece}
                onBid={handleBid}
                timeRemaining="2h 30m"
                canBid={true}
              />
            </motion.div>
          ))}
        </div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 bg-white rounded-lg shadow-lg text-center"
          >
            <h3 className="text-xl font-semibold text-bored-dark mb-2">
              Ready to Start Bidding?
            </h3>
            <p className="text-bored-dark/70 mb-4">
              Sign in to place bids and track your auction activity
            </p>
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