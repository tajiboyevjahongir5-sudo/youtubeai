import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './router';
import './app.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// Valid Clerk publishable key must start with pk_test_ or pk_live_ and contain a valid base64 body (usually > 30 chars and ends with $)
export const isClerkConfigured = 
  typeof PUBLISHABLE_KEY === 'string' && 
  (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_')) &&
  PUBLISHABLE_KEY.length > 25 &&
  !PUBLISHABLE_KEY.includes('placeholder');

if (typeof window !== 'undefined') {
  (window as any).__CLERK_CONFIGURED__ = isClerkConfigured;
}

function App() {
  if (isClerkConfigured && PUBLISHABLE_KEY) {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ClerkProvider>
    );
  }

  // Graceful development mode when Clerk credentials are not yet configured
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
