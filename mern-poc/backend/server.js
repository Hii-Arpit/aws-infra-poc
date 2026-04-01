const express = require('express')
const mongoose = require('mongoose')
const redis = require('redis')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err))

// Redis connection
const redisClient = redis.createClient({ url: process.env.REDIS_URL })
redisClient.connect()
  .then(() => console.log('Redis connected'))
  .catch(err => console.log('Redis error:', err))

// Make redis available in routes
app.set('redis', redisClient)

// Routes
app.use('/api/todos', require('./routes/todos'))

// Health check — ALB will ping this
app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(5000, () => console.log('Server running on port 5000'))