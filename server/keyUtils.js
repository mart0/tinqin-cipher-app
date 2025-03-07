const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const generateKeyPair = () => {
    console.log('Generating new key pair...');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
  
    // Save keys to files
    fs.writeFileSync(path.join(__dirname, 'serverPublicKey.pem'), publicKey);
    fs.writeFileSync(path.join(__dirname, 'serverPrivateKey.pem'), privateKey);
  
    return { publicKey, privateKey };
  };

const loadKeyPair = () => {
  const publicKeyPath = path.join(__dirname, 'serverPublicKey.pem');
  const privateKeyPath = path.join(__dirname, 'serverPrivateKey.pem');

  // Check if key files exist
  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    // Generate and save the key pair if files don't exist
    return generateKeyPair();
  }

  // Load keys from files
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  return { publicKey, privateKey };
};

module.exports = { generateKeyPair, loadKeyPair };