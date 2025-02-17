const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

app.use(express.json());
app.use(session({
    secret: "epicSecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB Connection Error:", err));

const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    priority: { type: String, required: true },
    deadline: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});
const Task = mongoose.model("Task", taskSchema);

const userSchema = new mongoose.Schema({
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${SERVER_URL}/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try{
        let user = await User.findOne({ githubId: profile.id });
        if(!user){
            user = new User({ githubId: profile.id, username: profile.username });
            await user.save();
        }
        return done(null, user);
    } catch(error){
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try{
        const user = await User.findById(id);
        done(null, user);
    } catch(error){
        done(error);
    }
})

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()){
        return next();
    }
    res.status(401).json({ error: "Unauthorized. Please log in." });
};

app.get("/auth/check", (req, res) => {
    if(req.isAuthenticated()) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

app.get("/tasks", isAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id });
        res.json(tasks);
    } catch(error){
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

app.post("/submit", isAuthenticated, async (req, res) => {
    const { task, priority } = req.body;

    if(!task || !priority){
        return res.status(400).json({ error: "Task name and priority are required."});
    }

    let deadline = new Date();
    if(priority === "High"){
        deadline.setDate(deadline.getDate() + 1);
    } else if(priority === "Medium"){
        deadline.setDate(deadline.getDate() + 3);
    } else{
        deadline.setDate(deadline.getDate() + 7);
    }

    const newTask = new Task({ 
        task, 
        priority, 
        deadline: deadline.toLocaleDateString(),
        userId: req.user._id 
    });

    await newTask.save();
    res.json({ message: "Task Added", newTask});
});

app.put("/tasks", isAuthenticated, async (req, res) => {
    const { _id, newTask, newPriority } = req.body;

    if (!_id || !newTask || !newPriority) {
        return res.status(400).json({ error: "Task index, new task name, and new priority are required." });
    }

    try{
        const updatedTask = await Task.findByIdAndUpdate(
            _id,
            { task: newTask, priority: newPriority },
            { new: true }
        );

        if(!updatedTask) {
            return res.status(404).json({ error: "Task not found." });
        }

        res.json({ message: "Task Updated", updatedTask });
    } catch(error) {
        console.error("Error updateing task: ", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

app.delete("/tasks", isAuthenticated, async (req, res) => {
    const { _id } = req.body;

    if(!_id){
        return res.status(400).json({ error: "Task index is required." });
    }

    try{
        await Task.findByIdAndDelete(_id);
        res.json({ message: "Task Deleted"});
    } catch(error){
        res.status(500).json({ error: "Failed to delete task" });
    }
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/auth/github/callback", passport.authenticate("github", {
    failureRedirect: `${CLIENT_URL}/`,
    successRedirect: `${CLIENT_URL}/tasks`
}));

app.post("/logout", (req, res) => {
    req.logout((err) => {
        if(err){
            return res.status(500).json({ error: "Logout failed." });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully." });
    })
});

if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "client/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client/build", "index.html"));
    });
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});