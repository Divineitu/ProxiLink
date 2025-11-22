import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
  title: string;
  content: string;
  onDismiss: () => void;
  onClick?: () => void;
  duration?: number; // in milliseconds
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  title, 
  content, 
  onDismiss,
  onClick, 
  duration = 6000 // 6 seconds default
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchCurrent(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchCurrent !== null) {
      const diff = touchStart - touchCurrent;
      // If swiped up by at least 50px, dismiss
      if (diff > 50) {
        handleDismiss();
      }
    }
    setTouchStart(null);
    setTouchCurrent(null);
  };

  const swipeOffset = touchStart !== null && touchCurrent !== null 
    ? Math.max(0, touchStart - touchCurrent) 
    : 0;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-4 pt-4 pointer-events-none transition-all duration-300",
        isVisible && !isExiting ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div
        className="max-w-md mx-auto bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-xl shadow-2xl pointer-events-auto transform transition-transform cursor-pointer hover:shadow-3xl"
        style={{
          transform: `translateY(-${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (onClick) {
            onClick();
            handleDismiss();
          }
        }}
      >
        <div className="p-4 pr-12 relative">
          {/* Swipe indicator */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="mt-2">
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1 leading-tight">
              {title}
            </h3>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              {content}
            </p>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
            <div 
              className="h-full bg-white/40 animate-shrink-width"
              style={{
                animationDuration: `${duration}ms`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
