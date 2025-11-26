'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Trash2, DollarSign, Ruler, Scale } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import Button from '@/components/ui/Button';
import { fetchItem, updateItem, deleteItem, fetchAuctions } from '@/lib/api-client';

const TECHNIQUES = [
  'Wheel Thrown',
  'Hand Built',
  'Coiled',
  'Slab Built',
  'Slip Cast',
  'Glazed',
  'Unglazed',
  'Raku',
  'Stoneware',
  'Porcelain',
  'Earthenware',
];

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_bid: '',
    auction_id: '',
    height: '',
    width: '',
    depth: '',
    weight: '',
    featured: false,
  });

  const [images, setImages] = useState<string[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemData, auctionsData] = await Promise.all([
          fetchItem(itemId),
          fetchAuctions(),
        ]);

        const item = itemData.item;
        setFormData({
          title: item.title,
          description: item.description || '',
          starting_bid: item.starting_bid.toString(),
          auction_id: item.auction_id || '',
          height: item.dimensions?.height?.toString() || '',
          width: item.dimensions?.width?.toString() || '',
          depth: item.dimensions?.depth?.toString() || '',
          weight: item.weight?.toString() || '',
          featured: item.featured || false,
        });
        setImages(item.images || []);
        setSelectedTechniques(item.techniques || []);
        setAuctions(auctionsData.auctions || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load item');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [itemId]);

  const toggleTechnique = (technique: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(technique)
        ? prev.filter((t) => t !== technique)
        : [...prev, technique]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const dimensions = {
        height: formData.height ? parseFloat(formData.height) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined,
      };

      await updateItem(itemId, {
        title: formData.title,
        description: formData.description || undefined,
        starting_bid: parseFloat(formData.starting_bid),
        auction_id: formData.auction_id || undefined,
        images,
        dimensions: Object.values(dimensions).some((v) => v) ? dimensions : undefined,
        techniques: selectedTechniques,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        featured: formData.featured,
      });
      router.push('/admin?tab=items');
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteItem(itemId);
      router.push('/admin?tab=items');
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Item">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-medium-green border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Pottery Item">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
              placeholder="e.g., Midnight Blue Vase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
              rows={4}
              placeholder="Describe the pottery piece..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              bucket="pottery-images"
              maxImages={5}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline mr-1" size={16} />
                Starting Bid *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.starting_bid}
                onChange={(e) => setFormData({ ...formData, starting_bid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Auction
              </label>
              <select
                value={formData.auction_id}
                onChange={(e) => setFormData({ ...formData, auction_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
              >
                <option value="">No auction (Gallery only)</option>
                {auctions.map((auction) => (
                  <option key={auction.id} value={auction.id}>
                    {auction.title} ({auction.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="inline mr-1" size={16} />
              Dimensions (inches)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
                  placeholder="Height"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
                  placeholder="Width"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
                  placeholder="Depth"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Scale className="inline mr-1" size={16} />
              Weight (lbs)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green md:max-w-xs"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Techniques
            </label>
            <div className="flex flex-wrap gap-2">
              {TECHNIQUES.map((technique) => (
                <button
                  key={technique}
                  type="button"
                  onClick={() => toggleTechnique(technique)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTechniques.includes(technique)
                      ? 'bg-medium-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {technique}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-medium-green focus:ring-medium-green border-gray-300 rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Feature on homepage
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin?tab=items')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-auto text-red-600 border-red-300 hover:bg-red-50"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
