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
  sku?: string;
  listingType?: 'auction' | 'buy_now';
  buyNowPrice?: number;
  reservePrice?: number;
  soldAt?: Date;
  reservedUntil?: Date;
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

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  priceCents: number;
  source: 'buy_now' | 'auction_win';
  createdAt: Date;
  item?: Pick<Item, 'id' | 'title' | 'sku' | 'images'>;
}

export interface Order {
  id: string;
  userId: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  shipping?: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
}