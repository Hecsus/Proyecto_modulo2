# Inventario Módulo 2

Aplicación de gestión de inventario para prácticas del módulo 2.

## Stack
- Node.js + Express 4
- EJS + express-ejs-layouts
- MySQL (mysql2/promise)
- dotenv, express-session, bcryptjs, express-validator, nodemon

## Instalación y ejecución
1. Clona el repositorio.
2. Copia `.env.example` a `.env` y completa los valores.
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Arranca en desarrollo:
   ```bash
   npm run dev
   ```

## Seguridad y Dependencias
No usar `npm audit fix --force`: puede forzar cambios de major (p. ej., Express 2.x/5.x) y romper la app.

Usamos overrides en `package.json` para fijar transitivas vulnerables sin romper el stack.

Audita solo producción (ignorando devDeps):
```bash
npm audit --omit=dev
```

### Reinstalación limpia (Windows)
```powershell
taskkill /F /IM node.exe 2>nul
rmdir /S /Q node_modules
del /F /Q package-lock.json
npm install
```

### Despliegue sin devDependencies
```bash
npm ci --omit=dev
```

### Verificaciones rápidas
- `node -v` (>= 18)
- `npm run dev` arranca sin errores (sin `uid2`)
- `npm audit --omit=dev` con 0 o mínimas vulnerabilidades
- Rutas `/`, `/login`, `/health` responden

## CHANGELOG
### [2025-09-08 18:11] – Saneado dependencias y fix 'uid2'
- Fijado Express 4.19.x y express-session ^1.18.0.
- Añadidos "overrides" para transitivas vulnerables (braces, micromatch, cross-spawn, debug, color-convert, color-name, got...).
- README: guía de reinstalación, auditoría prod y despliegue sin devDeps.
