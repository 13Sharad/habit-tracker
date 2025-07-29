export function updateStreak(habit) {
  const today = new Date().setHours(0,0,0,0);
  const last = habit.lastCompleted ? new Date(habit.lastCompleted).setHours(0,0,0,0) : null;
  if (last === today) return habit;
  if (last === today - 86400000) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }
  habit.lastCompleted = new Date();
  habit.history.push(new Date());
  return habit;
}
