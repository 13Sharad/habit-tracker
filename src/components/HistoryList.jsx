'use client';
import { useState, useEffect } from 'react';

export default function HistoryList() {
  const [dates, setDates] = useState([]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/habits/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { dates } = await res.json();
        setDates(dates);
      }
    }
    load();
  }, []);

  if (dates.length === 0)
    return <p className="text-sm text-gray-500">No full‐completion history yet.</p>;

  return (
    <div className="bg-gray-50 p-3 rounded-md shadow-sm">
      <h2 className="text-base font-medium mb-1 text-gray-800">Completed Days</h2>
      <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700">
        {dates.map(date => (
          <li key={date}>{new Date(date).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
}
