# Clay Auctions - Pottery Auction Website

A modern Next.js application for monthly pottery auctions and custom commissions, built with TypeScript, Firebase, and Stripe integration.

## Features

### 🏺 Monthly Auctions
- Automated monthly auctions on the 15th of each month
- Real-time bidding with Stripe payment integration
- Beautiful pottery showcase with detailed information
- Auction countdown timers and bid tracking

### 🎨 Custom Commissions
- Commission request form with file upload
- Reference image submission
- Project tracking and status updates
- Budget and timeline management

### 🔐 Authentication
- Firebase Authentication
- User profiles and bid history
- Admin dashboard for auction management
- Role-based access control

### 💰 Payment Processing
- Secure Stripe integration
- Pre-authorized payments for bidding
- Automatic charge processing for winners
- Refund handling for losing bidders

### 📱 Responsive Design
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Pottery-inspired color scheme
- Optimized user experience

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Payments**: Stripe
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pottery-auction
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Admin Configuration
ADMIN_EMAIL=your_admin_email@example.com
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── auctions/          # Auction listing pages
│   ├── commissions/       # Commission request pages
│   ├── gallery/           # Pottery gallery pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── auction/          # Auction-specific components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/                # Zustand stores
└── types/                # TypeScript type definitions
```

## Color Scheme

The website uses a pottery-inspired color palette:
- **Terracotta**: `#D2691E` - Primary accent color
- **Clay**: `#8B4513` - Secondary brown
- **Sage**: `#9CAF88` - Accent green
- **Cream**: `#F5F5DC` - Light background
- **Burnt Orange**: `#CC5500` - Highlight color
- **Charcoal**: `#36454F` - Text and dark elements

## Next Steps

To complete the setup:

1. **Firebase Setup**: Create a Firebase project and configure Firestore, Authentication, and Storage
2. **Stripe Setup**: Configure Stripe for payment processing and webhook handling
3. **Environment Variables**: Add your actual API keys to `.env.local`
4. **Admin User**: Set your email as the admin in the environment variables
5. **Deploy**: Deploy to Vercel or your preferred hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

Built with ❤️ for pottery enthusiasts and collectors.
