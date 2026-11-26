# 💸 Gastos MVP

App móvil de gestión de gastos personales: **React Native (Expo) + TypeScript + Supabase**.

## Funcionalidades
- Login/registro (Supabase Auth) + desbloqueo biométrico
- CRUD de gastos, categorías y presupuestos en **SQLite cifrada (SQLCipher)**
- Sincronización con Supabase (offline-first, last-write-wins)
- Foto del ticket con la cámara
- Notificación local al superar el 80 % del presupuesto + recordatorio semanal
- Gráfica por categoría y formato de moneda

## Requisitos
Node 18+, JDK 17 + Android Studio (o Xcode), cuenta de Supabase. **No funciona en Expo Go** (SQLCipher): requiere *development build*.

## Instalación
```bash
git clone <URL-DEL-REPO> && cd gastos-mvp
npm install
npx expo install --fix        # alinea versiones con tu SDK
cp .env.example .env          # rellena URL y anon key de Supabase
```
1. En Supabase: crea un proyecto, ejecuta `supabase/schema.sql` en el SQL Editor.
2. En *Authentication > Providers* deja Email activo (desactiva confirmación por correo si quieres probar más rápido).
3. Compila e inicia:
```bash
npx expo run:android          # o: npx expo run:ios
npm start
```

## Seguridad
| Mecanismo | Implementación |
|---|---|
| BD local cifrada | SQLCipher (AES-256), clave aleatoria en Keychain/Keystore (`expo-secure-store`) |
| Tokens | Sesión JWT cifrada con AES-CTR; clave en SecureStore |
| Validación | `zod` en cliente, `CHECK` en SQLite y Postgres, RLS en Supabase |
| Acceso | Biometría al abrir la app |
| Archivos | Fotos en el directorio privado de la app |
| Secretos | `.env` fuera de Git; nunca se usa `service_role` en el cliente |

## Librerías de terceros
`zod`, `zustand`, `react-native-gifted-charts`, `aes-js`.

## Estructura
```
app/         pantallas (expo-router)
src/core/    seguridad, validación, notificaciones, supabase
src/data/    esquema, repositorios, sincronización
src/store/   estado (zustand)
supabase/    schema.sql
docs/        reporte técnico
```

## Flujo Git
`main` ← `develop` ← `feature/*`; `hotfix/*` parte de `main` y se fusiona a `main` y `develop`.
