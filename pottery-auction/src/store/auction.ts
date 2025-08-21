import { create } from 'zustand';
import { Auction, PotteryPiece, Bid } from '@/types';

interface AuctionState {
  currentAuction: Auction | null;
  auctionPieces: PotteryPiece[];
  activeBids: Bid[];
  selectedPiece: PotteryPiece | null;
  setCurrentAuction: (auction: Auction | null) => void;
  setAuctionPieces: (pieces: PotteryPiece[]) => void;
  setActiveBids: (bids: Bid[]) => void;
  setSelectedPiece: (piece: PotteryPiece | null) => void;
  updatePieceBid: (pieceId: string, newBid: number, bidderId: string) => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  currentAuction: null,
  auctionPieces: [],
  activeBids: [],
  selectedPiece: null,
  setCurrentAuction: (currentAuction) => set({ currentAuction }),
  setAuctionPieces: (auctionPieces) => set({ auctionPieces }),
  setActiveBids: (activeBids) => set({ activeBids }),
  setSelectedPiece: (selectedPiece) => set({ selectedPiece }),
  updatePieceBid: (pieceId, newBid, bidderId) => {
    const pieces = get().auctionPieces.map(piece =>
      piece.id === pieceId
        ? { ...piece, currentBid: newBid, highestBidder: bidderId }
        : piece
    );
    set({ auctionPieces: pieces });
    
    if (get().selectedPiece?.id === pieceId) {
      set({
        selectedPiece: {
          ...get().selectedPiece!,
          currentBid: newBid,
          highestBidder: bidderId,
        },
      });
    }
  },
}));