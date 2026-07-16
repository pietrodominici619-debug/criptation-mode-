const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

const logicToAdd = `
    // -------------------------------------------------------------------------
    // PASSWORD REUSE PREVENTION LOGIC
    // -------------------------------------------------------------------------
    async function getPwObfuscationKey() {
      let keyB64 = localStorage.getItem('cv_pw_hash_key');
      if (!keyB64) {
        const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
        keyB64 = arrayBufferToBase64(rawKey);
        localStorage.setItem('cv_pw_hash_key', keyB64);
      }
      const rawKeyBytes = base64ToArrayBuffer(keyB64);
      return await window.crypto.subtle.importKey(
        "raw",
        rawKeyBytes,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
      );
    }

    async function getUsedPasswordHashes() {
      const encryptedData = localStorage.getItem('cv_used_pw_hashes');
      if (!encryptedData) return [];
      try {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) return [];
        const iv = new Uint8Array(base64ToArrayBuffer(parts[0]));
        const ciphertext = base64ToArrayBuffer(parts[1]);
        const key = await getPwObfuscationKey();
        const decrypted = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          ciphertext
        );
        const jsonStr = new TextDecoder().decode(decrypted);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Errore decodifica hash password:", e);
        return [];
      }
    }

    async function saveUsedPasswordHashes(hashesArray) {
      try {
        const key = await getPwObfuscationKey();
        const jsonStr = JSON.stringify(hashesArray);
        const encoded = new TextEncoder().encode(jsonStr);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv },
          key,
          encoded
        );
        const ivB64 = arrayBufferToBase64(iv);
        const ciphertextB64 = arrayBufferToBase64(encrypted);
        localStorage.setItem('cv_used_pw_hashes', \`\${ivB64}:\${ciphertextB64}\`);
      } catch (e) {
        console.error("Errore salvataggio hash password:", e);
      }
    }

    async function hashPasswordForCheck(password) {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function checkPasswordReuse(password) {
      if (!password) {
        elements.encPasswordWarning.classList.add('hidden');
        return;
      }
      const hash = await hashPasswordForCheck(password);
      const hashes = await getUsedPasswordHashes();
      if (hashes.includes(hash)) {
        elements.encPasswordWarning.classList.remove('hidden');
      } else {
        elements.encPasswordWarning.classList.add('hidden');
      }
    }

    async function registerUsedPassword(password) {
      if (!password) return;
      const hash = await hashPasswordForCheck(password);
      const hashes = await getUsedPasswordHashes();
      if (!hashes.includes(hash)) {
        hashes.push(hash);
        await saveUsedPasswordHashes(hashes);
      }
    }
`;

content = content.replace('    // SECURITY: Secure session storage-based history key', logicToAdd + '\n    // SECURITY: Secure session storage-based history key');
fs.writeFileSync('index.html', content);
