declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: {
    onRegistered?: (r: ServiceWorkerRegistration | undefined) => void;
  }): {
    needRefresh: [boolean, (v: boolean) => void];
    offlineReady: [boolean, (v: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
