const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MEMORY STORAGE (IMPORTANT)
// =======================
let books = [];

// =======================
// FILE UPLOAD SETUP
// =======================
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/");
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        }
    })
});

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// make uploads folder if missing
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// =======================
// GET BOOKS
// =======================
app.get("/books", (req, res) => {
    res.json(books);
});

// =======================
// ADD BOOK
// =======================
app.post("/books", upload.single("file"), (req, res) => {
    const newBook = {
        id: Date.now(),
        title: req.body.title || "بدون اسم",
        file: req.file ? req.file.filename : null
    };

    books.push(newBook);

    res.json({ success: true, book: newBook });
});

// =======================
// DELETE BOOK
// =======================
app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    books = books.filter(b => b.id !== id);

    res.json({ success: true });
});

// =======================
// SERVE FRONTEND
// =======================
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});