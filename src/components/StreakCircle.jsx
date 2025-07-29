'use client';
import { useState, useEffect } from 'react';

export default function StreakCircle() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/habits/streak', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { streak: s } = await res.json();
        setStreak(s);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col items-center mb-6 mt-6">
      <div className="w-32 h-32 rounded-full bg-indigo-100 border-4 border-indigo-400 shadow-md flex items-center justify-center text-4xl font-extrabold text-indigo-700">
        {streak}
      </div>
      <p className="mt-3 text-sm text-gray-700 font-medium">
        Day{streak === 1 ? '' : 's'} Streak
      </p>
    </div>
  );
}
