// server/index.js or server/app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import route files
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import circleRoutes from './routes/circles.js';
import messageRoutes from './routes/messages.js';
import chatbotRoutes from './routes/chatbot.js';
import userRoutes from './routes/users.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Body parser middleware
app.use(express.json());

// -------------------------
// ✅ CORS SETUP (Important)
// -------------------------
const allowedOrigins = [
  'http://localhost:3000', // local frontend
  'https://skill-circle-m3hl.vercel.app' // deployed Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('❌ Not allowed by CORS'));
  },
  credentials: true,
}));

// -------------------------
// ✅ API Routes
// -------------------------
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);

// -------------------------
// ✅ Health Check Route
// -------------------------
app.get('/api/health', (req, res) => {
  res.json({ message: 'SkillCircle API is running successfully!' });
});

// -------------------------
// ✅ Start the Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
