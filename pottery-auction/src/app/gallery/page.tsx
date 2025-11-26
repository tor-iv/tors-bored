'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, Grid, List } from 'lucide-react';
import Image from 'next/image';
import { VaseSketch, ClayBlob, FloatingDecoration } from '@/components/decorations';
import { staggerContainer, clayForm } from '@/lib/animation-variants';

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'vases', 'bowls', 'sculptures', 'functional', 'decorative'];

  const mockPieces = [
    {
      id: '1',
      title: 'Pre-Fire Vase',
      category: 'vases',
      technique: 'Handcrafted',
      finalPrice: 95,
      auctionDate: 'December 2024',
      image: '/gallery/pre-fire-vase.jpeg',
    },
    {
      id: '2',
      title: 'Pumpkin Collection',
      category: 'decorative',
      technique: 'Handcrafted',
      finalPrice: 125,
      auctionDate: 'November 2024',
      image: '/gallery/pumpkins.jpeg',
    },
    {
      id: '3',
      title: 'Work in Progress',
      category: 'sculptures',
      technique: 'Sculpted',
      finalPrice: 180,
      auctionDate: 'November 2024',
      image: '/gallery/random-in-progress.jpeg',
    },
    {
      id: '4',
      title: 'Studio Collection',
      category: 'decorative',
      technique: 'Handcrafted',
      finalPrice: 220,
      auctionDate: 'October 2024',
      image: '/gallery/random-studio.jpeg',
    },
    {
      id: '5',
      title: 'Vase Collection',
      category: 'vases',
      technique: 'Handcrafted',
      finalPrice: 85,
      auctionDate: 'October 2024',
      image: '/gallery/vases.jpeg',
    },
  ];

  const filteredPieces = mockPieces.filter(piece => {
    const matchesCategory = filterCategory === 'all' || piece.category === filterCategory;
    const matchesSearch = piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         piece.technique.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1EC' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden py-16"
        style={{ backgroundColor: 'var(--theme-primary)' }}
      >
        {/* Floating decoration */}
        <FloatingDecoration className="absolute top-10 right-20 opacity-20 hidden lg:block" delay={0}>
          <ClayBlob className="w-32 h-32" color="white" />
        </FloatingDecoration>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{
                color: 'var(--theme-text-on-primary)',
                fontFamily: 'var(--font-caveat), cursive'
              }}
            >
              Gallery
            </h1>
            <p
              className="text-xl"
              style={{ color: 'var(--theme-text-on-primary)', opacity: 0.9 }}
            >
              Explore past pottery pieces and completed works
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{ color: 'var(--theme-text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search pottery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  border: '2px solid rgba(224, 120, 86, 0.2)',
                  backgroundColor: 'white',
                  color: 'var(--theme-text)'
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} style={{ color: 'var(--theme-text-muted)' }} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
                style={{
                  border: '2px solid rgba(224, 120, 86, 0.2)',
                  backgroundColor: 'white',
                  color: 'var(--theme-text)'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* View mode toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '2px solid rgba(224, 120, 86, 0.2)' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--theme-primary)' : 'white',
                  color: viewMode === 'grid' ? 'var(--theme-text-on-primary)' : 'var(--theme-text-muted)'
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--theme-primary)' : 'white',
                  color: viewMode === 'list' ? 'var(--theme-text-on-primary)' : 'var(--theme-text-muted)'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }
        >
          {filteredPieces.map((piece) => (
            <motion.div
              key={piece.id}
              variants={clayForm}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
              className={`
                group cursor-pointer
                ${viewMode === 'grid'
                  ? 'rounded-xl overflow-hidden'
                  : 'rounded-xl overflow-hidden flex gap-6 p-4'
                }
              `}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
                border: '1px solid rgba(224, 120, 86, 0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                borderRadius: viewMode === 'grid' ? '12px 8px 12px 8px' : '12px'
              }}
            >
              {/* Image */}
              <div className={viewMode === 'grid' ? 'relative aspect-square' : 'w-48 aspect-square relative flex-shrink-0 rounded-lg overflow-hidden'}>
                <Image
                  src={piece.image}
                  alt={piece.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes={viewMode === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw' : '192px'}
                />
                {/* Overlay on hover */}
                <div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
                />
                {/* Sold badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium pottery-badge"
                    style={{ transform: 'rotate(3deg)' }}
                  >
                    Sold
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className={viewMode === 'grid' ? 'p-5' : 'flex-1 flex flex-col justify-center'}>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--font-caveat), cursive',
                    fontSize: '1.5rem'
                  }}
                >
                  {piece.title}
                </h3>

                <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    />
                    {piece.technique}
                  </span>
                  <span>{piece.auctionDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                      Final Sale Price
                    </p>
                    <p
                      className="font-bold"
                      style={{
                        color: 'var(--theme-text)',
                        fontFamily: 'var(--font-caveat), cursive',
                        fontSize: '1.5rem'
                      }}
                    >
                      ${piece.finalPrice}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredPieces.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <VaseSketch
              className="w-24 h-24 mx-auto mb-4"
              color="var(--theme-text-muted)"
            />
            <h3
              className="text-2xl font-semibold mb-2"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive'
              }}
            >
              No pottery found
            </h3>
            <p style={{ color: 'var(--theme-text-muted)' }}>
              Try adjusting your search terms or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
