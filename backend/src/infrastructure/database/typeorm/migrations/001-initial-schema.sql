-- =============================================================
-- PicáCerca — Migration inicial
-- MySQL 5.7+ con soporte espacial
-- Ejecutar: mysql -u root -p picacerca_db < 001-initial-schema.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS picacerca_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE picacerca_db;

-- --------------------------------------------------
-- USERS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)                                     NOT NULL,
  name          VARCHAR(100)                                    NOT NULL,
  email         VARCHAR(150)                                    NOT NULL,
  password_hash VARCHAR(255)                                    NOT NULL,
  role          ENUM('USER','OWNER','ADMIN','MODERATOR')        NOT NULL DEFAULT 'USER',
  is_active     TINYINT(1)                                      NOT NULL DEFAULT 1,
  avatar_url    VARCHAR(500)                                    NULL,
  created_at    DATETIME                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME                                        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- CATEGORIES
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         VARCHAR(36)  NOT NULL,
  name       VARCHAR(80)  NOT NULL,
  slug       VARCHAR(80)  NOT NULL,
  icon       VARCHAR(100) NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- PLACES
-- La columna `location` es POINT NOT NULL para el índice espacial.
-- MySQL 5.7 requiere NOT NULL en columnas con SPATIAL INDEX.
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  id             VARCHAR(36)                  NOT NULL,
  name           VARCHAR(150)                 NOT NULL,
  description    TEXT                         NULL,
  category_id    VARCHAR(36)                  NOT NULL,
  address        VARCHAR(300)                 NOT NULL,
  city           VARCHAR(100)                 NOT NULL,
  latitude       DECIMAL(10,7)                NOT NULL,
  longitude      DECIMAL(10,7)                NOT NULL,
  location       POINT                        NOT NULL,
  phone          VARCHAR(20)                  NULL,
  website        VARCHAR(300)                 NULL,
  instagram      VARCHAR(100)                 NULL,
  price_range    ENUM('LOW','MEDIUM','HIGH')   NOT NULL,
  rating_average DECIMAL(3,2)                 NOT NULL DEFAULT 0.00,
  review_count   INT                          NOT NULL DEFAULT 0,
  is_verified    TINYINT(1)                   NOT NULL DEFAULT 0,
  is_active      TINYINT(1)                   NOT NULL DEFAULT 1,
  created_by_id  VARCHAR(36)                  NOT NULL,
  created_at     DATETIME                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  SPATIAL INDEX idx_places_location (location),
  KEY idx_places_category (category_id),
  KEY idx_places_created_by (created_by_id),
  KEY idx_places_active (is_active),
  CONSTRAINT fk_places_category  FOREIGN KEY (category_id)   REFERENCES categories (id),
  CONSTRAINT fk_places_created_by FOREIGN KEY (created_by_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- REVIEWS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id                  VARCHAR(36) NOT NULL,
  place_id            VARCHAR(36) NOT NULL,
  user_id             VARCHAR(36) NOT NULL,
  rating              TINYINT     NOT NULL,
  comment             TEXT        NULL,
  food_quality_score  TINYINT     NULL,
  price_quality_score TINYINT     NULL,
  service_score       TINYINT     NULL,
  cleanliness_score   TINYINT     NULL,
  created_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_user_place (user_id, place_id),
  KEY idx_reviews_place (place_id),
  CONSTRAINT fk_reviews_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user  FOREIGN KEY (user_id)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- REVIEW_REPLIES (OWNER responde a reseñas)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS review_replies (
  id         VARCHAR(36) NOT NULL,
  review_id  VARCHAR(36) NOT NULL,
  owner_id   VARCHAR(36) NOT NULL,
  comment    TEXT        NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reply_review (review_id),
  KEY idx_reply_owner (owner_id),
  CONSTRAINT fk_reply_review FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_owner  FOREIGN KEY (owner_id)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- PLACE_PHOTOS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS place_photos (
  id         VARCHAR(36)  NOT NULL,
  place_id   VARCHAR(36)  NOT NULL,
  user_id    VARCHAR(36)  NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  public_id  VARCHAR(200) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_photos_place (place_id),
  CONSTRAINT fk_photos_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE,
  CONSTRAINT fk_photos_user  FOREIGN KEY (user_id)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- FAVORITES
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id         VARCHAR(36) NOT NULL,
  user_id    VARCHAR(36) NOT NULL,
  place_id   VARCHAR(36) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_user_place (user_id, place_id),
  CONSTRAINT fk_favorites_user  FOREIGN KEY (user_id)  REFERENCES users (id),
  CONSTRAINT fk_favorites_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- REPORTS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          VARCHAR(36)                                          NOT NULL,
  user_id     VARCHAR(36)                                          NOT NULL,
  place_id    VARCHAR(36)                                          NOT NULL,
  reason      VARCHAR(100)                                         NOT NULL,
  description TEXT                                                 NULL,
  status      ENUM('PENDING','REVIEWED','RESOLVED','REJECTED')     NOT NULL DEFAULT 'PENDING',
  created_at  DATETIME                                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME                                             NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_status (status),
  CONSTRAINT fk_reports_user  FOREIGN KEY (user_id)  REFERENCES users (id),
  CONSTRAINT fk_reports_place FOREIGN KEY (place_id) REFERENCES places (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- MENU_ITEMS (OWNER)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id           VARCHAR(36)   NOT NULL,
  place_id     VARCHAR(36)   NOT NULL,
  name         VARCHAR(150)  NOT NULL,
  description  TEXT          NULL,
  price        DECIMAL(10,2) NOT NULL,
  image_url    VARCHAR(500)  NULL,
  is_available TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menu_place (place_id),
  CONSTRAINT fk_menu_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- BUSINESS_HOURS (OWNER)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS business_hours (
  id          VARCHAR(36)                                        NOT NULL,
  place_id    VARCHAR(36)                                        NOT NULL,
  day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT','SUN')   NOT NULL,
  open_time   TIME                                               NULL,
  close_time  TIME                                               NULL,
  is_closed   TINYINT(1)                                         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hours_place_day (place_id, day_of_week),
  CONSTRAINT fk_hours_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- OFFERS (OWNER)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS offers (
  id             VARCHAR(36)              NOT NULL,
  place_id       VARCHAR(36)              NOT NULL,
  title          VARCHAR(150)             NOT NULL,
  description    TEXT                     NULL,
  image_url      VARCHAR(500)             NULL,
  discount_type  ENUM('PERCENT','FIXED')  NOT NULL,
  discount_value DECIMAL(10,2)            NOT NULL,
  valid_from     DATETIME                 NOT NULL,
  valid_to       DATETIME                 NOT NULL,
  is_active      TINYINT(1)               NOT NULL DEFAULT 1,
  created_at     DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_offers_place (place_id),
  KEY idx_offers_active (is_active, valid_to),
  CONSTRAINT fk_offers_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
