import React, { useEffect, useState } from 'react';
import { Circle } from '@react-google-maps/api';

interface RadarPulseProps {
  center: { lat: number; lng: number };
  maxRadius: number; // in meters
}

const RadarPulse: React.FC<RadarPulseProps> = ({ center, maxRadius }) => {
  const [pulses, setPulses] = useState<Array<{ id: number; radius: number; opacity: number }>>([]);
  const [pulseId, setPulseId] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Create new pulse
      const id = Date.now();
      setPulseId(id);
      setPulses(prev => [...prev, { id, radius: 0, opacity: 1 }]);
    }, 2000); // New pulse every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate pulses
    const interval = setInterval(() => {
      setPulses(prev => {
        return prev
          .map(pulse => ({
            ...pulse,
            radius: pulse.radius + maxRadius / 40, // Expand
            opacity: pulse.opacity - 0.025 // Fade out
          }))
          .filter(pulse => pulse.opacity > 0); // Remove invisible pulses
      });
    }, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [maxRadius]);

  return (
    <>
      {pulses.map(pulse => (
        <Circle
          key={pulse.id}
          center={center}
          radius={pulse.radius}
          options={{
            fillColor: '#3B82F6',
            fillOpacity: pulse.opacity * 0.1,
            strokeColor: '#3B82F6',
            strokeOpacity: pulse.opacity * 0.6,
            strokeWeight: 2,
            clickable: false,
          }}
        />
      ))}
    </>
  );
};

export default RadarPulse;
