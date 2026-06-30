# Sumaqta Móvil

App móvil nativa (React Native + Expo) para el **rol Mozo** de un restaurante. Es la versión nativa del flujo de servicio en mesa que hoy vive en la PWA `mozo4`, consumiendo el mismo backend `pro8` (multi-tenant). No reemplaza a mozo4: se enfoca solo en lo que el mozo hace de pie, con celular en mano, donde el nativo aporta valor real (impresión Bluetooth de comandas, gestos fluidos, notificaciones, mejor offline).

Reutiliza tal cual el esqueleto y el sistema de diseño de **movilfacturador** (`/var/www/movilfacturador`): mismo stack, misma arquitectura por capas, misma paleta cálida y los mismos módulos transversales (auth por tenant, impresión ESC/POS, tema/personalización).

---

## 1. Alcance (opción B: solo el rol Mozo)

Incluye:
- Servicio en mesa: salón, abrir mesa, tomar pedido, enviar comanda, agregar rondas.
- Gestión de mesa: mover, agrupar/desagrupar, historial de comandas.
- Cobro y cierre: cuenta, medios de pago, emisión de comprobante o nota de venta, ticket.
- Para llevar (takeaway) y delivery.
- Avisos de cocina (pedido listo) y manejo de conexión inestable.

No incluye (se quedan en la web mozo4 / panel admin):
- Mantenimiento de productos, precios masivos, reportes administrativos, configuración del local.

---

## 2. Stack (idéntico a movilfacturador)

- React Native + Expo (Expo Router, `src/app`) + TypeScript estricto (sin `any`).
- **pnpm con `node-linker=hoisted`** (`.npmrc`, obligatorio para Metro).
- TanStack React Query (servidor) + Zustand (estado local) + axios.
- `expo-secure-store` (sesión), `@expo/vector-icons`, `react-native-safe-area-context`.
- `@brooons/react-native-bluetooth-escpos-printer` para impresión de comandas/tickets.
- Fuentes IBM Plex Mono para cifras (montos, cantidades).

---

## 3. Arquitectura por capas (reutilizada)

```
UI (src/app/*)  ->  hooks (use-X.ts)  ->  api (X.api.ts)  ->  cliente axios central (src/core/api/client.ts)
```

- `src/core/api/client.ts`: baseURL por tenant + Bearer + interceptor 401 -> logout.
- Cada feature en `src/features/<modulo>/` con `types` / `api` / `hooks`.
- Diseño en `src/core/theme/` (tokens + paleta + tema personalizable).

### Reglas de código (heredadas)
- Sin comentarios (ni JSDoc ni inline).
- Sin placeholders en inputs: labels visibles siempre.
- Tipado estricto, nada de `any`.
- Commits granulares (uno por archivo), conventional en español, sin `Co-Authored-By`.

---

## 4. Sistema de diseño (copiado de movilfacturador, sin cambios)

Paleta cálida "Crema". Se copia `src/core/theme/tokens.ts` y `palette.ts` tal cual.

| Token       | Claro     | Uso |
|-------------|-----------|-----|
| `bg`        | `#F3EEE3` | Fondo de pantalla |
| `surface`   | `#FFFFFF` | Tarjetas |
| `surfaceAlt`| `#EFE9DC` | Tarjetas secundarias |
| `border`    | `#E6DFD1` | Bordes |
| `text`      | `#211D17` | Texto principal |
| `muted`     | `#8A8273` | Texto secundario |
| `brand`     | `#211D17` | Botones/hero |
| `onBrand`   | `#F3EEE3` | Texto sobre brand |
| `accent`    | `#8A5A00` | Acentos |
| `ok`/`warn`/`danger` | `#3F7A52` / `#B5791A` / `#B23B3B` | Estados |

- Tema oscuro y presets (Crema/Oscuro/Azul/Verde/Vino) ya resueltos en `palette.ts` (`construirPaleta`).
- Tipografía: IBM Plex Mono SemiBold para montos y cantidades; sistema para texto.
- Radios: `sm 8 / md 12 / lg 16 / xl 22`.

Aplicación al dominio restaurante (mismos tokens, distinta semántica):
- Mesa libre -> `ok`. Mesa ocupada -> `accent`/`brand`. Mesa por cobrar -> `warn`.

---

## 5. Roles y autenticación

Login en dos pasos, igual que mozo4:
1. Dominio del tenant (subdominio del restaurante) -> fija el `baseURL`.
2. Selección del mozo + PIN/contraseña -> token Bearer guardado en secure-store.

El rol de trabajo es **MOZO**. La app no expone vistas de otros roles.

---

## 6. Funcionalidades (el corazón del plan)

Numeradas por fases, de núcleo a extras. Cada una indica los endpoints `pro8` ya existentes (descubiertos en mozo4) o los que faltarían.

### Fase 0 — Base
- Login de mozo (dominio + mozo + PIN), sesión segura, cliente por tenant.
- Navegación con tabs cálidos y tema personalizable.
- Reutilización directa de: `core/api`, `core/auth`, `core/theme`, `core/printer`, `core/storage`.

### Fase 1 — Servicio en mesa (núcleo)
- **Salón / mapa de mesas**: grilla con estado (libre / ocupada / por cobrar), total acumulado por mesa, mesas agrupadas. (`POST /restaurant/table`)
- **Abrir mesa** y ver su cuenta actual.
- **Tomar pedido**: catálogo por categoría, búsqueda, stock y precio en vivo. (`GET /restaurant/items/stock`, `/restaurant/items/price`)
- **Carrito de pedido (bag)**: cantidad, nota por ítem (sin sal, término, etc.), quitar ítem.
- **Enviar comanda a cocina**: registra la comanda e imprime por Bluetooth. (`POST /print-orders` + `core/printer`)
- **Rondas**: agregar más ítems a una mesa ya abierta.

### Fase 2 — Gestión de mesa
- **Mover pedido** de una mesa a otra. (`POST restaurant/order/change-table`)
- **Agrupar / desagrupar mesas** para juntar cuentas. (`tables/group/add | disband | remove`)
- **Historial de comandas** de la mesa (qué se mandó y a qué hora).

### Fase 3 — Cobro y cierre
- **Cerrar mesa** -> resumen de cuenta. (`restaurant/command-item/close-table/{tableId}`)
- **Cobro**: selección de medios de pago, emisión de boleta/factura con lookup de cliente por RUC/DNI (reusar `customers/lookup` de movilfacturador) o **nota de venta**. (`POST /documents`, `/sale-note`, `/person`)
- **Ticket de venta** impreso por Bluetooth.
- **Integración con caja** del restaurante. (`POST cash/restaurant`)

### Fase 4 — Para llevar y delivery
- **Takeaway**: pedido sin mesa.
- **Delivery**: datos de cliente y dirección, mismo flujo de comanda y cobro.

### Fase 5 — Tiempo real y robustez
- **Avisos de cocina** (pedido listo) por notificación push o polling. (store `kitchenNotifications` de referencia)
- **Indicador de conexión** y **cola offline** para no perder comandas si se cae la red (referencia: `useConnectivity` de mozo4).
- Reabrir / anular comanda.

### Transversales (ya resueltos en movilfacturador)
- Personalización de tema (presets + colores).
- Impresión Bluetooth ESC/POS.
- Sesión por tenant con auto-logout en 401.

---

## 7. Mapa de endpoints pro8 (desde mozo4)

Ya existentes (no requieren backend nuevo):

| Acción | Endpoint |
|--------|----------|
| Mesas | `POST /restaurant/table` |
| Agrupar mesas | `POST /restaurant/tables/group/{add,disband,remove}` |
| Mover pedido | `POST restaurant/order/change-table` |
| Cerrar mesa | `POST restaurant/command-item/close-table/{tableId}` |
| Stock de ítems | `GET /restaurant/items/stock` |
| Precios de ítems | `POST /restaurant/items/price` |
| Comanda | `POST /print-orders` |
| Caja restaurante | `POST cash/restaurant` |
| Emisión / nota | `POST /documents`, `POST /sale-note` |
| Cliente | `POST /person` |

A confirmar / posible backend nuevo (estilo `MobileController` de pro8):
- Endpoint de lectura de mesas con totales y estado ya calculados para móvil.
- Lookup de cliente reutilizando `/mobile/customers/lookup`.
- Push de "pedido listo" (si se quiere tiempo real en vez de polling).

---

## 8. Estructura de carpetas propuesta

```
src/
  app/
    (tabs)/
      _layout.tsx
      salon.tsx           # mapa de mesas
      pedido.tsx          # takeaway/delivery rápido
      caja.tsx            # estado de caja del turno
      mas.tsx             # ajustes/tema/impresora
    mesa/[id].tsx         # cuenta de la mesa + tomar pedido
    cobrar/[id].tsx       # cobro y emisión
    login.tsx
  core/                   # copiado de movilfacturador: api, auth, theme, printer, storage, config, ui
  features/
    salon/                # mesas: types/api/hooks
    pedido/               # catálogo + bag
    comanda/              # enviar/imprimir comanda
    cobro/                # cierre, pagos, emisión
    cocina/              # avisos de pedido listo
  shared/                 # format, usar-teclado, ui/visor-pdf, validacion (copiado)
```

---

## 9. Roadmap

- **Hito 1 (MVP usable):** Fases 0–1. Un mozo puede entrar, ver mesas, tomar pedido e imprimir comanda. Es lo que justifica la app por sí solo.
- **Hito 2 (operación completa):** Fases 2–3. Mover/agrupar mesas y cobrar/emitir desde el celular.
- **Hito 3 (cobertura total):** Fases 4–5. Takeaway/delivery, avisos de cocina y robustez offline.
- **Cierre:** APK con EAS (perfil `preview` = apk), `app.json` package `cloud.insoft.sumaqtamovil`.

---

## 10. Qué se reutiliza vs. qué es nuevo

Reutilizado (copiar de movilfacturador, casi sin tocar):
- `core/api`, `core/auth`, `core/theme`, `core/printer`, `core/storage`, `core/config`.
- `shared/format`, `shared/usar-teclado`, `shared/ui/visor-pdf`, `shared/validacion`.
- Patrón de pantalla, tabs, modales tipo hoja inferior.

Nuevo (lo que hay que construir):
- Features `salon`, `pedido`, `comanda`, `cobro`, `cocina`.
- Pantallas `salon`, `mesa/[id]`, `cobrar/[id]`, `pedido`.
- Adaptar la plantilla de comanda ESC/POS al formato de cocina (ítems + notas, sin precios) además del ticket de venta (con precios).

---

## Estado

Hito 1 en progreso. Hecho:
- Scaffold base copiado de movilfacturador (`core`, `shared`, assets, configs, `.npmrc`, `patches`).
- Configs adaptadas: `app.json` (name Sumaqta, package `cloud.insoft.sumaqtamovil`), `package.json`.
- Auth de mozo: `session.ts` (claves `sq-*`, usuario con rol/establecimiento) y `auth.api.ts` (`POST /api/login`).
- Feature `salon`: tipos, api (`GET /restaurant/tablesAndEnv`) y hook con React Query.
- Pantallas navegables: layout raíz con guardia de sesión, login de mozo, tabs (Salón / Más), pantalla de Salón con mesas por ambiente y estado por color.

- Toma de pedido en `mesa/[id]`: feature `catalogo` (`GET /restaurant/items` y `/restaurant/categories`), carrito por mesa (`features/pedido/bag-store`, Zustand) con búsqueda, filtro por categoría, cantidades y nota por ítem, y hoja inferior de pedido con total.

Pendiente del Hito 1: conectar el envío de comanda al backend (`POST /restaurant/table/{id}` para guardar el pedido y `POST /print-orders` + impresión Bluetooth). Hoy el botón "Enviar comanda" no escribe en el servidor: el payload de mesa es complejo y modifica mesas reales, así que se conecta recién al validar el flujo contra un restaurante de prueba.

Falta antes de probar en dispositivo: `pnpm install`, configurar EAS (`eas init`) y validar el login contra un tenant real.
