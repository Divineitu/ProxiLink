import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ServiceCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  // router is not required for the scaffold; keep component simple for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assumes vendor is authenticated and vendor_profile id is available in session/profile
      // For now insert service without vendor linkage (developer should wire vendor_id from auth)
      type ServicePayload = { title: string; description: string; category: string; price: number | null };
      const payload: ServicePayload[] = [
        {
          title,
          description,
          category,
          price: price ? Number(price) : null,
        },
      ];

      const { data, error } = await supabase.from('services').insert(payload);

      if (error) throw error;
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      alert('Service created (demo).');
    } catch (err) {
      console.error('Error creating service', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || 'Error creating service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Service (Sprint 3 scaffold)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded">
            {loading ? 'Saving...' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceCreate;
