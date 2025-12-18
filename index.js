require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // বড় ডাটা আপলোডের জন্য লিমিট বাড়ানো হলো
app.use(express.static('public'));

// ---------------------------------------------
// ১. MongoDB কানেকশন
// ---------------------------------------------
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("❌ Error: .env ফাইল থেকে MONGO_URI পাওয়া যাচ্ছে না।");
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log("✅ MongoDB Connected for Meerab Institute!"))
        .catch(err => console.error("❌ DB Connection Error:", err));
}

// ---------------------------------------------
// ২. স্কিমা ও মডেল
// ---------------------------------------------

// নোটিশ স্কিমা
const NoticeSchema = new mongoose.Schema({
    title: String,
    date: String,
    createdAt: { type: Date, default: Date.now }
});
const Notice = mongoose.model('Notice', NoticeSchema);

// রেজাল্ট স্কিমা (আপডেট করা হয়েছে)
const ResultSchema = new mongoose.Schema({
    studentName: String,
    fatherName: String, // নতুন
    motherName: String, // নতুন
    roll: String,
    regNo: String,      // নতুন
    examName: String,
    year: String,
    institute: String,  // নতুন
    gpa: String,
    resultStatus: String, // পাস/ফেল
    marks: Array,       // বিষয়ভিত্তিক নম্বর (Array)
    createdAt: { type: Date, default: Date.now }
});

// ---------------------------------------------
// ৩. পেজ রাউটিং
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
app.get('/api/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notices', async (req, res) => {
    try {
        await new Notice(req.body).save();
        res.json({ message: "Notice Added" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/notices/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// === রেজাল্ট API ===

// ১. সিঙ্গেল রেজাল্ট আপলোড
app.post('/api/results', async (req, res) => {
    try {
        await new Result(req.body).save();
        res.json({ message: "Result Saved" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ২. বাল্ক আপলোড (একসাথে অনেকগুলো) - নতুন ফিচার
app.post('/api/results/bulk', async (req, res) => {
    try {
        const results = req.body; // Array of results
        if (!Array.isArray(results)) {
            return res.status(400).json({ error: "ডাটা সঠিক ফরম্যাটে নেই (Array হতে হবে)" });
        }
        await Result.insertMany(results);
        res.json({ message: "Bulk upload successful", count: results.length });
    } catch (err) {
        res.status(500).json({ error: "Bulk upload failed: " + err.message });
    }
});

// ৩. রেজাল্ট সার্চ
app.get('/api/results/search', async (req, res) => {
    try {
        const { roll, examName } = req.query;
        const result = await Result.findOne({ roll, examName });
        if (result) res.json({ found: true, data: result });
        else res.json({ found: false });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// সার্ভার স্টার্ট
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});