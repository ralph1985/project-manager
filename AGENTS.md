# Repository Guidelines

## Project Structure & Module Organization

- Root uses Lerna + npm workspaces for shared packages under `packages/`.
- `packages/`: componentes compartidos (LitElement u otros) versionados en este monorepo; añade aquí nuevo código fuente y tests.
- `projects/`: proyectos con repositorios propios (p. ej. `projects/ayuntamiento-de-belmontejo`); están git-ignorados aquí y no forman parte de los workspaces.
- Configuración común: `package.json` y `lerna.json` en la raíz controlan scripts agregados; añade scripts locales dentro de cada paquete.
- Los proyectos dentro de `projects/` llevan su propio `.git` y lockfile; se mantienen fuera de este monorepo.

## Build, Test, and Development Commands

- `npm install`: instala dependencias de todos los workspaces en `packages/` y genera `package-lock.json` raíz.
- `npm run dev`: ejecuta `lerna run dev --parallel --stream` en los paquetes.
- `npm run build | lint | format | test | test:e2e`: reenvía a `lerna run <tarea>` en cada paquete.
- Ejemplos dentro de un paquete: `npm run build` (bundler propio), `npm run test:unit` (Vitest), `npm run test:e2e` (Playwright) según lo definas en su `package.json`.
- `npm run home`: levanta el dashboard estático (`home/`) que consume `data/projects-tasks.json`.
- `npm run task:add`: asistente CLI interactivo para dar de alta tareas en `data/projects-tasks.json`.
- `npm run release:pm-modal`: script de publicación del paquete `pm-modal`.

## Dependency Management

- Al instalar dependencias, usa versiones fijas sin el prefijo `^` en `package.json`.

## Coding Style & Naming Conventions

- Formato: Prettier y ESLint se ejecutan vía `npm run format` y `npm run lint` (reglas definidas por cada paquete; preferir 2 espacios, comillas simples en JS/TS).
- Naming: usa nombres de paquete en kebab-case (`packages/mi-componente-lit`) y componentes LitElement en PascalCase (`MyComponent`).
- Archivos de tests en `__tests__/` o con sufijo `.spec.ts`/`.test.ts`.

## Testing Guidelines

- Unit tests: Vitest recomendado; ejecuta `npm run test:unit` desde el paquete o `npm run test` en raíz para todos.
- E2E/visual: Playwright soportado (ver scripts como referencia en `projects/ayuntamiento-de-belmontejo`); nombra specs con `.spec.ts`.
- Añade fixtures bajo `tests/fixtures` cuando sea necesario y documenta variables de entorno en el README del paquete.

## Commit & Pull Request Guidelines

- Commits: seguir convención convencional-changelog (ej. `feat:`, `fix:`, `chore:`); `npm run commit` usa Commitizen si está configurado en el paquete.
- PRs: incluye resumen claro, pasos de prueba, issues vinculadas y capturas si cambias UI; mantén cambios acotados a un paquete salvo refactors explícitos.

## Security & Configuration Tips

- No subas `.env` ni credenciales; usa `.env.example` como referencia cuando aplique.
- Revisa compatibilidad de Node (ver `.nvmrc` si existe en los paquetes) antes de publicar nuevas versiones.

## Gestión de tareas y horas

- Al empezar, identifica el proyecto y usa ese nombre en `project`.
- Busca si ya existe una tarea "En curso" para ese trabajo; si existe, registra horas y notas ahí.
- Si no existe, crea una nueva con `npm run task:add` (o edita a mano manteniendo `dd/mm/aaaa`, id incremental y mínimos: `status`, `startDate`, `hours`, `project`).
- Registra siempre la actividad en `data/projects-tasks.json` (estado, fechas, horas, notas, proyecto).
- Revisa regularmente los TODO/FIXME en el código (búsqueda de patrones `TODO`/`FIXME`) y recuerda planificar su resolución en próximas tareas.
