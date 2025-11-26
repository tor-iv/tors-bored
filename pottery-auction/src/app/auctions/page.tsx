'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trophy, Filter } from 'lucide-react';
import ItemCard from '@/components/auction/ItemCard';
import BidModal from '@/components/auction/BidModal';
import { Item } from '@/types';
import { useAuth } from '@/hooks/useAuth';

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
    <div className="min-h-screen bg-medium-cream/30">
      <div className="bg-[var(--theme-primary)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              December 2024 Collection
            </h1>
            <p className="text-xl mb-6">
              Featuring 2 exceptional items - limited collection this month
            </p>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>Ends in 2h 30m</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={20} />
                <span>2 Items</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-medium-dark mb-2">
              Current Collection
            </h2>
            <p className="text-medium-dark/70">
              Only 2 unique items available this month - place your bids before the auction ends
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Filter size={16} className="text-medium-dark" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[var(--theme-border)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
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
              <ItemCard
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
            <h3 className="text-xl font-semibold text-medium-dark mb-2">
              Ready to Own a Unique Piece?
            </h3>
            <p className="text-medium-dark/70 mb-4">
              Sign in to place bids on these exclusive items
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