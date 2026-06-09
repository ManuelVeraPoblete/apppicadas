# PicáCerca 🍽️

> **Las mejores picadas cerca de ti.**

App de descubrimiento de comida local que conecta a usuarios con picadas auténticas cercanas mediante geolocalización.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Base de datos | MySQL 8.0 (local, sin Docker) |
| Backend | NestJS + TypeScript + TypeORM |
| Mobile | React Native + Expo 56 + TypeScript |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| HTTP client | Axios + interceptores JWT |
| Autenticación | JWT (access 15m + refresh 7d) |
| Geolocalización | MySQL `ST_Distance_Sphere` + `expo-location` |

---

## Arquitectura del backend

El backend sigue **Clean Architecture + DDD + Hexagonal Architecture** con separación estricta en capas:

```
src/
├── core/
│   ├── domain/
│   │   ├── entities/          ← Entidades puras (sin ORM)
│   │   ├── enums/             ← UserRole, PriceRange, DayOfWeek, etc.
│   │   └── exceptions/        ← Excepciones de dominio tipadas
│   └── ports/
│       └── repositories/      ← Interfaces (puertos) con tokens Symbol
├── application/
│   └── [módulo]/
│       ├── use-cases/         ← Un archivo por caso de uso
│       └── dtos/              ← DTOs de entrada/salida con class-validator
├── infrastructure/
│   └── database/
│       ├── typeorm/
│       │   ├── entities/      ← ORM entities (con decoradores TypeORM)
│       │   ├── repositories/  ← Implementaciones de puertos
│       │   └── config/        ← typeorm.config.ts
│       └── mappers/           ← Conversión dominio ↔ ORM
└── presentation/
    └── [módulo]/
        ├── [módulo].controller.ts
        └── [módulo].module.ts
```

---

## Base de datos

**MySQL 8.0** con 11 tablas. La tabla `places` usa columna `POINT` con índice espacial para búsquedas geográficas eficientes.

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios con roles USER / OWNER / ADMIN / MODERATOR |
| `categories` | Categorías de locales (13 pre-cargadas) |
| `places` | Locales con columna `location POINT` + `SPATIAL INDEX` |
| `reviews` | Reseñas con rating 1-5 |
| `review_replies` | Respuestas del OWNER a reseñas |
| `place_photos` | Fotos de locales |
| `favorites` | Favoritos de usuarios |
| `reports` | Reportes de información incorrecta |
| `menu_items` | Ítems del menú de cada local |
| `business_hours` | Horarios por día de semana |
| `offers` | Ofertas con tipos PERCENTAGE / FIXED / TWO_FOR_ONE / FREE_ITEM |

### Credenciales MySQL

```
host: 127.0.0.1
port: 3306
user: manuel
password: q1w2e3
database: picacerca_db
```

### Migraciones

```bash
mysql -u manuel -p picacerca_db < docs/migrations/001-initial-schema.sql
mysql -u manuel -p picacerca_db < docs/migrations/002-seed-categories.sql
```

---

## API Backend

**Base URL:** `http://localhost:3000/api/v1`  
**Documentación Swagger:** `http://localhost:3000/api/docs`

### Endpoints principales

#### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar usuario (elige rol USER u OWNER) |
| POST | `/auth/login` | Login → accessToken + refreshToken |
| POST | `/auth/refresh` | Renovar accessToken |
| GET | `/auth/me` | Perfil del usuario autenticado |

#### Places
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/places/nearby` | No | Picadas cercanas por lat/lng/radio |
| GET | `/places/my-place` | OWNER | Obtener mi local |
| POST | `/places` | OWNER | Crear local |
| GET | `/places/:id` | No | Detalle de un local |
| PATCH | `/places/:id` | OWNER/ADMIN | Editar local |
| DELETE | `/places/:id` | OWNER/ADMIN | Desactivar local |
| GET | `/places/:id/menu` | No | Menú público del local |
| GET | `/places/:id/hours` | No | Horarios públicos del local |
| GET | `/places/:id/offers` | No | Ofertas activas del local |

#### Reviews
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/places/:id/reviews` | USER | Crear reseña |
| GET | `/places/:id/reviews` | No | Listar reseñas |
| PATCH | `/reviews/:id` | USER | Editar mi reseña |
| DELETE | `/reviews/:id` | USER/ADMIN | Eliminar reseña |
| POST | `/reviews/:id/reply` | OWNER | Responder reseña |
| PATCH | `/reviews/:id/reply` | OWNER | Editar respuesta |

#### Owner (gestión del local)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/owner/places/:id/menu` | Listar / crear ítem de menú |
| PATCH/DELETE | `/owner/places/:id/menu/:itemId` | Editar / eliminar ítem |
| GET/PUT | `/owner/places/:id/hours` | Ver / reemplazar horarios |
| GET/POST | `/owner/places/:id/offers` | Listar / crear oferta |
| PATCH/DELETE | `/owner/places/:id/offers/:offerId` | Editar / eliminar oferta |

#### Otros
| Módulo | Rutas |
|--------|-------|
| Categories | `GET /categories`, `GET /categories/:id` |
| Favorites | `GET/POST /favorites`, `DELETE /favorites/:placeId` |
| Reports | `POST /reports`, `GET/PATCH /reports/:id` (admin) |

### Búsqueda geoespacial

La búsqueda de picadas cercanas usa `ST_Distance_Sphere` de MySQL 8 con el truco de `CONCAT` para evitar el problema de sustitución de `?` dentro de literales de texto:

```sql
SELECT p.*,
  ST_Distance_Sphere(
    p.location,
    ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'), 4326)
  ) AS distance_meters
FROM places p
WHERE p.is_active = 1
  AND ST_Distance_Sphere(
    p.location,
    ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'), 4326)
  ) <= ?
ORDER BY distance_meters ASC
```

---

## Cómo correr el backend

```bash
cd apps/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env   # o crear .env manualmente

# Correr en modo desarrollo (synchronize: true crea tablas automáticamente)
npm run start:dev
```

### Variables de entorno (`apps/backend/.env`)

```env
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=manuel
DB_PASSWORD=q1w2e3
DB_NAME=picacerca_db
JWT_SECRET=picacerca_jwt_secret_desarrollo_2025_super_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=picacerca_refresh_secret_desarrollo_2025_super_seguro
JWT_REFRESH_EXPIRES_IN=7d
```

---

## App Mobile

Construida con **Expo Router** (file-based routing), dos stacks de navegación completamente separados según el rol del usuario.

### Estructura de rutas

```
apps/mobile/app/
├── _layout.tsx                  ← Root: carga usuario y redirige por rol
├── (auth)/
│   ├── login.tsx                ← Login con validación Zod
│   └── register.tsx             ← Registro con selector de rol
├── (user)/(tabs)/
│   ├── favorites.tsx            ← Mis favoritos (tab 1)
│   ├── explore.tsx              ← Explorar con filtros de categoría
│   ├── map.tsx                  ← Mapa interactivo con pines
│   └── profile.tsx              ← Perfil y logout
├── (owner)/(tabs)/
│   ├── my-place.tsx             ← Crear/editar mi local
│   ├── menu.tsx                 ← CRUD del menú
│   ├── offers.tsx               ← CRUD de ofertas
│   ├── reviews.tsx              ← Ver y responder reseñas
│   └── profile.tsx              ← Perfil y logout
└── place/[id].tsx               ← Detalle público (Info / Menú / Reseñas / Ofertas)
```

### Estructura interna (`apps/mobile/src/`)

```
src/
├── api/
│   ├── client.ts        ← Axios con interceptor JWT (auto-refresh)
│   ├── auth.api.ts
│   ├── places.api.ts
│   ├── owner.api.ts
│   └── reviews.api.ts
├── stores/
│   ├── auth.store.ts    ← Login/Register/Logout/LoadUser
│   ├── places.store.ts  ← Nearby + categorías
│   └── favorites.store.ts
├── theme/
│   ├── colors.ts        ← Naranja #E85D04 (primario), crema #FFF8F0
│   └── spacing.ts       ← Spacing, Radius, Shadow
├── types/
│   ├── auth.types.ts
│   ├── place.types.ts
│   └── review.types.ts
└── components/
    ├── ui/
    │   ├── Button.tsx       ← Variantes: primary / outline / ghost
    │   ├── Input.tsx        ← Con soporte de password toggle
    │   ├── StarRating.tsx   ← Interactivo y de solo lectura
    │   └── Badge.tsx        ← Badge genérico + PriceBadge ($, $$, $$$)
    └── places/
        └── PlaceCard.tsx    ← Card con distancia, rating, precio
```

### Funcionalidades por pantalla

**Login / Register**
- Validación con React Hook Form + Zod
- Registro muestra tarjetas para elegir rol (👤 Usuario / 🏪 Dueño)
- Redirección automática al stack correcto según rol

**Explorar (USER)**
- Pide permiso de ubicación, usa `expo-location`
- Filtro por categoría (chips horizontales)
- Búsqueda local por nombre/dirección
- Lista de `PlaceCard` con distancia en metros/km

**Mapa (USER)**
- Mapa con `react-native-maps` y pines en picadas cercanas
- Muestra contador de picadas en badge flotante

**Favoritos (USER)**
- Carga desde el backend al iniciar sesión
- Estado optimista al agregar/quitar

**Detalle de lugar (público)**
- 4 tabs: Info, Menú, Reseñas, Ofertas
- Agregar reseña con selector de estrellas interactivo
- Respuesta del dueño con borde naranja destacado
- Botón de favorito (❤️ / 🤍) para usuarios autenticados

**Mi Local (OWNER)**
- Formulario completo: nombre, descripción, dirección, lat/lng, teléfono, instagram
- Selector de precio ($, $$, $$$) y categoría
- Crea o edita según si ya existe un local

**Menú (OWNER)**
- Lista de ítems con precio
- Modal inferior para crear/editar con switch de disponibilidad
- Eliminar con confirmación

**Ofertas (OWNER)**
- CRUD completo con tipos de descuento
- Selector de fecha de inicio y vencimiento

**Reseñas (OWNER)**
- Lista con rating y comentario de cada usuario
- Modal para escribir o editar respuesta

### Cómo correr la app mobile

```bash
cd apps/mobile

# Instalar dependencias
npm install

# Verificar IP del backend en src/api/client.ts
# BASE_URL = 'http://<tu-ip-local>:3000/api/v1'

# Iniciar el servidor de desarrollo
npx expo start
```

Escanear el QR con la app **Expo Go** en el celular (Android o iOS) en la misma red WiFi.

> **Importante:** El backend debe estar corriendo antes de iniciar la app mobile.

---

## Orden de inicio

```bash
# 1. Levantar el backend
cd apps/backend && npm run start:dev

# 2. Levantar la app mobile (otra terminal)
cd apps/mobile && npx expo start
```

---

## Decisiones técnicas relevantes

| Problema | Solución |
|----------|----------|
| MySQL no acepta `?` dentro de literales SQL | `CONCAT('POINT(', ?, ' ', ?, ')')` en ST_GeomFromText |
| `isolatedModules` incompatible con interfaces en DI | `"isolatedModules": false` en tsconfig del backend |
| `expiresIn` de jsonwebtoken no acepta `string` | Cast `as any` en el factory de JwtModule |
| UUID v1 de MySQL rechazado por `@IsUUID('4')` | Cambiado a `@IsUUID('all')` en los DTOs |
| `localhost` usa socket en Linux (falla MySQL) | Usar `127.0.0.1` explícito en config y `.env` |
| `z.coerce.number()` con zodResolver en zod v4 | Cambiar a `z.string().refine(...)` y convertir en submit |

---

## Pendiente

- **Panel admin (Angular 20):** Gestión de usuarios, verificación de locales, moderación de reportes
- **Cloudinary:** Subida de fotos de locales (módulo de fotos preparado, falta configurar credenciales en `.env`)
