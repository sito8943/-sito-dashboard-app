# Plan Por Fases: @sito/dashboard-supabase

## Resumen

- [ ] Definir la capa de datos y auth para Supabase como plan separado del flujo REST.
- [ ] Mantener el grafo objetivo: `types -> rest/supabase/ui -> app`.
- [ ] Concentrar en este plan los contratos, clientes y providers exclusivos de Supabase.
- [ ] Evitar fuga de tipos Supabase hacia `@sito/dashboard-types`.

## Cambios De API Publica

1. [ ] Exportar cliente y opciones Supabase:
   - [ ] `SupabaseDataClient`.
   - [ ] `SupabaseDataClientOptions`.
2. [ ] Exportar mapping/auth utilities de Supabase:
   - [ ] `mapSupabaseSessionToSessionDto`.
   - [ ] `SupabaseSessionMapper`.
   - [ ] `SupabaseSessionMapperOptions`.
3. [ ] Exportar providers/hooks exclusivos de Supabase:
   - [ ] `SupabaseManagerProvider`, `useSupabase`.
   - [ ] `SupabaseAuthProvider`.
4. [ ] Consumir `SessionDto`, `BaseEntityDto`, `BaseFilterDto` y demas contratos comunes desde `@sito/dashboard-types`.
5. [ ] Mover cualquier tipo exclusivo de Supabase fuera de `dashboard-types-phased-plan.md` hacia este plan.

## Fases De Implementacion

1. [ ] Fase 1 - Cliente Supabase
   - [ ] Migrar `SupabaseDataClient` y su tipado asociado.
   - [ ] Mantener paridad funcional con `BaseClient` (CRUD, import/export, soft delete/restore, filtros).
2. [ ] Fase 2 - Auth/mapper Supabase
   - [ ] Migrar `supabaseAuth.ts` (`mapSupabaseSessionToSessionDto` y tipos asociados).
   - [ ] Definir claramente que estos tipos son exclusivos de `dashboard-supabase`.
3. [ ] Fase 3 - Providers Supabase
   - [ ] Migrar `SupabaseManagerProvider`, `useSupabase`, `SupabaseAuthProvider` y contextos.
   - [ ] Mantener contrato funcional de `useAuth` para compatibilidad en consumo.
4. [ ] Fase 4 - Documentacion y coexistencia con REST
   - [ ] Documentar coexistencia REST/Supabase en apps consumidoras.
   - [ ] Referenciar `dashboard-data-rest.md` para capacidades no exclusivas de Supabase.

## Plan De Pruebas

1. [ ] Ejecutar tests unitarios de `SupabaseDataClient` (CRUD, filtros, orden, paginacion, import/export).
2. [ ] Ejecutar tests de `SupabaseAuthProvider` y `SupabaseManagerProvider`.
3. [ ] Verificar mapeo estable `Session -> SessionDto` con `mapSupabaseSessionToSessionDto`.
4. [ ] Confirmar que tipos exclusivos de Supabase no se listan en `@sito/dashboard-types`.
5. [ ] Validar compilacion de la variante Supabase dependiendo de `@sito/dashboard-types` para contratos comunes.

## Supuestos y defaults

1. [ ] `@supabase/supabase-js` es requerido en `@sito/dashboard-supabase` (no opcional).
2. [ ] El plan define `@supabase/supabase-js` como dependencia obligatoria del paquete Supabase y no como peer opcional.
3. [ ] Los tipos comunes se mantienen en `@sito/dashboard-types`; los tipos Supabase viven en `@sito/dashboard-supabase`.
4. [ ] La migracion puede ser incremental por entidad y por provider.
5. [ ] Todas las tareas quedan pendientes (`[ ]`) en esta etapa.
