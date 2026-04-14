const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// serve frontend + uploads
app.use(express.static(__dirname));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== PORT (IMPORTANT FOR RENDER) =====
const PORT = process.env.PORT || 3000;

// ===== ADMIN PASSWORD =====
const ADMIN_PASSWORD = "1234"; // 🔐 change this

// ===== FILES =====
const uploadFolder = path.join(__dirname, "uploads");
const dbFile = path.join(__dirname, "books.json");

// create if not exists
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "[]");

// ===== HELPERS =====
function loadBooks() {
    return JSON.parse(fs.readFileSync(dbFile));
}

function saveBooks(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// ===== MULTER =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ===== UPLOAD BOOK (ADMIN ONLY) =====
app.post("/upload", upload.single("file"), (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: "Not allowed" });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const books = loadBooks();

    const book = {
        id: Date.now(),
        name: req.body.name || "No Name",
        fileName: req.file.filename,
        url: "/uploads/" + req.file.filename
    };

    books.push(book);
    saveBooks(books);

    res.json(book);
});

// ===== GET BOOKS =====
app.get("/books", (req, res) => {
    res.json(loadBooks());
});

// ===== DELETE BOOK (ADMIN ONLY) =====
app.post("/delete", (req, res) => {
    const { id, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: "Not allowed" });
    }

    let books = loadBooks();

    const bookIndex = books.findIndex(b => b.id == id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found" });
    }

    const book = books[bookIndex];

    // delete file
    const filePath = path.join(__dirname, "uploads", book.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    books.splice(bookIndex, 1);
    saveBooks(books);

    res.json({ success: true });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log("✅ Server running on port " + PORT);
});