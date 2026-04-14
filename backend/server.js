const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data.json');

// Helper to read data
function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      return { posts: [], vents: [], points: 680 };
    }
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data:', err);
    return { posts: [], vents: [], points: 680 };
  }
}

// Helper to write data
function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data:', err);
  }
}

// Get all posts
app.get('/api/posts', (req, res) => {
  const data = readData();
  res.json(data.posts || []);
});

// Create a post
app.post('/api/posts', (req, res) => {
  const { name, text, tags, anonymous } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const data = readData();
  const newPost = {
    id: Date.now().toString(),
    name: name || 'Anonymous',
    text,
    tags: tags || [],
    anonymous: !!anonymous,
    likes: 0,
    validations: 0,
    timestamp: new Date().toISOString()
  };

  data.posts.unshift(newPost); // Add at beginning
  data.points += 10; // Award points for posting
  writeData(data);

  res.status(201).json({ message: 'Post created', post: newPost, newPoints: data.points });
});

// Interact with a post (like/validate)
app.post('/api/posts/:id/interact', (req, res) => {
  const { action } = req.body; // 'like' or 'validate'
  const data = readData();
  const post = data.posts.find(p => p.id === req.params.id);
  
  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  if (action === 'like') {
    post.likes += 1;
  } else if (action === 'validate') {
    post.validations += 1;
    data.points += 5; // Reward the validator
  }
  
  writeData(data);
  res.json({ message: 'Interaction saved', post, newPoints: data.points });
});

// Update points
app.post('/api/points', (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  const data = readData();
  data.points += parseInt(amount);
  writeData(data);
  res.json({ message: 'Points updated', newPoints: data.points });
});

// Get points
app.get('/api/points', (req, res) => {
  const data = readData();
  res.json({ points: data.points });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
