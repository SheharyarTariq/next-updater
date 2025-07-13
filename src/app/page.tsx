
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleManualTrigger = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/cron/check-updates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
        }
      });
      const data = await res.json();
      setMessage(data.ok ? 'Sent to Slack successfully' : data.error);
    } catch (error) {
      setMessage('Error occurred');
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleManualTrigger}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Sending...' : 'Send Slack Update Now'}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}