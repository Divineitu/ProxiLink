import React, { useEffect, useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { Wrench, ShoppingBag, Briefcase, Home, Star } from 'lucide-react';

interface AnimatedMarkerProps {
  position: { lat: number; lng: number };
  category?: string;
  title?: string;
  onClick?: () => void;
  delay?: number;
}

const getCategoryIcon = (category?: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('plumb') || cat.includes('electric') || cat.includes('repair')) {
    return Wrench;
  } else if (cat.includes('retail') || cat.includes('shop') || cat.includes('store')) {
    return ShoppingBag;
  } else if (cat.includes('construction') || cat.includes('build')) {
    return Home;
  }
  return Briefcase;
};

const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({ 
  position, 
  category, 
  title, 
  onClick,
  delay = 0 
}) => {
  const [visible, setVisible] = useState(false);
  const Icon = getCategoryIcon(category);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-500"
        onClick={onClick}
        title={title}
      >
        {/* Pulsing background */}
        <div className="absolute inset-0 w-10 h-10 bg-red-500/30 rounded-full animate-ping" />
        
        {/* Icon container */}
        <div className="relative w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </OverlayView>
  );
};

export default AnimatedMarker;
