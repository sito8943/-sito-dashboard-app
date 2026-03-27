# Plan De Ficheros En `planning/` Para Separar `UI`, `REST`, `Supabase`, `Types` y `App`

## Resumen

- Crear 5 ficheros de plan en `planning/`, todos con: `Resumen`, `Cambios De API Publica`, `Fases De Implementacion`, `Plan De Pruebas`, `Supuestos y defaults`.
- Arquitectura objetivo obligatoria: `@sito/dashboard-types` como base, luego `@sito/dashboard-rest`, `@sito/dashboard-supabase` y `@sito/dashboard-ui`, y finalmente `@sito/dashboard-app` como fachada todo en uno.
- Separacion por importacion: el consumidor decide usar `@sito/dashboard-rest` o `@sito/dashboard-supabase`.
- Regla de dependencias: `@supabase/supabase-js` es requerido en `@sito/dashboard-supabase`.

## Ficheros De Plan

1. `dashboard-types-phased-plan.md`
2. `dashboard-data-rest.md`
3. `dashboard-data-supabase.md`
4. `dashboard-ui-phased-plan.md`
5. `dashboard-app-phased-plan.md`

## Cambios De API Publica (Consolidados)

1. Nuevo grafo de paquetes: `types -> rest/supabase/ui -> app`.
2. `@sito/dashboard-rest` concentra API REST + auth/management general.
3. `@sito/dashboard-supabase` concentra cliente, auth, providers y tipos exclusivos de Supabase.
4. `@sito/dashboard-ui` queda orientado a interfaz y desacoplado de capas de datos.
5. `@sito/dashboard-app` reexporta `ui + rest + supabase + types` para compatibilidad y uso todo en uno.

## Politica De Dependencias

1. `@supabase/supabase-js` se define como dependencia requerida en `@sito/dashboard-supabase`.
2. `@supabase/supabase-js` no debe ser dependencia obligatoria en `@sito/dashboard-rest`.
3. Los tipos comunes se mantienen en `@sito/dashboard-types`; los tipos exclusivos de Supabase viven en `@sito/dashboard-supabase`.

## Plan De Pruebas

1. Verificar que existen y son consistentes los 5 planes.
2. Verificar que todos referencian el grafo `types -> rest/supabase/ui -> app`.
3. Verificar que no hay tipos exclusivos de Supabase en `dashboard-types-phased-plan.md`.
4. Verificar que `dashboard-data-supabase.md` incluye la dependencia requerida `@supabase/supabase-js`.
5. Verificar que `dashboard-data-rest.md` no obliga Supabase.

## Supuestos y defaults

1. Node `20` alineado con `.nvmrc`.
2. Todos los planes quedan en estado pendiente (`[ ]`) hasta implementacion.
3. Se mantiene compatibilidad incremental mediante `@sito/dashboard-app`.
4. Orden de publicacion: `types`, luego `rest/supabase/ui`, luego `app`.
