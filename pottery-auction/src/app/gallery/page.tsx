'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, Grid, List } from 'lucide-react';

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'vases', 'bowls', 'sculptures', 'functional', 'decorative'];

  const mockPieces = [
    {
      id: '1',
      title: 'Midnight Blue Vase',
      category: 'vases',
      technique: 'Handcrafted',
      finalPrice: 95,
      auctionDate: 'December 2024',
      image: '/item-1.jpg',
    },
    {
      id: '2',
      title: 'Rustic Bowl Set',
      category: 'bowls',
      technique: 'Handcrafted',
      finalPrice: 125,
      auctionDate: 'November 2024',
      image: '/item-2.jpg',
    },
    {
      id: '3',
      title: 'Sculptural Teapot',
      category: 'functional',
      technique: 'Sculpted',
      finalPrice: 180,
      auctionDate: 'November 2024',
      image: '/item-3.jpg',
    },
    {
      id: '4',
      title: 'Abstract Sculpture',
      category: 'sculptures',
      technique: 'Handcrafted',
      finalPrice: 220,
      auctionDate: 'October 2024',
      image: '/item-4.jpg',
    },
    {
      id: '5',
      title: 'Glazed Dinner Plates',
      category: 'functional',
      technique: 'Handcrafted',
      finalPrice: 85,
      auctionDate: 'October 2024',
      image: '/item-5.jpg',
    },
    {
      id: '6',
      title: 'Decorative Wall Piece',
      category: 'decorative',
      technique: 'Sculpted',
      finalPrice: 160,
      auctionDate: 'September 2024',
      image: '/item-6.jpg',
    },
  ];

  const filteredPieces = mockPieces.filter(piece => {
    const matchesCategory = filterCategory === 'all' || piece.category === filterCategory;
    const matchesSearch = piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         piece.technique.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-medium-cream/30">
      <div className="medium-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Gallery
            </h1>
            <p className="text-xl mb-6">
              Explore our collection of sold and past items
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-dark/40" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-medium-green/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-medium-dark" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-medium-green/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex border border-medium-green/30 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-medium-green text-white' : 'text-medium-dark hover:bg-medium-cream'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-medium-green text-white' : 'text-medium-dark hover:bg-medium-cream'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }
        >
          {filteredPieces.map((piece, index) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={
                viewMode === 'grid'
                  ? 'bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer'
                  : 'bg-white rounded-lg shadow-lg overflow-hidden flex gap-6 p-6'
              }
            >
              <div className={viewMode === 'grid' ? 'relative aspect-square' : 'w-48 aspect-square relative flex-shrink-0'}>
                <div className="w-full h-full bg-medium-green/20 rounded-lg flex items-center justify-center">
                  <div className="text-medium-dark/60 text-center">
                    <div className="w-16 h-16 bg-medium-green/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 bg-medium-green/40 rounded-full" />
                    </div>
                    <p className="text-sm">{piece.title}</p>
                  </div>
                </div>
                {viewMode === 'grid' && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                )}
              </div>

              <div className={viewMode === 'grid' ? 'p-6' : 'flex-1 flex flex-col justify-center'}>
                <h3 className="text-xl font-semibold text-medium-dark mb-2">
                  {piece.title}
                </h3>
                
                <div className="flex items-center gap-4 mb-3 text-sm text-medium-dark/60">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-medium-green rounded-full" />
                    {piece.technique}
                  </span>
                  <span>{piece.auctionDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-medium-dark/60">Final Sale Price</p>
                    <p className="text-xl font-bold text-medium-green">
                      ${piece.finalPrice}
                    </p>
                  </div>
                  
                  <span className="px-3 py-1 bg-medium-green/20 text-medium-dark rounded-full text-sm font-medium">
                    Sold
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredPieces.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-medium-green/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="text-medium-green" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-medium-dark mb-2">
              No items found
            </h3>
            <p className="text-medium-dark/70">
              Try adjusting your search terms or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}