// src/app/dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import StreakCircle from '@/components/StreakCircle';
import HabitForm from '@/components/HabitForm';
import HabitCard from '@/components/HabitCard';
import HistoryList from '@/components/HistoryList';

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all habits
  const fetchHabits = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/habits/create', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setHabits(data);
    } else {
      console.error('Failed to load habits:', res.status);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // When a habit is toggled, update it in local state
  const handleToggle = (updatedHabit) => {
    setHabits((prev) =>
      prev.map((h) => (h._id === updatedHabit._id ? updatedHabit : h))
    );
  };

  // When a habit is deleted, remove it from local state
  const handleDelete = (deletedId) => {
    setHabits((prev) => prev.filter((h) => h._id !== deletedId));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <StreakCircle />
      <HistoryList />
      <HabitForm onAdd={fetchHabits} />

      {loading ? (
        <p>Loading...</p>
      ) : habits.length === 0 ? (
        <p>No habits yet.</p>
      ) : (
        <div className="grid gap-4">
          {habits.map((h) => (
            <HabitCard
              key={h._id}
              habit={h}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
