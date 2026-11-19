import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import './styles/globals.css';
import { AuthProvider } from './app/auth-context';
import { PwaUpdatePrompt } from './app/pwa-update-prompt';
import { queryClient } from './lib/query-client';
import { router } from './app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
        <PwaUpdatePrompt />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
