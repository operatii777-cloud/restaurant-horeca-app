#!/usr/bin/env node

/**
 * Save Current Chat - Salvează chat-ul curent dinamic
 * Rulează în background și salvează conversația curentă
 */

const CursorArchive = require('./index');
const fs = require('fs');
const path = require('path');

// Creează o instanță de arhivare
const archive = new CursorArchive();

// Funcție pentru a salva mesajul curent
function saveMessage(type, content, metadata = {}) {
  archive.saveMessage(type, content, metadata);
  console.log(`💾 Mesaj salvat: ${type} (${content.substring(0, 50)}...)`);
}

// Funcție pentru a salva manual chat-ul curent
function saveCurrentChat() {
  archive.saveSession();
  console.log('✅ Chat curent salvat!');
}

// Export funcții pentru utilizare externă
if (require.main === module) {
  // Dacă rulează direct, salvează chat-ul curent
  saveCurrentChat();
} else {
  // Dacă este importat ca modul, exportă funcțiile
  module.exports = {
    saveMessage,
    saveCurrentChat,
    archive
  };
}

// Graceful shutdown
process.on('SIGINT', () => {
  saveCurrentChat();
  archive.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveCurrentChat();
  archive.shutdown();
  process.exit(0);
});

