import { Vendor } from '@/lib/proximity';

// Demo vendors shaped like Supabase rows used by Map.tsx (profiles nested)
type DemoVendor = {
  id: string;
  business_name: string;
  category?: string;
  profiles?: {
    location_lat?: number;
    location_lng?: number;
    full_name?: string;
    avatar_url?: string;
  };
};

const demoVendors: DemoVendor[] = [
  {
    id: 'dv-1',
    business_name: "Nairobi Fresh Foods",
    category: 'grocery',
    profiles: { location_lat: -1.2921, location_lng: 36.8219, full_name: 'Nairobi Fresh Foods', avatar_url: 'https://i.pravatar.cc/100?img=1' }, // Nairobi
  },
  {
    id: 'dv-2',
    business_name: "Mombasa Seafood Grill",
    category: 'food',
    profiles: { location_lat: -4.0435, location_lng: 39.6682, full_name: 'Mombasa Seafood Grill', avatar_url: 'https://i.pravatar.cc/100?img=2' }, // Mombasa
  },
  {
    id: 'dv-3',
    business_name: "Kigali Health Clinic",
    category: 'health',
    profiles: { location_lat: -1.9706, location_lng: 30.1044, full_name: 'Kigali Health Clinic', avatar_url: 'https://i.pravatar.cc/100?img=3' }, // Kigali
  },
  {
    id: 'dv-4',
    business_name: "Lagos Electronics Hub",
    category: 'electronics',
    profiles: { location_lat: 6.5244, location_lng: 3.3792, full_name: 'Lagos Electronics Hub', avatar_url: 'https://i.pravatar.cc/100?img=4' }, // Lagos
  },
  {
    id: 'dv-5',
    business_name: "Accra Tailors & Co",
    category: 'tailoring',
    profiles: { location_lat: 5.6037, location_lng: -0.1870, full_name: 'Accra Tailors & Co', avatar_url: 'https://i.pravatar.cc/100?img=5' }, // Accra
  },
  {
    id: 'dv-6',
    business_name: "Cape Town Mechanics",
    category: 'mechanic',
    profiles: { location_lat: -33.9249, location_lng: 18.4241, full_name: 'Cape Town Mechanics', avatar_url: 'https://i.pravatar.cc/100?img=6' }, // Cape Town
  },
  {
    id: 'dv-7',
    business_name: "Dar Delivery Services",
    category: 'transport',
    profiles: { location_lat: -6.7924, location_lng: 39.2083, full_name: 'Dar Delivery Services', avatar_url: 'https://i.pravatar.cc/100?img=7' }, // Dar es Salaam
  },
  {
    id: 'dv-8',
    business_name: "Kampala Community Grocer",
    category: 'grocery',
    profiles: { location_lat: 0.3476, location_lng: 32.5825, full_name: 'Kampala Community Grocer', avatar_url: 'https://i.pravatar.cc/100?img=8' }, // Kampala
  },
  {
    id: 'dv-9',
    business_name: "Addis Learning Center",
    category: 'education',
    profiles: { location_lat: 9.0300, location_lng: 38.7400, full_name: 'Addis Learning Center', avatar_url: 'https://i.pravatar.cc/100?img=9' }, // Addis Ababa
  },
  {
    id: 'dv-10',
    business_name: "Dakar Waterworks",
    category: 'plumbing',
    profiles: { location_lat: 14.6928, location_lng: -17.4467, full_name: 'Dakar Waterworks', avatar_url: 'https://i.pravatar.cc/100?img=10' }, // Dakar
  },
];

export default demoVendors;
