# Plan Por Fases: @sito/dashboard-types

## Resumen

- [ ] Crear el paquete base de tipos compartidos para toda la suite.
- [ ] Mantener el grafo objetivo: `types -> rest/supabase/ui -> app`.
- [ ] Limitar el paquete a contratos de dominio y type guards, sin logica de red ni de UI.
- [ ] Excluir tipos exclusivos de Supabase del paquete `types`; esos viven en `dashboard-data-supabase.md`.
- [ ] No ejecutar implementacion funcional en este documento; solo definir el plan.

## Cambios De API Publica

1. [ ] Exportar DTOs base y auth: `BaseEntityDto`, `BaseCommonEntityDto`, `BaseFilterDto`, `SoftDeleteScope`, `DeleteDto`, `AuthDto`, `RegisterDto`, `SessionDto`, `RefreshDto`, `SignOutDto`, `BaseAuthDto`, `BaseRegisterDto`.
2. [ ] Exportar DTOs de importacion: `ImportDto`, `ImportPreviewDto`.
3. [ ] Exportar tipos de query: `QueryParam`, `QueryResult`, `RangeValue`.
4. [ ] Exportar tipos de navegacion/menu: `Path`, `Location`, `ViewPageType`, `NamedViewPageType`, `MenuItemType`, `SubMenuItemType`.
5. [ ] Exportar errores y guards: `ServiceError`, `FieldErrorTuple`, `ValidationError`, `HttpError`, `isValidationError`, `isHttpError`, `mapValidationErrors`.
6. [ ] Exportar notificaciones compartidas: `NotificationType`, `NotificationEnumType`.
7. [ ] No exportar tipos exclusivos de Supabase (por ejemplo `SupabaseSessionMapper`, `SupabaseSessionMapperOptions`, `SupabaseDataClientOptions`); esos se definen en `@sito/dashboard-supabase`.

## Fases De Implementacion

1. [ ] Fase 1 - Inventario y extraccion
   - [ ] Identificar fuentes actuales en `src/lib/entities`, `src/lib/errors.ts`, `src/lib/api/types.ts`, `src/lib/utils/navigation.ts`, `src/lib/Notification.ts`.
   - [ ] Clasificar contratos que son estrictamente de tipos y moverlos al nuevo paquete.
   - [ ] Revisar cualquier tipo exclusivo de Supabase y moverlo al plan `planning/dashboard-data-supabase.md`.
2. [ ] Fase 2 - Estructura y exports
   - [ ] Definir entrypoints y `exports` para consumo estable.
   - [ ] Mantener nombres publicos actuales para minimizar breaking changes.
3. [ ] Fase 3 - Adopcion en capas dependientes
   - [ ] Actualizar imports en `@sito/dashboard-rest`, `@sito/dashboard-supabase` y `@sito/dashboard-ui` para que consuman solo `@sito/dashboard-types`.
   - [ ] Eliminar imports residuales de tipos desde paquetes no base.
4. [ ] Fase 4 - Documentacion y versionado
   - [ ] Documentar contrato publico y reglas de uso.
   - [ ] Publicar primero `@sito/dashboard-types` para desbloquear el resto del split.

## Plan De Pruebas

1. [ ] Validar compilacion TypeScript del paquete sin dependencias a `fetch`, `localStorage`, React providers o componentes.
2. [ ] Crear/ajustar tests de type guards (`isValidationError`, `isHttpError`, `mapValidationErrors`).
3. [ ] Verificar que `@sito/dashboard-rest`, `@sito/dashboard-supabase` y `@sito/dashboard-ui` compilan importando tipos desde `@sito/dashboard-types`.
4. [ ] Confirmar estabilidad de nombres exportados frente a la API actual.

## Supuestos y defaults

1. [ ] Node `20` se mantiene como runtime objetivo, alineado con `.nvmrc`.
2. [ ] El paquete `types` no contiene runtime behavior de red, storage ni UI.
3. [ ] El split prioriza compatibilidad de nombres exportados para migracion incremental.
4. [ ] Todas las tareas del plan quedan pendientes (`[ ]`) en esta etapa.
