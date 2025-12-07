# @project-manager/pm-modal

Primer componente compartido basado en LitElement. Define el elemento `<pm-modal>` para mostrar un diálogo simple con estilos suaves y eventos `pm-open`/`pm-close`.

## Scripts

- `npm run build`: compila los fuentes TypeScript en `dist/`.
- `npm run dev`: compila en watch mode mientras desarrollas.

## Uso

1) Instala la dependencia dentro de tu proyecto (ejemplo usando ruta local):

```bash
npm install ../packages/pm-modal
```

2) Importa el componente una vez (por ejemplo en tu entrypoint o página):

```ts
import '@project-manager/pm-modal';
```

3) Pinta el elemento en tu HTML:

```html
<pm-modal heading="Aviso" open>
  Contenido del modal
  <button slot="footer">Aceptar</button>
</pm-modal>
```

Atributos:

- `open`: muestra/oculta el modal (también puedes llamar a `openModal()`/`close()`).
- `heading`: título del diálogo.
- `close-on-backdrop`: permite cerrar al pulsar fuera (true por defecto).
