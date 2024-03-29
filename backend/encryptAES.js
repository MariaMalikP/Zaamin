const crypto = require('crypto');
const ENCRYPTION_KEY = 'smthSMth937IDKhdkand5%7($92nf';

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
module.exports = { encrypt, decrypt };