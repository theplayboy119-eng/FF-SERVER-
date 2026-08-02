const db = require('../db/db');

// Récupération du catalogue complet de la boutique
exports.getShopItems = (req, res) => {
  const query = 'SELECT shop_id, item_id, name, price_diamonds, price_gold FROM shop_items';

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 1, message: 'Erreur lors du chargement du catalogue boutique' });
    }

    res.json({
      catalog: rows || []
    });
  });
};

// Traitement de l'achat d'un article et déduction des devises
exports.buyItem = (req, res) => {
  const accountId = req.user ? req.user.openid : null;
  const { shop_id, item_id, count = 1 } = req.body;

  if (!accountId) {
    return res.status(401).json({ status: 1, message: 'Utilisateur non authentifié' });
  }

  if (!shop_id && !item_id) {
    return res.status(400).json({ status: 1, message: 'Identifiant d\'article requis' });
  }

  // Recherche de l'article dans le catalogue boutique
  const shopQuery = shop_id 
    ? 'SELECT * FROM shop_items WHERE shop_id = ?' 
    : 'SELECT * FROM shop_items WHERE item_id = ?';
  const shopParam = shop_id || item_id;

  db.get(shopQuery, [shopParam], (err, item) => {
    if (err || !item) {
      return res.status(404).json({ status: 1, message: 'Article introuvable dans la boutique' });
    }

    const totalDiamonds = item.price_diamonds * count;
    const totalGold = item.price_gold * count;

    // Récupération du solde actuel du joueur
    db.get('SELECT diamonds, gold FROM player_profiles WHERE account_id = ?', [accountId], (err, profile) => {
      if (err || !profile) {
        return res.status(404).json({ status: 1, message: 'Profil joueur non trouvé' });
      }

      if (profile.diamonds < totalDiamonds) {
        return res.status(400).json({ status: 1, message: 'Solde de diamants insuffisant' });
      }

      if (profile.gold < totalGold) {
        return res.status(400).json({ status: 1, message: 'Solde d\'or insuffisant' });
      }

      const remainingDiamonds = profile.diamonds - totalDiamonds;
      const remainingGold = profile.gold - totalGold;

      // Déduction des devises du joueur
      db.run(
        'UPDATE player_profiles SET diamonds = ?, gold = ? WHERE account_id = ?',
        [remainingDiamonds, remainingGold, accountId],
        function (err) {
          if (err) {
            return res.status(500).json({ status: 1, message: 'Erreur lors du traitement du paiement' });
          }

          // Vérification de la présence préalable de l'objet dans l'inventaire
          db.get(
            'SELECT id FROM inventory WHERE account_id = ? AND item_id = ?',
            [accountId, item.item_id],
            (err, invItem) => {
              if (invItem) {
                // Mise à jour de la quantité si l'objet existe déjà
                db.run(
                  'UPDATE inventory SET count = count + ? WHERE id = ?',
                  [count, invItem.id],
                  (err) => {
                    if (err) {
                      return res.status(500).json({ status: 1, message: 'Erreur d\'ajout à l\'inventaire' });
                    }
                    return res.json({
                      status: 0,
                      remaining_diamonds: remainingDiamonds,
                      remaining_gold: remainingGold,
                      added_items: [
                        {
                          item_id: item.item_id,
                          count: count
                        }
                      ]
                    });
                  }
                );
              } else {
                // Insertion d'un nouvel objet dans l'inventaire
                const category = item.category || 'general';
                db.run(
                  'INSERT INTO inventory (account_id, item_id, category, name, equipped, count) VALUES (?, ?, ?, ?, 0, ?)',
                  [accountId, item.item_id, category, item.name, count],
                  (err) => {
                    if (err) {
                      return res.status(500).json({ status: 1, message: 'Erreur de création de l\'objet en inventaire' });
                    }
                    return res.json({
                      status: 0,
                      remaining_diamonds: remainingDiamonds,
                      remaining_gold: remainingGold,
                      added_items: [
                        {
                          item_id: item.item_id,
                          count: count
                        }
                      ]
                    });
                  }
                );
              }
            }
          );
        }
      );
    });
  });
};
