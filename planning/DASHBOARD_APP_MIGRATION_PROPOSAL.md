# Propuesta de Migración a `@sito/dashboard-app`

Fecha: 2026-05-04  
Última actualización: 2026-05-11  
Apps analizadas: `period-calendar`, `wallet`, `notes`

## 1. Objetivo

Extraer a `@sito/dashboard-app` piezas transversales (no de dominio) que hoy están repetidas en varias apps, para reducir duplicación y facilitar mantenimiento.

## 2. Criterio de migración

Una pieza se migra si cumple todo:

1. Existe en 2+ apps con implementación muy similar.
2. No depende del dominio de negocio (periodos, transacciones, notas).
3. Puede configurarse por props/options sin romper compatibilidad.
4. Aporta mantenimiento centralizado real.

## 3. Qué migrar (priorizado)

## P0 (alto impacto / bajo riesgo)

### 3.1 `useOnlineStatus` + `OfflineBanner`

Problema original:

1. `wallet` y `notes` repiten hooks/infra de conectividad.
2. El banner offline es UI transversal.

Propuesta en librería:

1. `useOnlineStatus(options?)`
2. `OfflineBanner` desacoplado del dominio

API mínima sugerida:

```ts
export type OnlineStatus = {
  isOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
};

export type UseOnlineStatusOptions = {
  checkIntervalMs?: number;
  probeUrl?: string;
  timeoutMs?: number;
};

export function useOnlineStatus(options?: UseOnlineStatusOptions): OnlineStatus;

export type OfflineBannerProps = {
  isOnline?: boolean;
  message?: string;
  className?: string;
};
```

Estado actual (2026-05-11):

1. ✅ `useOnlineStatus` y `useOnlineStatusSnapshot` implementados y exportados.
2. ✅ `OfflineBanner` implementado, exportado y en uso.
3. ✅ Cobertura de tests unitarios para hook y componente.

### 3.2 Helper genérico de `menuMap` con feature flags

Problema original:

1. Las 3 apps repiten filtrado por feature flags.
2. También repiten cleanup de dividers consecutivos.

Propuesta en librería:

1. `filterMenuByFeatureFlags(items, isFeatureEnabled, dependencies)`
2. `normalizeMenuDividers(items)`

API mínima sugerida:

```ts
type FeatureEnabledFn<K extends string> = (key: K) => boolean;

type MenuItem<K extends string> = {
  type?: "divider";
  page?: string;
  [key: string]: unknown;
};

export function filterMenuByFeatureFlags<
  Item extends MenuItem<FeatureKey>,
  FeatureKey extends string,
>(
  items: Item[],
  isFeatureEnabled: FeatureEnabledFn<FeatureKey>,
  dependencies: Partial<Record<NonNullable<Item["page"]>, FeatureKey>>,
): Item[];

export function normalizeMenuDividers<Item extends { type?: "divider" }>(
  items: Item[],
): Item[];
```

Estado actual (2026-05-11):

1. ✅ `filterMenuByFeatureFlags` implementado y exportado.
2. ✅ `normalizeMenuDividers` implementado y exportado.
3. ✅ Tests unitarios para filtros y normalización de dividers.

## P1 (alto valor / riesgo medio)

### 3.3 Composer base de providers

Problema original:

1. `wallet` y `notes` tienen casi el mismo árbol de providers.
2. `period-calendar` comparte parte del stack (`Notification`, `Translation`, `FeatureFlags`), con otra estrategia de auth.

Propuesta en librería:

1. `createAppProviders(config)` o componente `AppProviders`.
2. Variantes configurables para:
3. `AuthProvider` (activable/desactivable)
4. `FeatureFlagsProvider` custom
5. `OfflineSyncProvider` opcional
6. Wrapper custom por app para casos especiales

Objetivo:

1. Compartir orden y wiring base.
2. Permitir inyectar providers propios sin acoplar dominio.

Estado actual (`0.0.74`):

1. ✅ `AppProviders` implementado con orden base (`Config -> Manager -> Auth -> Notification -> Drawer`).
2. ✅ `createAppProviders(config)` implementado para factories preconfiguradas.
3. ✅ `AuthProvider` configurable y desactivable con `auth={false}`.
4. ✅ Slots para `FeatureFlagsProvider`, `OfflineSyncProvider` y `appWrapperProvider`.
5. ✅ Tests unitarios añadidos para composición base y variantes opcionales.
6. ✅ `AppProviders` adoptado y funcional en las apps migradas.
7. ✅ Helpers/slots de offline integrados en el wiring actual de apps.

## P2 (evaluar según cobertura existente)

### 3.4 UI genérica repetida entre `wallet` y `notes`

Piezas candidatas:

1. `Search` wrapper genérico
2. `Tutorial` base
3. `Card`/`Accordion` si su contrato visual ya es estable

Condición:

1. Mover solo si no rompe personalizaciones visuales actuales.

Resultado de revisión Fase 4.1 (2026-05-11):

1. `Search` wrapper genérico: ❌ no migrar como componente nuevo por ahora.
2. Se mantiene el contrato actual de extensión (`ConfigProvider.searchComponent`) y uso desde `Navbar`.
3. `Tutorial` base: ✅ usar `Onboarding` + `TabsLayout` como base compartida; no crear otro componente paralelo.
4. `Card`/`Accordion`: ⏸️ posponer migración hasta tener contrato visual estable en 2+ apps.
5. Decisión técnica: evitar sobre-generalización de UI visualmente sensible en esta fase.

## 4. Qué NO migrar

1. Vistas de negocio: `PeriodLog`, `DailyLog`, `Transactions`, `Notes`, etc.
2. `routes` concretas por app y contenido final de `menuMap`.
3. API clients y entidades de dominio (`lib/api`, `lib/entities` por app).
4. Lógica de negocio de cada vertical.

## 5. Plan de rollout (actualizado)

## Fase 1 (completada)

1. Extraer `useOnlineStatus` + `OfflineBanner`.
2. Publicar versión menor de `@sito/dashboard-app`.
3. Migrar `notes` y `wallet` primero.

## Fase 2 (completada)

1. Extraer helpers de menú con feature flags.
2. Migrar `menuMap` en las 3 apps manteniendo comportamiento.

## Fase 3 (completada)

1. Introducir composer de providers.
2. Adoptar en apps consumidoras.
3. Confirmar uso funcional de `AppProviders` y wiring offline/helper.

## Fase 4 (en progreso)

1. ✅ Revisar componentes UI genéricos.
2. ⏳ Mover solo lo que tenga contrato estable y pruebas.

Detalle de cierre Fase 4.1:

1. `Search`: se estandariza por contrato de `searchComponent`, sin wrapper nuevo.
2. `Tutorial`: se estandariza con `Onboarding` (pasos estructurados) y `TabsLayout`.
3. `Card/Accordion`: quedan fuera de esta iteración, pendientes de convergencia visual.

## Fase 5 (pendiente)

1. Medir y documentar reducción de duplicación app por app (antes/después).
2. Cerrar deprecaciones de utilidades locales duplicadas.
3. Publicar changelog final de migración y guía corta de limpieza.

## 6. Criterios de aceptación

1. No hay regresiones funcionales en navegación, auth u offline.
2. Las 3 apps compilan y renderizan igual en rutas equivalentes.
3. Se elimina duplicación real de código (medible por archivos borrados/locales simplificados).
4. Nuevas APIs en `@sito/dashboard-app` tienen tests unitarios.
5. Changelog documenta breaking/non-breaking changes.

## 7. Riesgos y mitigación

Riesgos:

1. Sobre-generalización prematura.
2. Acoplar librería a detalles de una app.
3. Romper comportamiento existente por cambios de defaults.

Mitigación:

1. Empezar por P0.
2. Mantener APIs pequeñas y explícitas.
3. Migrar app por app con feature branch y smoke tests manuales.

## 8. Checklist para Codex de la librería

1. ✅ Crear módulos P0 (`useOnlineStatus`, `OfflineBanner`, helpers de menú).
2. ✅ Añadir tests unitarios para casos edge (online/offline intermitente, dividers extremos).
3. ✅ Publicar release con piezas P0/P1.
4. ✅ Integrar y validar en apps consumidoras con `AppProviders` funcional.
5. ⏳ Definir y ejecutar plan de deprecación de utilidades locales repetidas.
