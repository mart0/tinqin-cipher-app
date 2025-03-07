const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { loadKeyPair } = require('./keyUtils');
const bookStore = require('./bookStore');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load or generate the server's key pair
const { publicKey, privateKey } = loadKeyPair();

// Endpoint to get server's public key
app.get('/api/public-key', (req, res) => {
  res.json({ publicKey });
});

// Endpoint to submit a book
app.post('/api/books', (req, res) => {
  const { data: encryptedData, clientPublicKey } = req.body;

  // Decrypt the request body using the server's private key
  let decryptedData;
  try {
    decryptedData = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(encryptedData, 'base64')
    );
  } catch (err) {
    return res.status(400).json({ error: 'Failed to decrypt data' });
  }

  // Parse the decrypted data
  let book;
  try {
    book = JSON.parse(decryptedData.toString());
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }

  // Validate the book data
  if (!book.title || !book.author || !book.publicationDate) {
    return res.status(400).json({ error: 'Invalid book data' });
  }

  // Store the book
  bookStore.addBook(book);

  // Prepare the response
  const response = { message: 'Book added successfully' };

  // Encrypt the response using the client's public key
  let encryptedResponse;
  try {
    encryptedResponse = crypto.publicEncrypt(
      { key: clientPublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(JSON.stringify(response))
    );
  } catch (err) {
    return res.status(500).json({ error: 'Failed to encrypt response' });
  }

  // Send the encrypted response
  res.json({ data: encryptedResponse.toString('base64') });
});

// Endpoint to search for books
app.get('/api/books', (req, res) => {
  const { q: query, clientPublicKey } = req.query;

  // Search for books
  const books = bookStore.searchBooks(query);

  // Encrypt the response using the client's public key
  let encryptedResponse;
  try {
    encryptedResponse = crypto.publicEncrypt(
      { key: clientPublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(JSON.stringify(books))
    );
  } catch (err) {
    return res.status(500).json({ error: 'Failed to encrypt response' });
  }

  // Send the encrypted response
  res.json({ data: encryptedResponse.toString('base64') });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});