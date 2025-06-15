import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    trim: true
  },
  imageURL: {
    type: String,
    default: 'https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'completed'],
    default: 'available'
  },
  type: {
    type: String,
    enum: ['lend', 'exchange'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);