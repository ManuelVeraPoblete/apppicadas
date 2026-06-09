-- =============================================================
-- PicáCerca — Seed de categorías iniciales
-- =============================================================

USE picacerca_db;

INSERT INTO categories (id, name, slug, icon, is_active) VALUES
  (UUID(), 'Menú casero',   'menu-casero',   '🏠', 1),
  (UUID(), 'Completos',     'completos',     '🌭', 1),
  (UUID(), 'Sandwiches',    'sandwiches',    '🥪', 1),
  (UUID(), 'Empanadas',     'empanadas',     '🥟', 1),
  (UUID(), 'Pizzería',      'pizzeria',      '🍕', 1),
  (UUID(), 'Sushi',         'sushi',         '🍣', 1),
  (UUID(), 'Mariscos',      'mariscos',      '🦐', 1),
  (UUID(), 'Parrilladas',   'parrilladas',   '🥩', 1),
  (UUID(), 'Cafetería',     'cafeteria',     '☕', 1),
  (UUID(), 'Food trucks',   'food-trucks',   '🚚', 1),
  (UUID(), 'Vegano',        'vegano',        '🌿', 1),
  (UUID(), 'Barato',        'barato',        '🏷️', 1),
  (UUID(), 'Familiar',      'familiar',      '👨‍👩‍👧', 1);
