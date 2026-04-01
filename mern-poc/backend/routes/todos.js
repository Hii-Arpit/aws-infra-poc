const router = require('express').Router()
const Todo = require('../models/Todo')

// GET all todos — checks Redis cache first
router.get('/', async (req, res) => {
  try {
    const redis = req.app.get('redis')
    const cached = await redis.get('todos')

    if (cached) {
      console.log('Cache hit')
      return res.json(JSON.parse(cached))
    }

    console.log('Cache miss — hitting MongoDB')
    const todos = await Todo.find().sort({ createdAt: -1 })

    // Cache for 60 seconds
    await redis.setEx('todos', 60, JSON.stringify(todos))
    res.json(todos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST new todo
router.post('/', async (req, res) => {
  try {
    const todo = new Todo({ text: req.body.text })
    await todo.save()

    // Invalidate cache
    const redis = req.app.get('redis')
    await redis.del('todos')

    res.status(201).json(todo)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE todo
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id)

    const redis = req.app.get('redis')
    await redis.del('todos')

    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router