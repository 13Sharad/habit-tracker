// src/components/HabitCard.jsx
'use client';

import { useState, useMemo } from 'react';

export default function HabitCard({ habit, onToggle, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  // determine if this habit was completed today
  const doneToday = useMemo(() => {
    if (!habit.lastCompleted) return false;
    const last = new Date(habit.lastCompleted).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return last === today;
  }, [habit.lastCompleted]);

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/habits/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: habit._id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      const updatedHabit = await res.json();
      onToggle(updatedHabit);
    } catch (err) {
      console.error('Toggle error:', err);
      setError('Could not toggle habit. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/habits/${habit._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      onDelete(habit._id);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Could not delete habit. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg shadow relative
        ${doneToday ? 'bg-blue-100' : 'bg-white'}`}
    >
      <h3 className="text-xl font-semibold">{habit.title}</h3>
      <p className="text-gray-600">{habit.description}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold">Streak: {habit.streak}</span>
        <div className="space-x-2">
          <button
            onClick={handleToggle}
            disabled={busy}
            className={`btn-secondary disabled:opacity-50`}
          >
            {busy
              ? '…'
              : doneToday
                ? 'Done ✓'
                : 'Mark Done'}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className={`btn-danger disabled:opacity-50`}
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
