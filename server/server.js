import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import circleRoutes from './routes/circles.js';
import messageRoutes from './routes/messages.js';
import chatbotRoutes from './routes/chatbot.js';
import userRoutes from './routes/users.js';

dotenv.config();
  
const app = express();
const PORT = process.env.PORT || 5000; 

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'SkillCircle API is running successfully!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});      

