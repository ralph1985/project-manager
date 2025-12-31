# project-manager

Monorepo gestionado con Lerna y npm workspaces para empaquetar componentes (LitElement) en `packages/` y alojar proyectos separados en `projects/`.

## Estructura

- `packages/`: paquetes compartidos (componentes LitElement) versionados con Lerna.
- `projects/`: proyectos con repos propios; queda fuera de los workspaces y está ignorado en Git de este repo.
- `projects/ayuntamiento-de-belmontejo`: sitio Astro existente con su propio repositorio Git y gestión independiente.

## Comandos principales (desde la raíz)

- `npm install`: instala dependencias de todos los workspaces en `packages/` (genera un único package-lock en la raíz).
- `npm run dev`: arranca los entornos de desarrollo de todos los paquetes en paralelo (solo afecta a `packages/`).
- `npm run build | lint | format | test | test:e2e`: ejecuta las tareas correspondientes en los paquetes.

## Notas

- `projects/` está git-ignorado en este repo para no versionar proyectos con repos propios; cada proyecto allí mantiene su propio `.git` y lockfile.
- Hay un dashboard estático en `home/` que lee `data/projects-tasks.json`; ejecútalo con `npm run home` para ver el seguimiento de tareas/horas. Los filtros admiten selección múltiple.
- El panel `TickTick` del dashboard usa `TICKTICK_ACCESS_TOKEN` (scope `tasks:read`) y carga datos en tiempo real desde la API.
- El resumen vive en `home/index.html` y el detalle por proyecto en `home/project.html`.
- Los to-dos por proyecto se leen desde `data/project-todos.json` (array con `project`, `title`, `dueDate` opcional).
