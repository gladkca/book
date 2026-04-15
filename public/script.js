const API = "/books";

let isAdmin = false;

// LOGIN
async function login() {
    const password = document.getElementById("password").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (data.success) {
        isAdmin = true;
        alert("تم تسجيل الدخول كأدمن");
    } else {
        alert("كلمة المرور غلط");
    }
}

// LOAD BOOKS
async function loadBooks() {
    const res = await fetch(API);
    const books = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    books.forEach((book, i) => {
        const li = document.createElement("li");
        li.textContent = book.title;

        if (book.file) {
            const a = document.createElement("a");
            a.href = "/uploads/" + book.file;
            a.textContent = "تحميل";
            li.appendChild(a);
        }

        if (isAdmin) {
            const btn = document.createElement("button");
            btn.textContent = "حذف";
            btn.className = "del";

            btn.onclick = async () => {
                await fetch("/books/" + i, { method: "DELETE" });
                loadBooks();
            };

            li.appendChild(btn);
        }

        list.appendChild(li);
    });
}

// ADD BOOK
async function addBook() {
    if (!isAdmin) return alert("أنت لست أدمن");

    const title = document.getElementById("title").value;
    const file = document.getElementById("file").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    await fetch("/books", {
        method: "POST",
        body: formData
    });

    loadBooks();
}

loadBooks();