export interface User {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  bidHistory: string[];
  notifications: boolean;
  createdAt: Date;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingBid: number;
  currentBid: number;
  highestBidder?: string;
  auctionId: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  techniques: string[];
  weight?: number;
  featured: boolean;
  createdAt: Date;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  pieces: string[];
  totalBids: number;
  featuredImage?: string;
  createdAt: Date;
}

export interface Bid {
  id: string;
  pieceId: string;
  userId: string;
  userEmail: string;
  amount: number;
  timestamp: Date;
  stripePaymentIntentId?: string;
  status: 'pending' | 'confirmed' | 'outbid' | 'won';
}

export interface Commission {
  id: string;
  userId: string;
  email: string;
  name: string;
  description: string;
  images: string[];
  budget?: number;
  timeline?: string;
  status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed';
  adminNotes?: string;
  submittedAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  auctionStart: boolean;
  auctionEnd: boolean;
  outbid: boolean;
  bidWon: boolean;
  commissionUpdates: boolean;
  newsletter: boolean;
}