import { createBrowserRouter } from 'react-router';
import { AdminRoute } from './guards';
import { AppLayout } from '@/components/shared/app-layout';

function NotFoundPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-4xl font-heading font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => {
      const { default: Component } = await import('../pages/login');
      return { Component };
    },
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { default: Component } = await import('../pages/dashboard');
              return { Component };
            },
          },
          {
            path: 'owners',
            lazy: async () => {
              const { default: Component } = await import('../pages/owners/list');
              return { Component };
            },
          },
          {
            path: 'owners/:id',
            lazy: async () => {
              const { default: Component } = await import('../pages/owners/detail');
              return { Component };
            },
          },
          {
            path: 'vehicles',
            lazy: async () => {
              const { default: Component } = await import('../pages/vehicles/list');
              return { Component };
            },
          },
          {
            path: 'vehicles/add',
            lazy: async () => {
              const { default: Component } = await import('../pages/vehicles/add');
              return { Component };
            },
          },
          {
            path: 'vehicles/:id',
            lazy: async () => {
              const { default: Component } = await import('../pages/vehicles/detail');
              return { Component };
            },
          },
          {
            path: 'vehicles/:id/edit',
            lazy: async () => {
              const { default: Component } = await import('../pages/vehicles/edit');
              return { Component };
            },
          },
          {
            path: 'bookings',
            lazy: async () => {
              const { default: Component } = await import('../pages/bookings/list');
              return { Component };
            },
          },
          {
            path: 'bookings/:id',
            lazy: async () => {
              const { default: Component } = await import('../pages/bookings/detail');
              return { Component };
            },
          },
          {
            path: 'payments',
            lazy: async () => {
              const { default: Component } = await import('../pages/payments/list');
              return { Component };
            },
          },
          {
            path: 'users',
            lazy: async () => {
              const { default: Component } = await import('../pages/users/list');
              return { Component };
            },
          },
          {
            path: 'users/:id',
            lazy: async () => {
              const { default: Component } = await import('../pages/users/detail');
              return { Component };
            },
          },
          {
            path: 'owners/bank-requests',
            lazy: async () => {
              const { default: Component } = await import('../pages/owners/bank-requests');
              return { Component };
            },
          },
          {
            path: 'settings',
            lazy: async () => {
              const { default: Component } = await import('../pages/settings');
              return { Component };
            },
          },
          {
            path: 'settings/payment',
            lazy: async () => {
              const { default: Component } = await import('../pages/settings/payment');
              return { Component };
            },
          },
          {
            path: 'settings/categories',
            lazy: async () => {
              const { default: Component } = await import('../pages/settings/categories');
              return { Component };
            },
          },
          {
            path: 'settings/car-catalog',
            lazy: async () => {
              const { default: Component } = await import('../pages/settings/car-catalog');
              return { Component };
            },
          },
          {
            path: 'audit-log',
            lazy: async () => {
              const { default: Component } = await import('../pages/audit-log/list');
              return { Component };
            },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
