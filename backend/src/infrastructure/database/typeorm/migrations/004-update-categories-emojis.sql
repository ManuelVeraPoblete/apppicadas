-- Reemplaza los slugs de iconos por emojis reales en la columna icon
UPDATE categories SET icon = '🏠' WHERE slug = 'menu-casero';
UPDATE categories SET icon = '🌭' WHERE slug = 'completos';
UPDATE categories SET icon = '🥪' WHERE slug = 'sandwiches';
UPDATE categories SET icon = '🥟' WHERE slug = 'empanadas';
UPDATE categories SET icon = '🍕' WHERE slug = 'pizzeria';
UPDATE categories SET icon = '🍣' WHERE slug = 'sushi';
UPDATE categories SET icon = '🦐' WHERE slug = 'mariscos';
UPDATE categories SET icon = '🥩' WHERE slug = 'parrilladas';
UPDATE categories SET icon = '☕' WHERE slug = 'cafeteria';
UPDATE categories SET icon = '🚚' WHERE slug = 'food-trucks';
UPDATE categories SET icon = '🌿' WHERE slug = 'vegano';
UPDATE categories SET icon = '🏷️' WHERE slug = 'barato';
UPDATE categories SET icon = '👨‍👩‍👧' WHERE slug = 'familiar';
