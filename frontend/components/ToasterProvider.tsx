'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-left"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#fff',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        },
      }}
    />
  );
}
