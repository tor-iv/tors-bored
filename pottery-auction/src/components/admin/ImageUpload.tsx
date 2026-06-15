'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  bucket: 'pottery-images' | 'commission-images';
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  bucket,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Uploads to the local-volume storage endpoint (sharp-optimized server-side),
  // which returns a served /api/media/... URL. Replaces Supabase Storage.
  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const res = await fetch('/api/uploads', { method: 'POST', body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(body.error || 'Upload failed');
    }
    const { url } = (await res.json()) as { url: string };
    return url;
  }, [bucket]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(uploadImage);
      const urls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-theme-primary-dark text-theme-on-primary-dark rounded-full hover:opacity-80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-medium-green cursor-pointer flex flex-col items-center justify-center transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <div className="w-8 h-8 border-4 border-medium-green border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500">Upload</span>
              </>
            )}
          </label>
        )}
      </div>

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <ImageIcon size={16} />
          <span>No images uploaded yet</span>
        </div>
      )}

      {error && (
        <p className="text-theme-error text-sm">{error}</p>
      )}

      <p className="text-gray-500 text-xs">
        {images.length}/{maxImages} images uploaded
      </p>
    </div>
  );
}
