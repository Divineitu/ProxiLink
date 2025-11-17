import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'VITE_USE_DEMO_VENDORS';

const DemoToggle = () => {
  const envDefault = import.meta.env.VITE_USE_DEMO_VENDORS === 'true';
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return envDefault;
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? envDefault : v === 'true';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (e) {
      // ignore
    }
    // dispatch a custom event so other components can react immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('proxiDemoToggle', { detail: { enabled } }));
    }
  }, [enabled]);

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-muted-foreground">Demo</div>
      <Button size="sm" onClick={() => setEnabled((v) => !v)} variant={enabled ? 'secondary' : 'ghost'}>
        {enabled ? 'On' : 'Off'}
      </Button>
    </div>
  );
};

export default DemoToggle;
