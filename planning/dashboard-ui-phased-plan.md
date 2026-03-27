# Plan Por Fases: @sito/dashboard-ui

## Resumen

- [ ] Consolidar componentes, providers y hooks de interfaz en un paquete dedicado.
- [ ] Mantener el grafo objetivo: `types -> rest/supabase/ui -> app`.
- [ ] Desacoplar la UI de responsabilidades de auth/session de la capa data.
- [ ] Mantener extensibilidad de componentes y contratos de uso actuales.

## Cambios De API Publica

1. [ ] Exportar componentes actuales de UI (por ejemplo: `Page`, `PageHeader`, `Dialog`, `FormDialog`, `ImportDialog`, `PrettyGrid`, `Navbar`, `Drawer`, `Onboarding`, `TabsLayout`, `ToTop`, `Error`, `Empty`, `Loading`, `Notification`, `IconButton`).
2. [ ] Exportar providers de UI: `ConfigProvider`, `NotificationProvider`, `DrawerMenuProvider`, `NavbarProvider`.
3. [ ] Exportar hooks UI y de composicion visual: `useScrollTrigger`, `useTimeAge`, `useDialog`, hooks de actions.
4. [ ] Exportar utilidades UI: `date`, `os`, `enumToKeyValueArray`.
5. [ ] Aplicar cambios de interfaz para desacople de auth:
   - [ ] `Drawer` agrega `isLoggedIn?: boolean` y deja de leer `useAuth` internamente.
   - [ ] `Onboarding` agrega `setGuestMode?: (value: boolean) => void` y deja de depender de `useAuth` internamente.

## Fases De Implementacion

1. [ ] Fase 1 - Extraccion de UI
   - [ ] Mover `src/components/**`, providers de UI y hooks visuales/composicionales.
   - [ ] Mantener estilos y contratos visuales actuales.
2. [ ] Fase 2 - Desacople de data/auth
   - [ ] Eliminar imports directos desde capa data en componentes UI.
   - [ ] Reemplazar dependencias de auth por props/control externo donde aplique.
3. [ ] Fase 3 - Ajustes de API y docs
   - [ ] Documentar los nuevos props de `Drawer` y `Onboarding`.
   - [ ] Confirmar que la API UI queda independiente de management/auth.
4. [ ] Fase 4 - Integracion con fachada
   - [ ] Garantizar que `@sito/dashboard-app` pueda envolver esta UI con compatibilidad legacy.

## Plan De Pruebas

1. [ ] Ejecutar tests de componentes con foco en `Drawer` y `Onboarding` tras el desacople.
2. [ ] Verificar rendering y comportamiento de providers de UI sin `dashboard-rest` ni `dashboard-supabase`.
3. [ ] Confirmar que hooks UI no dependen de clientes/API providers.
4. [ ] Validar compilacion del paquete importando contratos desde `@sito/dashboard-types`.
5. [ ] Smoke test de componentes principales en Storybook o entorno equivalente.

## Supuestos y defaults

1. [ ] El paquete UI puede depender de React, `@sito/dashboard` y `@sito/dashboard-types`.
2. [ ] Providers de management (`Manager/Auth/Supabase`) no forman parte de `dashboard-ui`.
3. [ ] Los cambios de interfaz en `Drawer` y `Onboarding` se cubren con wrappers en `dashboard-app`.
4. [ ] Todas las tareas quedan pendientes (`[ ]`) en esta etapa.
