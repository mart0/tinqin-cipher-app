const books = [];

const addBook = (book) => {
  books.push(book);
};

const searchBooks = (query) => {
  return books.filter(
    (book) =>
      book.title.includes(query) ||
      book.author.includes(query) ||
      book.publicationDate.includes(query)
  );
};

module.exports = { addBook, searchBooks };