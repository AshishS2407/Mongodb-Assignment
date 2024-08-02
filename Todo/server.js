const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const Task = require('./model/todo');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


const uri = process.env.mongo_uri;

mongoose.connect(uri)

const database = mongoose.connection;
database.on('error', (error) => {
  console.log('Error connecting to database:', error);
});
database.once('connected', () => {
  console.log('Database Connected');
});

// Routes
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

app.post('/tasks', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ message: 'Task field is required' });
  }

  const newTask = new Task({ task, completed: false });

  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add task' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { task: newTaskName } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { task: newTaskName },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
