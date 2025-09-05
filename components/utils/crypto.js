// components/utils/crypto.js
import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "my-super-secret-key-1234567890";

function getKey() {
  return CryptoJS.SHA256(SECRET_KEY);
}

export function encryptData(data) {
  try {
    const json = JSON.stringify(data);
    const key = getKey();
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(json, key, { iv }).toString();
    return {
      iv: CryptoJS.enc.Base64.stringify(iv),
      payload: encrypted,
    };
  } catch (error) {
    console.error("encryptData - error:", error.message);
    throw new Error("Failed to encrypt data");
  }
}

export function decryptData(encrypted) {
  try {
    if (
      !encrypted ||
      typeof encrypted !== "object" ||
      !encrypted.iv ||
      !encrypted.payload
    ) {
      console.error("decryptData - Invalid encrypted data format:", encrypted);
      return null;
    }
    const key = getKey();
    const iv = CryptoJS.enc.Base64.parse(encrypted.iv);
    const decrypted = CryptoJS.AES.decrypt(encrypted.payload, key, { iv });
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) {
      console.error("decryptData - Empty or invalid decrypted data");
      return null;
    }
    const result = JSON.parse(decryptedStr);
    return result;
  } catch (error) {
    console.error("decryptData - error:", error.message, { encrypted });
    return null;
  }
}
