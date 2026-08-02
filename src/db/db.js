const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Chemin du fichier de base de données SQLite
const dbPath = config.dbPath || path.join(__dirname, '../../freefire.sqlite');

// Instance de connexion à la base de données SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Erreur lors de la connexion à SQLite :', err.message);
  } else {
    console.log(`[DB] Connecté à la base de données SQLite : ${dbPath}`);
    initSchema();
  }
});

// Lecture et exécution automatique du schéma SQL
function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql, (err) => {
      if (err) {
        console.error('[DB] Erreur lors de l\'initialisation du schéma SQL :', err.message);
      } else {
        console.log('[DB] Schéma SQL vérifié et initialisé avec succès.');
      }
    });
  } else {
    console.warn('[DB] Fichier schema.sql introuvable, initialisation ignorée.');
  }
}

// Interface Promisifiée pour une utilisation async/await dans les contrôleurs
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  raw: db
};

module.exports = dbAsync;
