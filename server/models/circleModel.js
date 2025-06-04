import mongoose from 'mongoose'

const circleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxMembers: {
      type: Number,
      default: 10,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    goals: [String],
    resources: [
      {
        title: String,
        url: String,
        type: String,
      },
    ],
    meetingSchedule: {
      type: String,
      default: '',
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const Circle = mongoose.model('Circle', circleSchema)

export default Circle