import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { ApiStatus } from '@/types';

export default function ApiStatus() {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        await api.get('/health', { timeout: 4000 });
        if (!cancelled) setStatus('online');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const label: Record<ApiStatus, string> = {
    online: 'API online',
    offline: 'API offline',
    checking: 'Connecting…',
  };

  const dotColor: Record<ApiStatus, string> = {
    online: 'bg-green-400',
    offline: 'bg-red-500',
    checking: 'bg-yellow-400',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2 text-xs font-body text-muted select-none"
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            dotColor[status],
            status === 'online' && 'animate-pulse-slow',
          )}
        />
        {label[status]}
      </motion.div>
    </AnimatePresence>
  );
}
