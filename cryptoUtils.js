   // cryptoUtils.js
    const crypto = require('crypto');
    function encryptMessage(message, sharedKey) {
      const key = crypto.createHash('sha256').update(sharedKey).digest();
      const iv = crypto.randomBytes(11); 
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv); 
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex'); 
      return { encrypted, iv: iv.toString('hex'), authTag };
    }
    function decryptMessage(encrypted, sharedKey, ivHex, authTagHex) {
      const key = crypto.createHash('sha256').update(sharedKey).digest();
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag); 
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      try {
        decrypted += decipher.final('utf8');
        return { decrypted, tampered: false };
      } catch (error) {
        console.error('Decryption failed: Message tampered or incorrect key.', error.message);
        return { decrypted: null, tampered: true };
      }
    }
    module.exports = { encryptMessage, decryptMessage };