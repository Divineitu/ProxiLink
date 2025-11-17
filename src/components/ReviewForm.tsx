import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// Simple select-based rating control (1-5)
import { supabase } from '@/integrations/supabase/client';

interface ReviewFormProps {
  serviceId: string;
  onSubmitted?: () => void;
}

const ReviewForm = ({ serviceId, onSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { error } = await supabase.from('reviews').insert([{ service_id: serviceId, user_id: session.user.id, rating, comment }]);
      if (error) throw error;
      setComment('');
      setRating(5);
      onSubmitted?.();
    } catch (err) {
      console.error('Failed to submit review', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm block mb-1">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border p-2 rounded">
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Very good</option>
          <option value={3}>3 - Good</option>
          <option value={2}>2 - Fair</option>
          <option value={1}>1 - Poor</option>
        </select>
      </div>
      <div>
        <label className="text-sm block mb-1">Comment</label>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
      </div>
      <div>
        <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</Button>
      </div>
    </form>
  );
};

export default ReviewForm;
