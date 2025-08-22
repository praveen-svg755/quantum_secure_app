// encryption-util.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // In a real app, this would be securely exchanged
const iv = crypto.randomBytes(16);  // Initialization Vector

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(text.iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(text.encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt, key, iv };
