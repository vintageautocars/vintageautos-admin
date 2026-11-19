import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      toast.info('A new version is available', {
        duration: Infinity,
        action: { label: 'Reload', onClick: () => void updateServiceWorker(true) },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
