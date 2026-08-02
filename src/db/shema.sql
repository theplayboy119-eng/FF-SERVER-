-- Creation de la table des comptes MSDK / Garena
CREATE TABLE IF NOT EXISTS accounts (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL UNIQUE,
    guest_account TEXT UNIQUE,
    password_hash TEXT,
    access_token TEXT,
    refresh_token TEXT,
    region TEXT NOT NULL DEFAULT 'EU',
    is_banned INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- Creation de la table des profils de joueurs Free Fire
CREATE TABLE IF NOT EXISTS player_profiles (
    account_id INTEGER PRIMARY KEY,
    nickname TEXT NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT 'https://cdn.freefire.com/avatars/101.png',
    level INTEGER NOT NULL DEFAULT 1,
    exp INTEGER NOT NULL DEFAULT 0,
    diamonds INTEGER NOT NULL DEFAULT 1000,
    gold INTEGER NOT NULL DEFAULT 5000,
    rank_points INTEGER NOT NULL DEFAULT 1000,
    badge_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (account_id) REFERENCES accounts(uid) ON DELETE CASCADE
);

-- Creation de la table de l'inventaire des objets et tenues
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    equipped INTEGER NOT NULL DEFAULT 0,
    count INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (account_id) REFERENCES accounts(uid) ON DELETE CASCADE,
    UNIQUE(account_id, item_id)
);

-- Creation du catalogue de la boutique
CREATE TABLE IF NOT EXISTS shop_items (
    shop_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'item',
    price_diamonds INTEGER NOT NULL DEFAULT 0,
    price_gold INTEGER NOT NULL DEFAULT 0
);

-- Creation du classement mondial
CREATE TABLE IF NOT EXISTS leaderboards (
    account_id INTEGER PRIMARY KEY,
    rank_points INTEGER NOT NULL DEFAULT 1000,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(uid) ON DELETE CASCADE
);

-- Index pour optimiser les recherches frequentes
CREATE INDEX IF NOT EXISTS idx_accounts_openid ON accounts(openid);
CREATE INDEX IF NOT EXISTS idx_accounts_guest ON accounts(guest_account);
CREATE INDEX IF NOT EXISTS idx_inventory_account ON inventory(account_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank_points DESC);

-- Insertion d'articles par defaut dans la boutique
INSERT OR IGNORE INTO shop_items (shop_id, item_id, name, category, price_diamonds, price_gold) VALUES
(101, 3005, 'Caisse d''Armes M4A1', 'box', 50, 0),
(102, 2004, 'Chrono', 'character', 599, 0),
(103, 2001, 'Alok', 'character', 599, 0),
(104, 5012, 'AK47-Dragon', 'weapon_skin', 899, 0),
(105, 1001, 'Pass de Combat Saison 40', 'pass', 499, 0);

-- Insertion de comptes de demonstration pour les tests
INSERT OR IGNORE INTO accounts (uid, openid, guest_account, password_hash, access_token, refresh_token, region, is_banned, created_at) VALUES
(100100100, '100100100', 'guest_king001', 'e10adc3949ba59abbe56e057f20f883e', 'ff_at_king', 'ff_rt_king', 'EU', 0, 1610000000),
(100293847, '100293847', 'guest_a1b2c3d4', 'e10adc3949ba59abbe56e057f20f883e', 'ff_at_99238472918374928173', 'ff_rt_88273645102938475610', 'EU', 0, 1620000000);

-- Insertion des profils associes aux comptes de demonstration
INSERT OR IGNORE INTO player_profiles (account_id, nickname, avatar_url, level, exp, diamonds, gold, rank_points, badge_id) VALUES
(100100100, 'FF_King', 'https://cdn.freefire.com/avatars/100.png', 70, 950000, 5000, 120000, 4500, 50),
(100293847, 'ProShooter_FF', 'https://cdn.freefire.com/avatars/101.png', 42, 128500, 1250, 34500, 2150, 12);

-- Insertion de l'inventaire initial du joueur principal
INSERT OR IGNORE INTO inventory (account_id, item_id, category, name, equipped, count) VALUES
(100293847, 2001, 'character', 'Alok', 1, 1),
(100293847, 5012, 'weapon_skin', 'AK47-Dragon', 1, 1);

-- Insertion dans le classement pour les joueurs de demo
INSERT OR IGNORE INTO leaderboards (account_id, rank_points, updated_at) VALUES
(100100100, 4500, 1620000000),
(100293847, 2150, 1620000000);
