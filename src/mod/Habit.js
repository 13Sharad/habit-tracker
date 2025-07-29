import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  dueTime:      { type: String, required: true },    
  streak:       { type: Number, default: 0 },
  lastCompleted:{ type: Date },
  history:      [{ type: Date }],
  createdAt:    { type: Date, default: Date.now }
});

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
