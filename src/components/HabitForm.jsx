'use client';

import { useState, useEffect } from 'react';

export default function HabitForm({ onAdd }) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [dueTime, setDueTime]   = useState('08:00');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const token = mounted ? localStorage.getItem('token') : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/habits/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description: desc, dueTime })
      });
      setTitle(''); setDesc(''); setDueTime('08:00');
      onAdd();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Habit title"
          required
          className="input flex-1"
          suppressHydrationWarning
        />
      </div>

      {/* Description */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description (optional)"
          className="input flex-1"
          suppressHydrationWarning
        />
      </div>

      {/* Due Time */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <label className="block flex-1" suppressHydrationWarning>
          <span className="text-sm">Time of day to complete:</span>
          <input
            type="time"
            value={dueTime}
            onChange={e => setDueTime(e.target.value)}
            required
            className="input w-full"
            suppressHydrationWarning
          />
        </label>
      </div>

      {/* Submit */}
      <div className="flex">
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto sm:flex-1"
          suppressHydrationWarning
        >
          Add Habit
        </button>
      </div>
    </form>
  );
}
