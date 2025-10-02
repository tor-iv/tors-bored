'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useColorToggle } from '@/contexts/ColorToggleContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { getBgColorClass, getHoverBgColorClass, getPrimaryColorClass } = useColorToggle();

  return (
    <footer className="bg-pottery-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className={`w-8 h-8 ${getBgColorClass()} rounded-full`}
              />
              <span className="text-xl font-bold">Marketplace</span>
            </div>
            <p className="text-white/80 mb-6">
              Discover unique items and special collections. Custom requests and curated selections available.
            </p>
            <div className="flex space-x-4">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 ${getBgColorClass()}/20 rounded-full flex items-center justify-center ${getHoverBgColorClass()} transition-colors`}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/auctions', label: 'Current Items' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/commissions', label: 'Custom Requests' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block text-white/80 ${getPrimaryColorClass()} hover:opacity-80 transition-opacity`}
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Service Info</h3>
            <div className="space-y-3 text-white/80">
              <p>Regular content updates</p>
              <p>Secure payment options</p>
              <p>Quality guaranteed items</p>
              <p>Worldwide shipping available</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/80">
                <Mail size={16} />
                <span>hello@marketplace.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <MapPin size={16} />
                <span>Portland, Oregon</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Newsletter</h4>
              <p className="text-white/80 text-sm mb-3">
                Get notified about new items and updates
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none text-white placeholder-white/60"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                />
                <button className={`px-4 py-2 ${getBgColorClass()} rounded-r-lg hover:opacity-80 transition-opacity`}>
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center"
        >
          <p className="text-white/60 text-sm">
            © {currentYear} Marketplace. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}