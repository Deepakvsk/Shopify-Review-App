const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

// Ensure db.json exists so lowdb doesn't crash on Render
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ reviews: [] }));
}

const adapter = new FileSync(dbPath);
const db = low(adapter);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 1. Health Check (Required for Render to show "Live")
app.get('/', (req, res) => {
  res.send('<h1>Review App is Live</h1><p>API endpoints are active.</p>');
});

// 2. GET Reviews for a specific product
app.get('/api/reviews/:product_id', (req, res) => {
  const reviews = db.get('reviews')
    .filter({ product_id: req.params.product_id })
    .value();
  res.json(reviews || []);
});

// 3. POST a new review
app.post('/api/reviews', (req, res) => {
  const { product_id, author, rating, text, image_url } = req.body;
  
  const newReview = {
    id: Date.now().toString(),
    product_id: product_id.toString(),
    author: author || "Anonymous",
    rating: parseInt(rating) || 5,
    text: text || "",
    image_url: image_url || "",
    date: new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    status: 'approved'
  };

  db.get('reviews').push(newReview).write();
  res.status(201).json(newReview);
});

// 4. API: Get ALL reviews from the entire store
app.get('/api/all-reviews', (req, res) => {
  const allReviews = db.get('reviews').value();
  res.json(allReviews || []);
});

// 4. Render Dynamic Port Binding
// Render will inject the PORT environment variable automatically
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});