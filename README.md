# Tor's Pottery Shop

An online marketplace for showcasing and selling handmade pottery by Tor through live auctions, with a built-in system for customers to submit pottery ideas.

## Purpose

This platform showcases Tor's handcrafted pottery work and enables submissions for ideas when he has no original thought, jkjk:

- **Showcasing & Selling** - Display pottery pieces in an elegant gallery and sell them through timed auctions
- **Live Auction Experience** - Run live pottery auctions where collectors can bid on unique, one-of-a-kind ceramic pieces in real-time
- **Idea Submissions** - Allow customers to submit ideas for pottery pieces they'd like to see created, with an integrated submission and review system
- **Community Building** - Connect with pottery enthusiasts who appreciate handmade ceramics and want to support the craft

## Key Features

### For the Artist (Tor)
- 📸 **Gallery Management** - Upload and showcase pottery pieces with multiple images, dimensions, and technique details
- 🎨 **Auction Control** - Create and manage timed auctions with custom start/end dates
- 💡 **Idea Review Hub** - Review customer pottery ideas and track potential projects
- 👨‍💼 **Admin Dashboard** - Manage all pieces, auctions, and idea submissions in one place

### For Pottery Enthusiasts
- 🏺 **Browse & Discover** - Explore Tor's pottery collection in a beautiful, responsive gallery
- 💰 **Bid on Pieces** - Participate in live auctions with real-time bidding (powered by Stripe)
- ✍️ **Submit Ideas** - Share pottery ideas with descriptions, reference images, and sketches
- 🎨 **Drawing Tool** - Sketch pottery ideas directly in the submission form to visualize concepts
- 🔔 **Notifications** - Get notified about auction starts, bid updates, and idea submission status

## Tech Stack

Built with modern web technologies for a smooth, professional experience:

- **Next.js 15** (App Router) - Fast, SEO-friendly React framework
- **TypeScript** - Type-safe code
- **Tailwind CSS v4** - Beautiful, responsive design with custom pottery-inspired theme
- **Firebase** - Authentication, database (Firestore), and image storage
- **Stripe** - Secure payment processing for bids
- **Zustand** - Lightweight state management
- **Framer Motion** - Smooth animations and transitions

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase project (for auth, database, storage)
- Stripe account (for payment processing)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tors-bored

# Install dependencies
npm install

# Set up environment variables
cp pottery-auction/.env.local.example pottery-auction/.env.local
# Edit .env.local with your Firebase and Stripe credentials

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your pottery marketplace.

### Environment Variables

Create a `.env.local` file in the `pottery-auction/` directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

## Project Structure

This is a monorepo using npm workspaces:

```
tors-bored/
├── pottery-auction/          # Main Next.js application
│   ├── src/
│   │   ├── app/             # Next.js pages (App Router)
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (theming)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Firebase & utilities
│   │   ├── store/           # Zustand state stores
│   │   └── types/           # TypeScript definitions
│   └── package.json
├── package.json             # Root workspace config
└── CLAUDE.md               # Developer guidance
```

## Available Commands

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

The app is ready to deploy on Vercel, Netlify, or any platform that supports Next.js:

1. Connect your repository
2. Add environment variables
3. Deploy!

For Firebase and Stripe, ensure you've set up:
- Firebase security rules for Firestore and Storage
- Stripe webhook endpoints for payment confirmations

## Customization

### Theme Colors
Edit the color palette in `pottery-auction/tailwind.config.ts` to match your pottery style:

```typescript
colors: {
  medium: {
    green: "#0A8754",    // Primary brand color
    cream: "#F5F1EC",    // Background
    dark: "#2B2B2B",     // Text
  },
}
```

### Fonts
The app uses:
- **Inter** for body text (clean, readable)
- **Caveat** for headings (handwritten, artistic)

Change them in `pottery-auction/src/app/layout.tsx`

## License

Private project - All rights reserved

---

**Built with ❤️ for pottery enthusiasts by Tor**