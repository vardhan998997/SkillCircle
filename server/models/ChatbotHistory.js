import mongoose from 'mongoose';

const chatbotHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

export default mongoose.model('ChatbotHistory', chatbotHistorySchema);