const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const session = require("express-session");

const app = express();
const PORT = 3000;

const BOOKS_FILE = path.join(__dirname, "books.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// create files if missing
if (!fs.existsSync(BOOKS_FILE)) fs.writeFileSync(BOOKS_FILE, "[]");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static(UPLOADS_DIR));

// session system (REAL admin fix)
app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true
}));

// file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// =======================
// ADMIN LOGIN
// =======================
const ADMIN_PASSWORD = "1234";

app.post("/login", (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.json({ success: true });
    }
    res.json({ success: false });
});

function checkAdmin(req, res, next) {
    if (req.session.isAdmin) return next();
    return res.status(403).json({ error: "Not admin" });
}

// =======================
// GET BOOKS
// =======================
app.get("/books", (req, res) => {
    const books = JSON.parse(fs.readFileSync(BOOKS_FILE));
    res.json(books);
});

// =======================
// ADD BOOK (ADMIN ONLY)
// =======================
app.post("/books", checkAdmin, upload.single("file"), (req, res) => {
    const books = JSON.parse(fs.readFileSync(BOOKS_FILE));

    books.push({
        title: req.body.title || "بدون اسم",
        file: req.file ? req.file.filename : null
    });

    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));

    res.json({ message: "added" });
});

// =======================
// DELETE BOOK (ADMIN ONLY)
// =======================
app.delete("/books/:id", checkAdmin, (req, res) => {
    const books = JSON.parse(fs.readFileSync(BOOKS_FILE));
    const id = parseInt(req.params.id);

    if (!isNaN(id) && books[id]) {
        books.splice(id, 1);
        fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
    }

    res.json({ message: "deleted" });
});

// fallback FIXED
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log("🚀 Server running: http://localhost:" + PORT);
});