require('dotenv').config(); // এটি সবার উপরে থাকতে হবে
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ছবি বা স্ট্যাটিক ফাইলের ফোল্ডার

// ---------------------------------------------
// ১. MongoDB কানেকশন (Database Connection)
// ---------------------------------------------
const mongoUri = process.env.MONGO_URI;

// চেক করা হচ্ছে লিংক পাওয়া যাচ্ছে কিনা
if (!mongoUri) {
    console.error("❌ Error: .env ফাইল থেকে MONGO_URI পাওয়া যাচ্ছে না। দয়া করে .env ফাইল চেক করুন।");
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log("✅ MongoDB Connected for Meerab Academy!"))
        .catch(err => console.error("❌ Database Connection Error:", err));
}

// ---------------------------------------------
// ২. স্কিমা ও মডেল (Database Structure)
// ---------------------------------------------

// নোটিশের জন্য
const NoticeSchema = new mongoose.Schema({
    title: String,
    date: String,
    createdAt: { type: Date, default: Date.now }
});
const Notice = mongoose.model('Notice', NoticeSchema);

// রেজাল্টের জন্য
const ResultSchema = new mongoose.Schema({
    studentName: String,
    roll: String,
    examName: String,
    year: String,
    gpa: String,
    createdAt: { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', ResultSchema);

// ---------------------------------------------
// ৩. পেজ রাউটিং (Frontend Pages Link)
// ---------------------------------------------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'gallery.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'result.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ---------------------------------------------
// ৪. API (Backend Logic)
// ---------------------------------------------

// === নোটিশ API ===
// সব নোটিশ দেখা
app.get('/api/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// নোটিশ আপলোড
app.post('/api/notices', async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.json({ message: "Notice Added Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// নোটিশ ডিলিট
app.delete('/api/notices/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === রেজাল্ট API ===
// রেজাল্ট আপলোড
app.post('/api/results', async (req, res) => {
    try {
        const newResult = new Result(req.body);
        await newResult.save();
        res.json({ message: "Result Saved Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// রেজাল্ট সার্চ (খোঁজা)
app.get('/api/results/search', async (req, res) => {
    try {
        const { roll, examName } = req.query;
        const result = await Result.findOne({ roll, examName });
        
        if (result) {
            res.json({ found: true, data: result });
        } else {
            res.json({ found: false, message: "Result not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------
// ৫. সার্ভার রান করা
// ---------------------------------------------
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});