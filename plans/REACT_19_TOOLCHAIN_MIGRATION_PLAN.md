# Plan: React 19, `@sito/dashboard` 0.1.0 y actualización del toolchain

## Objetivo

Actualizar `@sito/dashboard-app` para consumir `@sito/dashboard@^0.1.0`, adoptar
React 19 y alinear progresivamente el toolchain con `@sito/dashboard` y
`@sito/ui`, sin mezclar todos los cambios en un único salto.

La migración se hará por checkpoints. El desarrollador ejecutará las
instalaciones y verificaciones de cada grupo antes de avanzar al siguiente.

## Restricciones de trabajo

- El agente no ejecutará scripts, instalaciones, builds, tests, lint ni
  Storybook.
- Los cambios serán pequeños y estarán separados por checkpoint.
- Si una verificación falla, no se avanzará al checkpoint siguiente hasta
  conocer el comando, el error completo y qué se estaba verificando.
- No se tocarán cambios locales ajenos a esta migración. En particular, se
  preservarán los cambios actuales de `Dialog.tsx` y `Dialog/types.ts`.
- No se editarán lockfiles manualmente. El desarrollador los regenerará con el
  package manager acordado.
- No se actualizarán dependencias propias de esta librería solo por igualarlas
  con otro paquete; cada actualización debe responder a React 19, compatibilidad
  del toolchain o mantenimiento demostrado.
- La librería seguirá siendo browser-only. Esta migración no añadirá SSR.

## Referencias confirmadas

- `@sito/dashboard@0.1.0`:
  - React y React DOM `19.2.7`.
  - Peer de React y React DOM `^19.0.0`.
  - Node `22.18.0`; engine `^22.13.0`.
  - pnpm `10.34.4`.
  - Vite `8.1.4`, TypeScript `7.0.2`, Storybook `10.4.6`.
  - Vitest `4.1.10`, jsdom `29.1.1`, Prettier `3.9.5`.
  - Oxlint type-aware y Knip.
- `@sito/ui@0.3.0` confirma el mismo núcleo de React, Vite, TypeScript,
  Storybook, Vitest, jsdom, Prettier y Oxlint.

## Estado al comenzar la migración de React

| Área            | Estado actual                         | Objetivo de referencia            |
| --------------- | ------------------------------------- | --------------------------------- |
| Package manager | pnpm `10.34.4` + `pnpm-lock.yaml`     | Completado                        |
| Node            | `.nvmrc` `22.18.0`                    | Completado; engine `^22.13.0`     |
| React           | `18.3.1`                              | `19.2.7`                          |
| React types     | `18.3.x`                              | `19.2.x`                          |
| Base library    | `@sito/dashboard@^0.0.87`             | `^0.1.0`                          |
| Testing Library | `16.3.0` / jest-dom `6.6.3`           | `16.3.2` / `6.9.1`                |
| Vitest          | `3.2.x`                               | `4.1.10`                          |
| Storybook       | paquetes `8.4.7` + runtime `8.6.18`   | grupo coherente `10.4.6`          |
| jsdom           | `26.1.0`                              | `29.1.1`                          |
| Vite            | `6.4.2`                               | `8.1.4`                           |
| React plugin    | `@vitejs/plugin-react-swc@3.7.2`      | `@vitejs/plugin-react@6.0.3`      |
| DTS plugin      | `4.5.4`                               | `5.0.3`                           |
| TypeScript      | `5.7.2`                               | `7.0.2`                           |
| Lint            | ESLint + typescript-eslint + Depcheck | Oxlint + Knip + Prettier separado |
| Output target   | ES2017                                | ES2020                            |

## Checkpoint 0: decisiones de base

- [x] Confirmar si esta librería también abandona npm y adopta pnpm `10.34.4`.
- [x] Confirmar Node `22.18.0` como versión local y CI.
- [x] Confirmar que el siguiente release de `@sito/dashboard-app` será `0.1.0`,
      ya que React 19 rompe la compatibilidad declarada con React 18.
- [x] Confirmar que `@sito/dashboard` y `@sito/ui` serán las referencias de
      versiones, sin copiar dependencias que esta librería no utiliza.
- [x] Mantener fuera del alcance los cambios locales de `Dialog`.

La adopción de pnpm quedó resuelta en el checkpoint 0:

- Se añadió `packageManager: "pnpm@10.34.4"`.
- `pnpm-lock.yaml` es la única fuente de verdad del árbol instalado.
- CI, Husky, documentación y comandos internos usan pnpm.
- CI instala con lockfile congelado y no lo regenera.

Verificación del desarrollador:

```sh
node --version
pnpm --version
```

## Checkpoint 1: Node 22 y package manager

- [x] Actualizar `.nvmrc` a `22.18.0`.
- [x] Añadir `engines.node: "^22.13.0"` al manifiesto.
- [x] Actualizar `scripts/check-docs.mjs` para validar correctamente una versión
      exacta de `.nvmrc`, sin producir referencias como `22.18.0.x`.
- [x] Aplicar la decisión de npm o pnpm del checkpoint 0.
- [x] Si se adopta pnpm, actualizar `.github/workflows/*`, `.husky/pre-commit`,
      el pull request template y la documentación de desarrollo.
- [x] Mantener los scripts actuales funcionalmente equivalentes durante este
      checkpoint; todavía no migrar ESLint ni TypeScript.

Verificación del desarrollador:

```sh
pnpm install
pnpm run docs:check
```

## Checkpoint 2: React 19 y `@sito/dashboard` 0.1.0

Actualizar como una unidad:

- `react`: `19.2.7`.
- `react-dom`: `19.2.7`.
- `@types/react`: `19.2.17`.
- `@types/react-dom`: `19.2.3`.
- Peers de React y React DOM: `^19.0.0`.
- `@sito/dashboard`: `^0.1.0`.

Trabajo de código ya identificado:

- [x] Inicializar explícitamente el ref de entidad de `usePutDialog` con
      `undefined` y reflejarlo en su tipo.
- [x] Inicializar explícitamente los refs de cierre de `usePostDialog` y
      `usePutDialog` con `undefined` y reflejarlo en sus tipos.
- [ ] Revisar de nuevo usos de refs, `ReactElement`, `JSX` y tests que clonen o
      inspeccionen elementos después de instalar los tipos de React 19.
- [x] Mantener el wrapper público de `IconButton` basado en FontAwesome.
- [x] No añadir `@sito/ui` directamente: llega como dependencia transitiva de
      `@sito/dashboard`.
- [x] No cambiar `theme.css` salvo que una verificación visual demuestre una
      variable sin mapear.

`@fortawesome/react-fontawesome@0.2.3` declara compatibilidad con React 19, pero
está obsoleto. Se actualiza a `3.4.0` y el peer público pasa a
`>=3.1.1 <4`, siguiendo la línea ya usada por `@sito/dashboard`.

Verificación del desarrollador:

```sh
pnpm install
pnpm run build
pnpm run test
```

No avanzar si el build o los tests fallan.

Estado: completado y verificado por el desarrollador.

## Checkpoint 3: actualizaciones sencillas

Actualizar sin cambiar todavía Vite, jsdom ni TypeScript:

- `@testing-library/react`: `16.3.2`.
- `@testing-library/jest-dom`: `6.9.1`.
- `vitest`: `4.1.10`.
- `prettier`: `3.9.5`.
- `@types/node`: una versión compatible con Node 22; no adoptar tipos de Node 26
  mientras el runtime objetivo siga siendo Node 22.

- [x] Revisar imports públicos actuales.
- [x] Mantener configuración y tests sin refactors no relacionados.
- [ ] Separar comprobación de formato y lint si el script actual dificulta
      identificar qué etapa falla.

Verificación del desarrollador:

```sh
pnpm install
pnpm run build
pnpm run test
pnpm run lint
```

Estado: completado y verificado por el desarrollador.

## Checkpoint 4: Storybook 10.4

Actualizar conjuntamente a `10.4.6`:

- `storybook`.
- `@storybook/react`.
- `@storybook/react-vite`.
- `@storybook/addon-docs`.
- `@storybook/addon-a11y`.

Trabajo:

- [x] Eliminar la mezcla actual de paquetes `8.4.7` con runtime `8.6.18`.
- [x] Retirar `addon-essentials` y `addon-interactions` si siguen sin tener uso
      real; actualmente solo aparecen en la configuración.
- [x] Basar `.storybook/main.ts` en la configuración ya resuelta de
      `@sito/dashboard`: ESM correcto, `mergeAlias` y filtrado de plugins de
      librería que no deben entrar en Storybook.
- [x] Corregir los aliases actuales de `layouts` y `views` para que apunten a
      `src/layouts` y `src/views`.
- [x] Evitar registrar Tailwind dos veces entre Vite y `viteFinal`.
- [x] Revisar `.storybook/preview.tsx` y los tipos `Meta` / `StoryObj` sin
      reescribir stories que ya sean compatibles.

Verificación del desarrollador:

```sh
pnpm install
pnpm run build-storybook
```

Estado: implementación estática completada; pendiente instalación y
verificación por el desarrollador.

## Checkpoint 5: jsdom 29

- [ ] Actualizar `jsdom` a `29.1.1` de forma aislada.
- [ ] Revisar los tests que dependen de portales, focus, geometría, scroll,
      observers y eventos del DOM.
- [ ] Prestar especial atención a Dialog, Tooltip, Notification, ToTop,
      PrettyGrid y hooks de scroll/online status.
- [ ] No mezclar correcciones de jsdom con el cambio posterior de TypeScript.

Verificación del desarrollador:

```sh
pnpm install
pnpm run test
```

## Checkpoint 6: Vite 8 y build de librería

Actualizar como una unidad:

- `vite`: `8.1.4`.
- Sustituir `@vitejs/plugin-react-swc` por `@vitejs/plugin-react@6.0.3`, siguiendo
  la referencia común de `@sito/dashboard` y `@sito/ui`.
- `vite-plugin-dts`: `5.0.3`.
- Alinear `tailwindcss` y `@tailwindcss/vite` en una versión 4.x cuyo peer
  admita Vite 8.

Trabajo:

- [ ] Establecer `build.target` y `tsconfig.target` en ES2020.
- [ ] Mantener el entrypoint, nombres de salida, CSS inyectado y exports
      actuales de `@sito/dashboard-app`.
- [ ] Externalizar `react/jsx-dev-runtime` además de los runtimes ya externos.
- [ ] Mantener `@sito/dashboard` externo.
- [ ] Mantener `vite-plugin-lib-inject-css`, salvo incompatibilidad demostrada.
- [ ] Revisar `vite.config.ts`, `tsconfig.node.json` y generación de
      declaraciones antes de tocar TypeScript.
- [ ] Confirmar que `dist/index.d.ts`, los bundles ESM/CJS y `theme.css` siguen
      coincidiendo con `package.json#exports`.

Verificación del desarrollador:

```sh
pnpm install
pnpm run build
pnpm run test
pnpm run build-storybook
```

## Checkpoint 7: TypeScript 7, Oxlint y Knip

- [ ] Actualizar TypeScript a `7.0.2`.
- [ ] Añadir `@typescript/typescript6` como fallback para la API JavaScript que
      necesita `vite-plugin-dts` / `unplugin-dts`.
- [ ] Cambiar `tsconfig.node.json` a `NodeNext` donde corresponda.
- [ ] Revisar aliases y tipos generados con TypeScript 7.
- [ ] Sustituir ESLint y typescript-eslint por Oxlint type-aware.
- [ ] Añadir Knip para análisis de dependencias y exports.
- [ ] Retirar Depcheck y sus excepciones una vez que Knip cubra el mismo
      contrato.
- [ ] Mantener Prettier como propietario exclusivo del formato.
- [ ] Separar scripts:
  - `lint`.
  - `lint:fix`.
  - `format`.
  - `format:check`.
  - `deps:check`.
  - `build`.
  - `test`.
- [ ] Añadir un script agregador que falle inmediatamente cuando falle una
      etapa.

Verificación del desarrollador:

```sh
pnpm install
pnpm run lint
pnpm run format:check
pnpm run deps:check
pnpm run build
pnpm run test
```

## Checkpoint 8: CI, documentación y release 0.1.0

- [ ] Actualizar CI a Node 22 y al package manager confirmado.
- [ ] Usar instalación con lockfile congelado; CI no debe borrar ni regenerar
      el lockfile.
- [ ] Actualizar README, AGENTS, `docs/CONSUMER_GUIDE.md`, comandos de desarrollo
      y checklist de pull request.
- [ ] Sincronizar todos los marcadores de `@sito/dashboard@^0.1.0`.
- [ ] Corregir upstream el README de `@sito/dashboard`, que todavía anuncia
      React 18 aunque su manifiesto 0.1.0 exige React 19.
- [ ] Añadir la entrada de changelog de `@sito/dashboard-app@0.1.0` desde el diff
      real de la migración.
- [ ] Cambiar la versión del paquete a `0.1.0` solo cuando los checkpoints
      anteriores estén verificados.
- [ ] Comprobar el contenido publicable y un consumidor React 19 antes de
      publicar.

Verificación final del desarrollador:

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run deps:check
pnpm run docs:check
pnpm run build
pnpm run test
pnpm run build-storybook
pnpm pack
```

## Dependencias que no se alinearán automáticamente

Se mantienen en sus líneas actuales salvo incompatibilidad concreta:

- `@tanstack/react-query`.
- `react-hook-form`.
- `@supabase/supabase-js`.
- FontAwesome.
- `@use-gesture/react`.
- `some-javascript-utils`.
- `vite-plugin-lib-inject-css`.
- Tailwind CSS 4, actualizando solo lo necesario para Vite 8.

## Orden de ejecución

```txt
Decisiones npm/pnpm + release
  -> Node 22 y package manager
  -> React 19 + @sito/dashboard 0.1.0
  -> actualizaciones sencillas
  -> Storybook 10.4
  -> jsdom 29
  -> Vite 8 + plugins + ES2020
  -> TypeScript 7 + Oxlint + Knip
  -> CI + documentación + release 0.1.0
```

Cada checkpoint debe quedar verificado por el desarrollador antes de iniciar el
siguiente.
