'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Package, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Settings,
  Users,
  DollarSign 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function AdminPage() {
  const { userProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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

  const stats = [
    { label: 'Active Auctions', value: '1', change: '+0', icon: Calendar },
    { label: 'Total Revenue', value: '$2,450', change: '+12%', icon: DollarSign },
    { label: 'Items', value: '24', change: '+3', icon: Package },
    { label: 'Commission Requests', value: '7', change: '+2', icon: MessageSquare },
  ];

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
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Create Auction
                  </Button>
                </div>
                
                <div className="bg-medium-cream/50 rounded-lg p-8 text-center">
                  <Calendar className="mx-auto text-medium-dark/40 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-medium-dark mb-2">
                    No upcoming auctions
                  </h3>
                  <p className="text-medium-dark/60 mb-4">
                    Create your next monthly auction to start receiving bids
                  </p>
                  <Button>Schedule Next Auction</Button>
                </div>
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
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="border border-medium-green/20 rounded-lg p-4">
                      <div className="aspect-square bg-medium-green/20 rounded-lg mb-4" />
                      <h3 className="font-medium text-medium-dark mb-1">
                        Item #{item}
                      </h3>
                      <p className="text-medium-dark/60 text-sm mb-3">
                        Ready for auction
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1">
                          Add to Auction
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Johnson', project: 'Custom Wedding Set', status: 'reviewing', submitted: '2 days ago' },
                    { name: 'Mike Chen', project: 'Garden Planters', status: 'accepted', submitted: '1 week ago' },
                    { name: 'Emma Davis', project: 'Kitchen Dinnerware', status: 'in_progress', submitted: '2 weeks ago' },
                  ].map((commission, index) => (
                    <div key={index} className="border border-medium-green/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-medium-dark">
                            {commission.project}
                          </h3>
                          <p className="text-medium-dark/60 text-sm">
                            by {commission.name} • {commission.submitted}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            commission.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                            commission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {commission.status.replace('_', ' ')}
                          </span>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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