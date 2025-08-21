'use client';

import { motion } from 'framer-motion';
import { Clock, DollarSign, User } from 'lucide-react';
import Image from 'next/image';
import { PotteryPiece } from '@/types';
import Button from '../ui/Button';

interface PotteryCardProps {
  piece: PotteryPiece;
  onBid: (piece: PotteryPiece) => void;
  timeRemaining?: string;
  canBid?: boolean;
}

export default function PotteryCard({ 
  piece, 
  onBid, 
  timeRemaining = '2h 30m', 
  canBid = true 
}: PotteryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="relative aspect-square">
        <Image
          src={piece.images[0] || '/pottery-placeholder.jpg'}
          alt={piece.title}
          fill
          className="object-cover"
        />
        {piece.featured && (
          <div className="absolute top-3 left-3 bg-pottery-burnt text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-pottery-charcoal mb-2">
          {piece.title}
        </h3>
        
        <p className="text-pottery-charcoal/70 mb-4 line-clamp-2">
          {piece.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-pottery-charcoal/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-pottery-sage rounded-full" />
            {piece.dimensions.height}"H x {piece.dimensions.width}"W
          </span>
          <span>
            {piece.techniques.join(', ')}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-pottery-charcoal/60">Current Bid</p>
            <p className="text-2xl font-bold text-pottery-terracotta flex items-center">
              <DollarSign size={20} />
              {piece.currentBid}
            </p>
          </div>
          
          {timeRemaining && (
            <div className="text-right">
              <p className="text-sm text-pottery-charcoal/60 flex items-center gap-1">
                <Clock size={14} />
                Time Left
              </p>
              <p className="font-semibold text-pottery-charcoal">
                {timeRemaining}
              </p>
            </div>
          )}
        </div>
        
        {piece.highestBidder && (
          <div className="mb-4 p-3 bg-pottery-cream rounded-lg">
            <p className="text-sm text-pottery-charcoal/70 flex items-center gap-2">
              <User size={14} />
              Leading bidder: {piece.highestBidder}
            </p>
          </div>
        )}
        
        <Button
          onClick={() => onBid(piece)}
          className="w-full"
          disabled={!canBid}
        >
          {canBid ? 'Place Bid' : 'Auction Ended'}
        </Button>
      </div>
    </motion.div>
  );
}