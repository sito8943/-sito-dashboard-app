# Plan Por Fases: @sito/dashboard-rest

## Resumen
- [ ] Separar la capa de datos REST y management general en un plan dedicado.
- [ ] Mantener el grafo objetivo: `types -> rest/supabase/ui -> app`.
- [ ] Cubrir clientes REST, auth REST y providers de management no exclusivos de Supabase.
- [ ] Evitar exportar componentes o hooks puramente de UI.

## Cambios De API Publica
1. [ ] Exportar clientes REST/core: `APIClient`, `AuthClient`, `BaseClient`, `IndexedDBClient`, `IManager`.
2. [ ] Exportar utilidades HTTP/query generales: `Methods`, `makeRequest`, `buildQueryUrl`, `parseQueries`, `HttpResponse`.
3. [ ] Exportar config de auth REST: `APIClientAuthConfig`.
4. [ ] Exportar providers/hooks de management REST:
   - [ ] `ManagerProvider`, `useManager`, `createQueryClient`.
   - [ ] `AuthProvider`, `useAuth`, `AuthContext`.
5. [ ] Exportar utilidades de sesion/local storage: `fromLocal`, `toLocal`, `removeFromLocal`.
6. [ ] No incluir APIs ni tipos exclusivos de Supabase en este plan.

## Fases De Implementacion
1. [ ] Fase 1 - Extraccion de clientes REST
   - [ ] Migrar `APIClient`, `AuthClient`, `BaseClient` e `IndexedDBClient` a `@sito/dashboard-rest`.
   - [ ] Mantener contratos publicos y generics para compatibilidad.
2. [ ] Fase 2 - Management providers REST
   - [ ] Migrar `ManagerProvider` y `AuthProvider` con sus contextos.
   - [ ] Mantener comportamiento actual de storage keys y refresh flow.
3. [ ] Fase 3 - Fronteras y dependencias
   - [ ] Reemplazar imports internos para depender de `@sito/dashboard-types`.
   - [ ] Eliminar dependencias a componentes/hooks de UI.
4. [ ] Fase 4 - Documentacion y migracion
   - [ ] Documentar setup REST e IndexedDB en este plan.
   - [ ] Referenciar `dashboard-data-supabase.md` para la variante Supabase.

## Plan De Pruebas
1. [ ] Ejecutar tests unitarios de `APIClient`, `AuthClient`, `BaseClient`, `IndexedDBClient`.
2. [ ] Ejecutar tests de `ManagerProvider` y `AuthProvider`.
3. [ ] Validar flujo de refresh token, retry 401 y mutex de refresh.
4. [ ] Confirmar que no se exportan tipos o providers exclusivos de Supabase.
5. [ ] Verificar compilacion consumiendo tipos solo desde `@sito/dashboard-types`.

## Supuestos y defaults
1. [ ] Node `20` y TypeScript `5.x` se mantienen como baseline.
2. [ ] `@sito/dashboard-types` se publica antes de esta capa.
3. [ ] La compatibilidad backward de la API REST es prioridad.
4. [ ] `@supabase/supabase-js` no debe figurar como dependencia obligatoria de `@sito/dashboard-rest`.
5. [ ] Todas las tareas quedan pendientes (`[ ]`) en esta etapa.
