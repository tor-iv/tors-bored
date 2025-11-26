'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Package,
  MessageSquare,
  TrendingUp,
  Plus,
  Settings,
  Users,
  DollarSign,
  Edit,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { useDashboardStats } from '@/hooks/queries/useStats';
import { useAuctions } from '@/hooks/queries/useAuctions';
import { useItems } from '@/hooks/queries/useItems';
import { useCommissions } from '@/hooks/queries/useCommissions';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Sync tab from URL query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'auctions', 'items', 'commissions', 'users'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch data using React Query
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: auctionsData, isLoading: auctionsLoading } = useAuctions();
  const { data: itemsData, isLoading: itemsLoading } = useItems();
  const { data: commissionsData, isLoading: commissionsLoading } = useCommissions();

  const isLoading = authLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medium-cream/30 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-medium-green border-t-transparent rounded-full animate-pottery-wheel" />
      </div>
    );
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="min-h-screen bg-medium-cream/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-medium-dark mb-4">
            Access Denied
          </h1>
          <p className="text-medium-dark/70">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'auctions', label: 'Auctions', icon: Calendar },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'commissions', label: 'Commissions', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
  ];

  // Prepare stats from real data
  const stats = [
    {
      label: 'Active Auctions',
      value: statsData?.activeAuctions?.toString() || '0',
      change: '+0',
      icon: Calendar
    },
    {
      label: 'Total Revenue',
      value: `$${statsData?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+0%',
      icon: DollarSign
    },
    {
      label: 'Items',
      value: statsData?.totalItems?.toString() || '0',
      change: '+0',
      icon: Package
    },
    {
      label: 'Commission Requests',
      value: statsData?.pendingCommissions?.toString() || '0',
      change: '+0',
      icon: MessageSquare
    },
  ];

  const auctions = auctionsData?.auctions || [];
  const items = itemsData?.items || [];
  const commissions = commissionsData?.commissions || [];

  return (
    <div className="min-h-screen bg-medium-cream/30">
      <div className="medium-gradient text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-white/80">
                Manage your auctions and commissions
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-medium-green">
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-medium-dark/60 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-medium-dark">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-medium-green/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="text-medium-green" size={24} />
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-sm ${stat.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-medium-dark/60 text-sm ml-1">
                  from last month
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-medium-green text-medium-green'
                      : 'border-transparent text-medium-dark/60 hover:text-medium-dark'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-medium-dark">
                    Recent Activity
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { action: 'New bid placed', item: 'Midnight Blue Vase', amount: '$95', time: '2 minutes ago' },
                    { action: 'Commission submitted', item: 'Custom Tea Set', amount: null, time: '1 hour ago' },
                    { action: 'Auction ended', item: 'Rustic Bowl Set', amount: '$125', time: '3 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-medium-cream/50 rounded-lg">
                      <div>
                        <p className="font-medium text-medium-dark">
                          {activity.action}
                        </p>
                        <p className="text-medium-dark/60 text-sm">
                          {activity.item}
                        </p>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="font-semibold text-medium-green">
                            {activity.amount}
                          </p>
                        )}
                        <p className="text-medium-dark/60 text-sm">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'auctions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-medium-dark">
                    Manage Auctions
                  </h2>
                  <Button onClick={() => router.push('/admin/auctions/new')}>
                    <Plus size={16} className="mr-2" />
                    Create Auction
                  </Button>
                </div>

                {auctionsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto border-4 border-medium-green border-t-transparent rounded-full animate-pottery-wheel" />
                  </div>
                ) : auctions.length === 0 ? (
                  <div className="bg-medium-cream/50 rounded-lg p-8 text-center">
                    <Calendar className="mx-auto text-medium-dark/40 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-medium-dark mb-2">
                      No auctions yet
                    </h3>
                    <p className="text-medium-dark/60 mb-4">
                      Create your first auction to start receiving bids
                    </p>
                    <Button onClick={() => router.push('/admin/auctions/new')}>
                      Schedule Auction
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auctions.map((auction: any) => (
                      <div key={auction.id} className="border border-medium-green/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-medium-dark text-lg">
                              {auction.title}
                            </h3>
                            <p className="text-medium-dark/60 text-sm mt-1">
                              {auction.description || 'No description'}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-medium-dark/60">
                              <span>
                                Start: {new Date(auction.start_date).toLocaleDateString()}
                              </span>
                              <span>
                                End: {new Date(auction.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                auction.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : auction.status === 'upcoming'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {auction.status}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/auctions/${auction.id}/edit`)}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-medium-dark">
                    Item Collection
                  </h2>
                  <Button onClick={() => router.push('/admin/items/new')}>
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>

                {itemsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto border-4 border-medium-green border-t-transparent rounded-full animate-pottery-wheel" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="bg-medium-cream/50 rounded-lg p-8 text-center">
                    <Package className="mx-auto text-medium-dark/40 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-medium-dark mb-2">
                      No items yet
                    </h3>
                    <p className="text-medium-dark/60 mb-4">
                      Add your first pottery item to get started
                    </p>
                    <Button onClick={() => router.push('/admin/items/new')}>
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item: any) => (
                      <div key={item.id} className="border border-medium-green/20 rounded-lg p-4">
                        {item.images && item.images.length > 0 ? (
                          <div className="aspect-square rounded-lg mb-4 overflow-hidden">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-medium-green/20 rounded-lg mb-4 flex items-center justify-center">
                            <Package className="text-medium-green/40" size={48} />
                          </div>
                        )}
                        <h3 className="font-medium text-medium-dark mb-1">
                          {item.title}
                        </h3>
                        <p className="text-medium-dark/60 text-sm mb-1">
                          Starting bid: ${item.starting_bid}
                        </p>
                        <p className="text-medium-dark/60 text-sm mb-3">
                          Current bid: ${item.current_bid || 0}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push(`/admin/items/${item.id}/edit`)}
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'commissions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-medium-dark">
                    Commission Requests
                  </h2>
                </div>

                {commissionsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto border-4 border-medium-green border-t-transparent rounded-full animate-pottery-wheel" />
                  </div>
                ) : commissions.length === 0 ? (
                  <div className="bg-medium-cream/50 rounded-lg p-8 text-center">
                    <MessageSquare className="mx-auto text-medium-dark/40 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-medium-dark mb-2">
                      No commission requests yet
                    </h3>
                    <p className="text-medium-dark/60">
                      Commission requests from customers will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commissions.map((commission: any) => (
                      <div key={commission.id} className="border border-medium-green/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-medium-dark">
                              {commission.description.slice(0, 60)}
                              {commission.description.length > 60 ? '...' : ''}
                            </h3>
                            <p className="text-medium-dark/60 text-sm">
                              by {commission.name} ({commission.email}) •{' '}
                              {new Date(commission.submitted_at).toLocaleDateString()}
                            </p>
                            {commission.budget && (
                              <p className="text-medium-dark/60 text-sm mt-1">
                                Budget: ${commission.budget}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                commission.status === 'submitted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : commission.status === 'reviewing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : commission.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : commission.status === 'declined'
                                  ? 'bg-red-100 text-red-800'
                                  : commission.status === 'in_progress'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {commission.status.replace('_', ' ')}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/commissions/${commission.id}`)}
                            >
                              <Eye size={14} className="mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-medium-dark">
                  User Management
                </h2>
                
                <div className="bg-medium-cream/50 rounded-lg p-8 text-center">
                  <Users className="mx-auto text-medium-dark/40 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-medium-dark mb-2">
                    User management coming soon
                  </h3>
                  <p className="text-medium-dark/60">
                    View and manage user accounts, bidding history, and permissions
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}