import mongoose from 'mongoose';

const CompletionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: Date, required: true, unique: true },
  done:   { type: Boolean, default: false }
});

export default mongoose.models.Completion || mongoose.model('Completion', CompletionSchema);