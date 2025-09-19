import { create } from 'zustand';
import { Auction, Item, Bid } from '@/types';

interface AuctionState {
  currentAuction: Auction | null;
  auctionPieces: Item[];
  activeBids: Bid[];
  selectedPiece: Item | null;
  setCurrentAuction: (auction: Auction | null) => void;
  setAuctionPieces: (pieces: Item[]) => void;
  setActiveBids: (bids: Bid[]) => void;
  setSelectedPiece: (piece: Item | null) => void;
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