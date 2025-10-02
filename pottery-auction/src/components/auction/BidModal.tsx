'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, TrendingUp } from 'lucide-react';
import { Item } from '@/types';
import Button from '../ui/Button';
import { useColorToggle } from '@/contexts/ColorToggleContext';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  piece: Item | null;
  onSubmitBid: (amount: number) => Promise<void>;
}

export default function BidModal({ isOpen, onClose, piece, onSubmitBid }: BidModalProps) {
  const { getPrimaryColorClass, getBorderColorClass, getRingColorClass, getHoverBgColorClass } = useColorToggle();
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!piece) return null;

  const minBid = piece.currentBid + 5;
  const suggestedBids = [minBid, minBid + 10, minBid + 25, minBid + 50];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (amount < minBid) {
      setError(`Minimum bid is $${minBid}`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await onSubmitBid(amount);
      onClose();
      setBidAmount('');
    } catch (error: any) {
      setError(error.message || 'Failed to place bid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-medium-dark mb-2">
                  Place Your Bid
                </h2>
                <h3 className="text-lg text-medium-dark/80">
                  {piece.title}
                </h3>
              </div>
              
              <div className="mb-6 p-4 bg-medium-cream rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-medium-dark/70">Current Bid:</span>
                  <span className={`text-xl font-bold ${getPrimaryColorClass()} flex items-center`}>
                    <DollarSign size={18} />
                    {piece.currentBid}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-medium-dark/70">Minimum Bid:</span>
                  <span className="font-semibold text-medium-dark flex items-center">
                    <DollarSign size={16} />
                    {minBid}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-medium-dark mb-2">
                    Your Bid Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:${getRingColorClass()}`}
                      placeholder={minBid.toString()}
                      min={minBid}
                      step="1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-medium-dark/70 mb-3 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Quick bid amounts:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedBids.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setBidAmount(amount.toString())}
                        className={`p-2 border ${getBorderColorClass()} ${getPrimaryColorClass()} rounded-lg ${getHoverBgColorClass()} hover:text-white transition-colors`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-medium-dark/60 mb-4">
                    By placing a bid, you agree to our terms and authorize payment if you win.
                  </p>
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Place Bid
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}