# Plan Por Fases: Soporte Supabase (CRUD + Auth) en `@sito/dashboard-app`

## Resumen

1. Objetivo: agregar un backend Supabase para que el consumidor elija entre REST (`BaseClient`), offline (`IndexedDBClient`) o Supabase.
2. Alcance confirmado: incluir datos + autenticación Supabase.
3. Decisiones confirmadas: usar `Provider` nuevo para auth Supabase y declarar `@supabase/supabase-js` como peer opcional.
4. Entrega de ejecución: crear `planning/supabase-phased-plan.md` con este contenido y luego implementar.
5. Requisito operativo: escribir tests como parte obligatoria de la implementación, pero sin ejecutar scripts automáticos durante esta etapa.

## Cambios De API Pública

1. Nuevo cliente de datos: `SupabaseDataClient<...>` con la misma superficie que `BaseClient`/`IndexedDBClient`:
   `insert`, `insertMany`, `update`, `get`, `getById`, `export`, `import`, `commonGet`, `softDelete`, `restore`.
2. Nuevo provider de entorno Supabase: `SupabaseManagerProvider` (incluye `QueryClientProvider` + contexto de cliente Supabase).
3. Nuevo provider de sesión: `SupabaseAuthProvider` (flujo auth Supabase).
4. Nuevo hook: `useSupabase()` para acceder al cliente Supabase desde contexto.
5. `useAuth` se mantiene como contrato de consumo; el flujo actual REST (`ManagerProvider` + `AuthProvider`) no cambia.

## Fases De Implementación

1. Fase 1: Contratos y dependencias

- Añadir `@supabase/supabase-js` como `peerDependency` opcional y `devDependency` para tests.
- Definir tipos utilitarios para mapear sesión Supabase a `SessionDto`.
- Definir opciones de cliente Supabase para columnas convencionales (`id`, `deletedAt`) con defaults.

2. Fase 2: Cliente de datos Supabase

- Implementar `SupabaseDataClient` con genéricos equivalentes a `BaseClient`.
- Implementar traducción de filtros existentes a query builder Supabase:
  primitivos (`eq`), arrays (`in`), rango `{start,end}` (`gte/lte`), objetos con `id`, y booleano `deletedAt` (nulo/no nulo).
- Implementar paginación y orden para devolver `QueryResult<TDto>` con shape idéntico al actual.
- Mantener semántica:
  `insertMany` devuelve el último item, `import(override=true)` usa `upsert`, `import(override=false)` usa `insert` y propaga conflicto.

3. Fase 3: Auth Supabase con provider nuevo

- Crear `SupabaseManagerProvider` para contexto Supabase + React Query.
- Crear `SupabaseAuthProvider` con el mismo contrato funcional que hoy consume `useAuth`:
  `account`, `logUser`, `logoutUser`, `logUserFromLocal`, `isInGuestMode`, `setGuestMode`.
- Implementar sincronización de sesión con `supabase.auth.getSession()` al montar y `onAuthStateChange` para mantener estado/local storage consistente.
- Mantener `AuthProvider` actual sin cambios para backend REST.

4. Fase 4: Documentación y recetas

- Documentar instalación y setup Supabase (nuevo bloque de providers y ejemplo de cliente por entidad).
- Documentar estrategia de elección de backend por app consumidora (REST vs IndexedDB vs Supabase).
- Añadir notas de compatibilidad: flujo REST intacto y migración incremental por entidad.

5. Fase 5: Testing y validación final

- Tests unitarios de `SupabaseDataClient`: CRUD, filtros, orden/paginación, import/export, soft delete/restore.
- Tests de providers Supabase: bootstrap de sesión, cambios de estado auth, logout, guest mode.
- No correr scripts (`npm run test`, `npm run build`) en esta etapa; dejar los tests implementados y listos para ejecución posterior.

## Plan De Pruebas

1. `get` con filtros combinados (array + rango + objeto con `id`) devuelve `QueryResult` correcto.
2. `deletedAt: true/false` aplica filtro de borrado lógico esperado.
3. `import` con `override=false` falla ante duplicados; con `override=true` hace upsert.
4. `SupabaseAuthProvider` inicializa `account` desde sesión activa.
5. `SupabaseAuthProvider.logoutUser` invoca `signOut` y limpia estado/keys.
6. Flujo REST existente sigue pasando tests sin cambios de setup.

## Supuestos y defaults

1. Las tablas Supabase usan `id` como PK y `deletedAt` nullable para soft delete (configurable en opciones del cliente).
2. El contrato de retorno hacia UI se mantiene en tipos actuales (`SessionDto`, `QueryResult`, errores con `status/message`).
3. No se elimina ni rompe la ruta REST existente; Supabase entra como capacidad adicional.
4. El primer release de Supabase prioriza paridad funcional de clientes y providers, no features avanzadas de RLS/policies guiadas.
