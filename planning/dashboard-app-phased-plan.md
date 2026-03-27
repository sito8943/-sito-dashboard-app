# Plan Por Fases: @sito/dashboard-app (todo en uno)

## Resumen

- [ ] Mantener `@sito/dashboard-app` como fachada integral para consumidores que prefieren una sola dependencia.
- [ ] Mantener el grafo objetivo: `types -> rest/supabase/ui -> app`.
- [ ] Reexportar `@sito/dashboard-ui`, `@sito/dashboard-rest`, `@sito/dashboard-supabase`, `@sito/dashboard-types` y `@sito/dashboard`.
- [ ] Asegurar compatibilidad backward con la API actual durante la migracion.

## Cambios De API Publica

1. [ ] Re-export completo de simbolos de `@sito/dashboard-ui`, `@sito/dashboard-rest`, `@sito/dashboard-supabase`, `@sito/dashboard-types` y `@sito/dashboard`.
2. [ ] Mantener override de `IconButton` (implementacion local FontAwesome) como contrato de `@sito/dashboard-app`.
3. [ ] Mantener hooks hibridos UI+data en `app`:
   - [ ] `usePostForm`, `useFormDialog`, `usePostDialog`, `usePutDialog`.
   - [ ] `useDeleteDialog`, `useRestoreDialog`, `useImportDialog`.
   - [ ] `useExportActionMutate`, `useConfirmationForm`.
4. [ ] Mantener wrappers de compatibilidad:
   - [ ] `Drawer` de `app` preserva API legacy y mapea a `Drawer` de `ui` usando `useAuth`.
   - [ ] `Onboarding` de `app` preserva API legacy e inyecta `setGuestMode` a `Onboarding` de `ui`.

## Fases De Implementacion

1. [ ] Fase 1 - Paquete fachada
   - [ ] Crear entrypoints de re-export y preservar la superficie publica actual.
   - [ ] Verificar que consumers actuales no requieran cambios inmediatos.
2. [ ] Fase 2 - Wrappers legacy
   - [ ] Implementar wrappers para `Drawer` y `Onboarding` que absorban cambios de interfaz de `ui`.
   - [ ] Mantener comportamientos existentes en auth/guest mode.
3. [ ] Fase 3 - Hooks hibridos
   - [ ] Consolidar hooks que combinan `react-query`, componentes y notificaciones en `@sito/dashboard-app`.
   - [ ] Evitar duplicacion con `ui` y `data`.
4. [ ] Fase 4 - Migracion y documentacion
   - [ ] Añadir deprecations/documentacion para migrar a imports directos `ui/data/types`.
   - [ ] Definir estrategia de transicion por versiones.

## Plan De Pruebas

1. [ ] Verificar compatibilidad de imports legacy desde `@sito/dashboard-app`.
2. [ ] Ejecutar pruebas de wrappers `Drawer`/`Onboarding` en escenarios con auth y guest mode.
3. [ ] Validar que hooks hibridos siguen funcionando con providers reexportados.
4. [ ] Confirmar que la fachada respeta el orden de providers documentado.
5. [ ] Ejecutar smoke test de una app consumidora en modo todo-en-uno.

## Supuestos y defaults

1. [ ] `@sito/dashboard-app` seguira existiendo como paquete de conveniencia y compatibilidad.
2. [ ] `@sito/dashboard-types`, `@sito/dashboard-rest`, `@sito/dashboard-supabase` y `@sito/dashboard-ui` se publicaran antes o junto a la nueva version de `app`.
3. [ ] El override de `IconButton` se mantiene mientras siga siendo parte del contrato publico.
4. [ ] Todas las tareas quedan pendientes (`[ ]`) en esta etapa.
