# Rediseño Visual PicáCerca — Spec

**Fecha:** 2026-06-10  
**Alcance:** Todas las pantallas del frontend mobile excepto `(auth)/login.tsx`

---

## Decisiones de diseño confirmadas

| Pregunta | Elección |
|----------|----------|
| Estilo general | A — Cálido y Vivo (gradientes naranja, colores cálidos) |
| Layout de PlaceCard | B — Horizontal mejorado (más compacto, imagen 88px izquierda) |
| Header de Explorar | A — Banner gradiente inmersivo |
| Header de detalle local | B — Barra naranja compacta con emoji en círculo |

---

## 1. Sistema base (global)

### Colores — sin cambios en `colors.ts`
El sistema de colores actual se mantiene. Los cambios son en cómo se usan.

### Fondo de pantallas
- Cambiar `Colors.background` (`#FAFAFA`) → `#F5F0EB` en pantallas de listas y detalles
- Mantener `Colors.surface` (`#FFFFFF`) para cards y headers

### Cards
- `borderRadius: 16` (era `Radius.lg = 16` — igual)
- `...Shadow.md` en vez de `Shadow.sm` para más profundidad
- Sin `borderWidth`

### Category chips (inactivos)
- Fondo: `#FFF3E6`
- Borde: `1.5px solid #FFD4A8`
- Texto: `Colors.primary` (`#E85D04`)
- Chip activo: igual que ahora (fondo `Colors.primary`, texto blanco)

### Gradiente estándar de headers
```
background: linear-gradient(135deg, #C04A00, #E85D04, #FF7A1A)
```
Con dos círculos decorativos semitransparentes (`rgba(255,255,255,0.08)`) posicionados arriba-derecha y abajo-izquierda.

---

## 2. PlaceCard — `src/components/places/PlaceCard.tsx`

### Layout (horizontal, sin cambio estructural)
```
[imagen 88px] | [nombre] [verificado?]
               | [dirección]
               | [estrellas] [reviews] [precio] [distancia?]
```

### Imagen (izquierda, 88px ancho, altura flexible)
- Fondo fallback: `linear-gradient(135deg, #FFB347, #E85D04)` (cálido)
- Emoji centrado en 32px
- Badge de distancia: centrado en la parte inferior, `background: rgba(0,0,0,0.55)`, texto blanco 8px
- Sin cambio si hay `imageUrl` real

### Contenido (derecha)
- Nombre: `fontSize: 13, fontWeight: '800'`
- Dirección: `fontSize: 9, color: Colors.textSecondary`
- Fila de meta: rating + `(N reseñas)` + precio en misma línea, `fontSize: 9`
- Badge "✓ Verificado": pill verde (`background: '#E8F5E9', color: '#2E7D32'`), aparece solo cuando `place.isVerified`
- Badge precio: fondo `#FFF3E6`, texto `Colors.primary`, `borderRadius: 6`

### Card wrapper
- `Shadow.md` (en vez de `Shadow.sm`)
- `borderRadius: Radius.lg` (16)
- `marginBottom: Spacing.sm`

---

## 3. Pantalla Explorar — `app/(user)/(tabs)/explore.tsx`

### Header (banner gradiente)
- Gradiente estándar con 2 círculos decorativos
- Texto superior: `"🔥 {N} picadas cerca tuyo"` (conteo de `nearbyPlaces.length`), blanco semitransparente, 11px
- Título: `"Descubre tu próxima picada"`, blanco, 20px, `fontWeight: '900'`
- Barra de búsqueda: `background: white`, `borderRadius: 14`, `padding: 9 14`, sombra `0 4px 16px rgba(0,0,0,0.15)`, icono 🔍 gris, placeholder gris claro

### Category chips
- Aplicar nuevo estilo inactivo: fondo `#FFF3E6`, borde `#FFD4A8`, texto naranja
- Contenedor: `background: white`, `borderBottom: 1px solid #F0E8E0`
- Chip activo: igual que ahora

### Lista
- `contentContainerStyle`: `background: #F5F0EB`, `padding: Spacing.md`
- `ListEmptyComponent`: emoji 48px + texto, centrado

---

## 4. Detalle del local — `app/place/[id].tsx`

### Header (barra naranja compacta)
Reemplaza el `topBar` + `hero` actuales por un único bloque:

```
[← Volver]                    [🤍]
[emoji en círculo blanco 56px] [Nombre bold blanco]
                               [Dirección, ciudad — blanco semitransparente]
                               [★★★★★ 4.9 (42) · $$ · ✓]
```
- Fondo: `Colors.primary` (`#E85D04`)
- Padding: `12px 14px 16px`
- Círculo del emoji: `background: white`, `borderRadius: 28`, `width/height: 56`, `Shadow.md`
- Fila superior con volver + favorito: `color: white`
- Rating/precio/verificado: fila horizontal, blanco semitransparente

### Chips de contacto (cuando existen phone/instagram)
- Fila de pills blancas con sombra suave debajo del header naranja
- `background: white`, `borderRadius: 10`, padding `6 10`, `Shadow.sm`
- Aparece solo si hay datos

### Tabs
- Sin cambio estructural
- `borderBottomColor: Colors.primary` ya está — mantener
- `tabText` inactivo: `Colors.textMuted`
- `tabTextActive`: `Colors.primary`

### Contenido de tabs
- Fondo `#F5F0EB` en el `ScrollView`
- Cards con `Shadow.md`
- OfferCard: borde izquierdo naranja — mantener
- ReviewCard: avatar con gradiente naranja en vez de fondo plano `Colors.primary`

---

## 5. Pantalla Favoritos — `app/(user)/(tabs)/favorites.tsx`

### Header
- Gradiente estándar (más compacto, sin el texto de bienvenida)
- Título: `"❤️ Mis favoritos"` en blanco, 20px bold
- Subtítulo: `"{N} picadas guardadas"` en blanco semitransparente

### Lista
- Mismo `PlaceCard` mejorado
- Fondo `#F5F0EB`

### Estado vacío
- Emoji 56px + título + texto descriptivo — sin cambio estructural, mejorar estilos

---

## 6. Perfil de usuario — `app/(user)/(tabs)/profile.tsx`

### Header
- Gradiente estándar
- Avatar: círculo blanco con inicial, `Shadow.md`
- Nombre: blanco, 20px, bold
- Email: blanco semitransparente
- Badge de rol: pill blanca con texto naranja

### Sección de acciones
- `background: white`, `borderRadius: 16`, `Shadow.sm`
- Cada fila con ícono + texto, separador entre filas

---

## 7. Perfil del owner — `app/(owner)/(tabs)/profile.tsx`

- Mismo diseño que el perfil de usuario (sección 6)
- Badge de rol muestra `"🏪 Dueño de local"` en pill blanca con texto naranja

---

## 8. Pantallas Owner

Aplica a: `my-place.tsx`, `menu.tsx`, `offers.tsx`, `reviews.tsx`, `offer-form.tsx`

- **Headers**: gradiente estándar con título de la sección en blanco
- **Cards de contenido**: `Shadow.md`, `borderRadius: 16`
- **Botones de acción**: `Colors.primary` sólido con texto blanco — sin cambio
- **Estados vacíos**: emoji grande + título + CTA button

---

## 8. Pantallas Admin

Aplica a: `reports.tsx`, `places.tsx`, `categories.tsx`

- **Headers**: gradiente ligeramente más oscuro (`#8B2500` → `#C04A00` → `#E85D04`) para dar sensación de autoridad
- **Cards**: mismo sistema, `Shadow.md`
- **Badges de estado** (PENDING, REVIEWED, etc.): pills coloreadas según estado, mismos colores semánticos actuales

---

## 9. Pantalla de registro — `app/(auth)/register.tsx`

- Mantiene `ImageBackground` + overlay (coherente con login)
- Mejora el formulario semitransparente: `background: rgba(255,255,255,0.55)`, `backdropFilter` si disponible
- Role cards: borde naranja más prominente cuando activo, fondo `#FFF3E6`

---

## Archivos a modificar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/components/places/PlaceCard.tsx` | Rediseño completo de estilos |
| `app/(user)/(tabs)/explore.tsx` | Header nuevo + chips + fondo |
| `app/(user)/(tabs)/favorites.tsx` | Header + fondo |
| `app/(user)/(tabs)/profile.tsx` | Header gradiente + cards |
| `app/(owner)/(tabs)/profile.tsx` | Header gradiente + cards |
| `app/place/[id].tsx` | Hero → header compacto naranja |
| `app/(owner)/(tabs)/my-place.tsx` | Header gradiente |
| `app/(owner)/(tabs)/menu.tsx` | Header gradiente |
| `app/(owner)/(tabs)/offers.tsx` | Header gradiente |
| `app/(owner)/(tabs)/reviews.tsx` | Header gradiente |
| `app/(owner)/offer-form.tsx` | Header gradiente |
| `app/(admin)/(tabs)/reports.tsx` | Header oscuro + cards |
| `app/(admin)/(tabs)/places.tsx` | Header oscuro + cards |
| `app/(admin)/(tabs)/categories.tsx` | Header oscuro + cards |
| `app/(auth)/register.tsx` | Role cards + formulario |

**No modificar:** `app/(auth)/login.tsx`

---

## Fuera de alcance

- Animaciones y transiciones
- Fuentes personalizadas
- Skeleton loaders
- Cambios de lógica o navegación
