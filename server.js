const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const PORT = 3000;
const SECRET_KEY = "sorting-secret";

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// In-memory data (replace with DB later)
const users = [];
const sortLogs = [];

// Auth Middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.redirect("/login");

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.redirect("/login");
    req.user = user;
    next();
  });
}

// Routes
app.get("/", (req, res) => res.redirect("/login"));

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const existing = users.find(u => u.username === username);
  if (existing) return res.send("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) {
    // Return inline script to alert and redirect
    return res.send(`
      <script>
        alert("User not found. Please register.");
        window.location.href = "/register";
      </script>
    `);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.send(`
      <script>
        alert("Incorrect password. Please try again.");
        window.location.href = "/login";
      </script>
    `);
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.render("dashboard", { username, token });

  if (!valid){
  return res.send(`
    <script>
      alert("Incorrect password. Please try again.");
      window.location.href = "/login";
    </script>
  `);
  }

});


app.post("/log", (req, res) => {
  const { username, algorithm, timeMs } = req.body;
  sortLogs.push({
    username,
    algorithm,
    timeMs,
    timestamp: new Date().toISOString(),
  });
  res.json({ message: "Log saved" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
