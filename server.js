const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ reviews: [] }).write();

const app = express();

// 1. Enable CORS for Shopify
app.use(cors());
app.use(bodyParser.json());

// 2. Health check for Render
app.get('/', (req, res) => {
  res.send('Review Server is Live');
});

// 3. API Routes
app.get('/api/reviews/:product_id', (req, res) => {
  const reviews = db.get('reviews')
    .filter({ product_id: req.params.product_id })
    .value();
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { product_id, author, rating, text, image_url } = req.body;
  const newReview = {
    id: Date.now().toString(),
    product_id,
    author,
    rating: parseInt(rating),
    text,
    image_url,
    date: new Date().toLocaleDateString(),
    status: 'approved'
  };
  db.get('reviews').push(newReview).write();
  res.status(201).json(newReview);
});

// 4. IMPORTANT: Render Port Binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});