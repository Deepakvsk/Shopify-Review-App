const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// --- MONGOOSE SETUP ---
// Replace the URL below with your actual MongoDB Atlas Connection String
const mongoURI = "mongodb+srv://deepak:Cy0BTOjWmuGuYoia@learn.syhehqz.mongodb.net/?appName=learn";

mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// Define the Review Schema
const reviewSchema = new mongoose.Schema({
  product_id: String,
  author: String,
  rating: Number,
  text: String,
  image_url: String,
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
  status: { type: String, default: 'approved' }
});

const Review = mongoose.model('Review', reviewSchema);

// --- MIDDLEWARE ---
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(bodyParser.json());

// 1. Health Check
app.get('/', (req, res) => {
  res.send('<h1>Review App (MongoDB) is Live</h1>');
});

// 2. GET Reviews for a specific product
app.get('/api/reviews/:product_id', async (req, res) => {
  const reviews = await Review.find({ product_id: req.params.product_id });
  res.json(reviews);
});

// 3. POST a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const { product_id, author, rating, text, image_url } = req.body;
    const newReview = new Review({
      product_id: product_id.toString(),
      author,
      rating: parseInt(rating),
      text,
      image_url
    });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: "Failed to save review" });
  }
});

// 4. GET ALL reviews
app.get('/api/all-reviews', async (req, res) => {
  const allReviews = await Review.find({});
  res.json(allReviews);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});