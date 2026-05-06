import { useEffect, useState } from "react";
import { getBooks } from "./services/books";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  genre: string[];
};

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getBooks()
      .then((res) => setBooks(res.data))
      .catch(() => setError("No se pudo cargar libros"));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Bookstore</h1>
      {error && <p>{error}</p>}
      <ul>
        {books.map((b) => (
          <li key={b.id}>
            {b.title} - {b.author} - {b.price} EUR - stock {b.stock}
          </li>
        ))}
      </ul>
    </main>
  );
}