'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  Mail,
  User,
  DollarSign,
  Clock,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import { fetchCommission, updateCommission } from '@/lib/api-client';

type CommissionStatus = 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed';

const STATUS_OPTIONS: Array<{
  value: CommissionStatus;
  label: string;
  icon: typeof AlertCircle;
  color: string;
}> = [
  { value: 'submitted', label: 'Submitted', icon: AlertCircle, color: 'blue' },
  { value: 'reviewing', label: 'Reviewing', icon: MessageSquare, color: 'yellow' },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle, color: 'green' },
  { value: 'declined', label: 'Declined', icon: XCircle, color: 'red' },
  { value: 'in_progress', label: 'In Progress', icon: PlayCircle, color: 'purple' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'gray' },
];

export default function CommissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const commissionId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [commission, setCommission] = useState<any>(null);

  const [formData, setFormData] = useState<{
    status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed';
    admin_notes: string;
  }>({
    status: 'submitted',
    admin_notes: '',
  });

  useEffect(() => {
    const loadCommission = async () => {
      try {
        const data = await fetchCommission(commissionId);
        setCommission(data.commission);
        setFormData({
          status: data.commission.status,
          admin_notes: data.commission.admin_notes || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load commission');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommission();
  }, [commissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateCommission(commissionId, formData);
      setSuccessMessage('Commission updated successfully');
      // Update local state
      setCommission((prev: any) => ({
        ...prev,
        status: formData.status,
        admin_notes: formData.admin_notes,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to update commission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    switch (option?.color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Commission Details" backHref="/admin?tab=commissions">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-medium-green border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!commission) {
    return (
      <AdminLayout title="Commission Details" backHref="/admin?tab=commissions">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Commission Not Found</h2>
          <p className="text-gray-600 mb-4">The commission you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin?tab=commissions')}>
            Back to Commissions
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Commission Details" backHref="/admin?tab=commissions">
      <div className="space-y-6">
        {/* Commission Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Commission Request
              </h2>
              <p className="text-sm text-gray-500">
                Submitted {new Date(commission.submitted_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(commission.status)}`}>
              {commission.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Customer Information</h3>
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{commission.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${commission.email}`} className="font-medium text-medium-green hover:underline">
                    {commission.email}
                  </a>
                </div>
              </div>
              {commission.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">${commission.budget}</p>
                  </div>
                </div>
              )}
              {commission.timeline && (
                <div className="flex items-center gap-3">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-medium">{commission.timeline}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Request Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Request Details</h3>
              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{commission.description}</p>
              </div>
            </div>
          </div>

          {/* Images */}
          {commission.images && commission.images.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 border-b pb-2 mb-4">
                <ImageIcon className="inline mr-2" size={18} />
                Reference Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {commission.images.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-medium-green transition-colors"
                  >
                    <img
                      src={url}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Response Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Response</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: option.value })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.status === option.value
                        ? 'border-medium-green bg-medium-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon
                      size={18}
                      className={formData.status === option.value ? 'text-medium-green' : 'text-gray-400'}
                    />
                    <span className={formData.status === option.value ? 'font-medium text-medium-green' : 'text-gray-700'}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-green"
                rows={4}
                placeholder="Add internal notes about this commission..."
              />
              <p className="text-sm text-gray-500 mt-1">
                These notes are for internal use only and won't be visible to the customer.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {successMessage}
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
                onClick={() => router.push('/admin?tab=commissions')}
              >
                Back to List
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
