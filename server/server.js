import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import requestRoutes from './routes/requestRoutes.js'
import circleRoutes from './routes/circleRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()
const httpServer = createServer(app)

// Set up Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
})

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Join a room (conversation or circle)
  socket.on('join', (room) => {
    socket.join(room)
    console.log(`User ${socket.id} joined room: ${room}`)
  })
  
  // Leave a room
  socket.on('leave', (room) => {
    socket.leave(room)
    console.log(`User ${socket.id} left room: ${room}`)
  })
  
  // Handle private message
  socket.on('privateMessage', (data) => {
    io.to(data.conversationId).emit('newMessage', data)
  })
  
  // Handle circle message
  socket.on('circleMessage', (data) => {
    io.to(`circle-${data.circleId}`).emit('newCircleMessage', data)
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/circles', circleRoutes)
app.use('/api/chat', chatRoutes)

// Root route
app.get('/', (req, res) => {
  res.send('API is running...')
})

// Error Middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000 
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

export { io }

