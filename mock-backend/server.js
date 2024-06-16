const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = [
  { id: 1, email: 'user@example.com', password: 'password' }
];

const tasks = [
  { id: 1, userId: 1, text: 'Task 1', completed: false },
  { id: 2, userId: 1, text: 'Task 2', completed: true }
];

const secretKey = 'your_secret_key';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.userId = user.userId;
    next();
  });
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/api/tasks', authenticateToken, (req, res) => {
  const userId = req.userId;
  const userTasks = tasks.filter(task => task.userId === userId);
  res.json(userTasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { text } = req.body;
  const userId = req.userId;
  const newTask = { id: tasks.length + 1, userId, text, completed: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { text, completed } = req.body;
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === req.userId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], text, completed };
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === req.userId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.sendStatus(204);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
