import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initializing a new QueryClient instance
// QueryClient manages queries and mutations, including caching, background updates, and stale data handling
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* QueryClientProvider wraps the App component, providing the QueryClient context to the entire React component tree */}
    {/* This allows any component within App to use TanStack Query's hooks like `useQuery` and `useMutation` */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
