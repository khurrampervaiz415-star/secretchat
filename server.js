const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Connect MongoDB
mongoose.connect("mongodb+srv://pgcdhaofficial:TJZxAPIpLBwzfs4e@pgcdha.qbzia76.mongodb.net/secretchat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// Question Schema
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true }
});

// Reply Schema (updated to link with user)
const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userPassword: { type: String, required: true }, // for easy lookup
  userName: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  question: { type: String, required: true },
  reply: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Question = mongoose.model("Question", QuestionSchema);
const Reply = mongoose.model("Reply", ReplySchema);

// Admin password
const ADMIN_PASSWORD = "khurram@uetksk";

// Initialize default question if none exists
async function initializeDefaultQuestion() {
  const questionCount = await Question.countDocuments();
  if (questionCount === 0) {
    await new Question({
      question: "What do you think about our secret chat?",
      is_active: true
    }).save();
  }
}
initializeDefaultQuestion();

// Routes

// Serve static CSS and JS files with proper MIME types
app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/admin.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'admin.js'));
});

app.get('/user-script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'user-script.js'));
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/secret.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'secret.html'));
});

// Handle favicon request
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Admin authentication
app.post("/admin/login", async (req, res) => {
  try {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true, message: "Admin login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid admin password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create user (admin only)
app.post("/admin/users", async (req, res) => {
  try {
    const { adminPassword, name, password } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if password already exists
    const existingUser = await User.findOne({ password });
    if (existingUser) {
      return res.status(400).json({ error: "Password already exists. Please choose a different password." });
    }

    const newUser = new User({ name, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get all users (admin only)
app.get("/admin/users", async (req, res) => {
  try {
    const { adminPassword } = req.query;
    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const users = await User.find().sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Update question (admin only)
app.post("/admin/question", async (req, res) => {
  try {
    const { adminPassword, question } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Deactivate all existing questions
    await Question.updateMany({}, { is_active: false });
    
    // Create new active question
    const newQuestion = new Question({ question, is_active: true });
    await newQuestion.save();
    
    res.json({ message: "Question updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get current active question
app.get("/question", async (req, res) => {
  try {
    const question = await Question.findOne({ is_active: true });
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ error: "No active question found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({ password });
    
    if (user) {
      res.json({ 
        success: true, 
        message: "Login successful", 
        userId: user._id, 
        userName: user.name 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Submit answer
app.post("/replies", async (req, res) => {
  try {
    const { userId, userPassword, reply } = req.body;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user || user.password !== userPassword) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current active question
    const question = await Question.findOne({ is_active: true });
    if (!question) {
      return res.status(404).json({ error: "No active question found" });
    }

    const newReply = new Reply({ 
      userId: user._id,
      userPassword: user.password,
      userName: user.name,
      questionId: question._id,
      question: question.question,
      reply 
    });
    
    await newReply.save();
    res.status(201).json({ message: "Reply saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get all replies (admin only)
app.get("/admin/replies", async (req, res) => {
  try {
    const { adminPassword } = req.query;
    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const replies = await Reply.find()
      .populate('userId', 'name')
      .sort({ created_at: -1 });
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Delete user (admin only)
app.delete("/admin/users/:userId", async (req, res) => {
  try {
    const { adminPassword } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await User.findByIdAndDelete(req.params.userId);
    // Also delete all replies from this user
    await Reply.deleteMany({ userId: req.params.userId });
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Catch-all route for any unhandled requests - serve index.html for SPA routing
app.get('*', (req, res) => {
  // If it's a request for a file that should exist, return 404
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
  // Otherwise, serve index.html for SPA routing
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
