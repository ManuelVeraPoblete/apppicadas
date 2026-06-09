-- Paso 1: ampliar el enum con todos los valores (incluyendo PERCENT legacy)
--         y hacer discount_value nullable
ALTER TABLE offers
  MODIFY COLUMN discount_type  ENUM('PERCENT','PERCENTAGE','FIXED','TWO_FOR_ONE','FREE_ITEM') NOT NULL,
  MODIFY COLUMN discount_value DECIMAL(10,2) NULL;

-- Paso 2: migrar el valor legacy al nuevo nombre
UPDATE offers SET discount_type = 'PERCENTAGE' WHERE discount_type = 'PERCENT';

-- Paso 3: eliminar el valor legacy del enum
ALTER TABLE offers
  MODIFY COLUMN discount_type ENUM('PERCENTAGE','FIXED','TWO_FOR_ONE','FREE_ITEM') NOT NULL;
