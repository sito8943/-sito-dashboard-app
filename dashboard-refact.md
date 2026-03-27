# Plan de Refactor Documental (`@sito/dashboard-app`)

## Objetivo

Eliminar desalineaciones entre la documentación de `.sito` (upstream `@sito/dashboard`) y la documentación oficial del paquete publicado por este repo (`@sito/dashboard-app`), dejando una guía única, consistente y verificable.

## Alcance

- `.sito/README.md`
- `.sito/usage-guide.md`
- `.sito/style-customization.md`
- `.sito/translations-reference.md`
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CHANGELOG.md` (si cambia comportamiento/documentación pública)

## Decisión fijada

`.sito` se considera documentación interna de referencia (equipo + agentes), basada en upstream `@sito/dashboard`.  
La documentación canónica de consumo para terceros de este repositorio es `README.md` + `AGENTS.md` (`@sito/dashboard-app`).

## Problemas a resolver

- `.sito` documenta `@sito/dashboard`, mientras el repo publica `@sito/dashboard-app`.
- `CLAUDE.md` referencia un archivo inexistente (`.sito/dashboard.md`).
- Hay mezcla de setup de providers (`TranslationProvider`/`TableOptionsProvider` vs `ConfigProvider`/`ManagerProvider`/`AuthProvider`...).
- Ejemplos de `IconButton` conflictivos (`ReactNode` vs `IconDefinition` en `dashboard-app`).
- Falta una política automática para detectar desalineaciones futuras.

## Estrategia

1. Definir una fuente de verdad por tipo de documentación.
2. Separar claramente docs de upstream (`@sito/dashboard`) y docs de consumo del paquete (`@sito/dashboard-app`).
3. Arreglar referencias rotas y ejemplos incompatibles.
4. Introducir validaciones automáticas (enlace roto + reglas mínimas de coherencia).
5. Cerrar con checklist de aceptación y mantenimiento.

---

## Checklist de ejecución

### Fase 1: Decisión de modelo documental

- [x] Confirmar decisión: mantener `.sito` como referencia interna/upstream (`@sito/dashboard`), no como guía pública principal del repo.
- [x] Documentar esa decisión en `README.md` y `CLAUDE.md` en una sección corta de gobernanza docs.

### Fase 2: Reparar referencias y rutas

- [x] Corregir referencia rota en `CLAUDE.md`:
  - [x] Cambiar `@.sito/dashboard.md` por archivo real (`@.sito/README.md`).
- [x] Verificar que todos los enlaces internos de `.sito/*.md` apuntan a rutas existentes.
- [x] Decidir si `.sito/docs/` se usa o se elimina para evitar estructura “vacía/confusa”.
  - [x] Se elimina `.sito/docs/` por estar vacía y no versionada.

### Fase 3: Alineación de contenido por paquete

- [x] En `.sito/*`, añadir encabezado explícito: “Documentación upstream de `@sito/dashboard`”.
- [x] En `README.md` y `AGENTS.md`, reforzar que la guía principal de consumo es `@sito/dashboard-app`.
- [x] Añadir tabla de “cuándo usar cada doc”:
  - [x] `README.md`/`AGENTS.md` -> consumo `@sito/dashboard-app`
  - [x] `.sito/*` -> referencia de comportamiento heredado/re-exportado de `@sito/dashboard`

### Fase 4: Normalizar setup de providers

- [x] En `README.md` y `AGENTS.md`, mantener un único orden canónico de providers para `dashboard-app`.
- [x] En `.sito/usage-guide.md`, incluir nota de compatibilidad:
  - [x] Si se consume vía `@sito/dashboard-app`, seguir setup de `README.md` del repo.
  - [x] Si se consume `@sito/dashboard` directo, usar `TranslationProvider` + `TableOptionsProvider`.
- [x] Verificar que no quedan snippets contradictorios sin contexto.

### Fase 5: Unificar contrato de `IconButton`

- [x] En docs de `dashboard-app`, asegurar que `IconButton` se documenta con `IconDefinition`.
- [x] En `.sito`, dejar claro que ejemplos con `ReactNode` aplican al upstream `@sito/dashboard`.
- [x] Agregar nota comparativa corta:
  - [x] `@sito/dashboard` -> `icon: ReactNode`
  - [x] `@sito/dashboard-app` -> `icon: IconDefinition` (wrapper FontAwesome)

### Fase 6: Verificación técnica/documental

- [x] Ejecutar comprobación de enlaces rotos en Markdown.
- [x] Ejecutar grep de coherencia mínima:
  - [x] No debe quedar referencia a `.sito/dashboard.md` si no existe.
  - [x] No debe haber ejemplos de instalación de `@sito/dashboard` presentados como guía principal del repo.
  - [x] No debe haber mezcla de providers sin indicar contexto (`dashboard` vs `dashboard-app`).
- [x] Revisar que Node runtime documentado sigue alineado con `.nvmrc`.
- [x] Añadir automatización (`npm run docs:check` + CI) para que estas validaciones se ejecuten en cada PR/push.

### Fase 7: Cierre y mantenimiento

- [x] Actualizar `CHANGELOG.md` si se considera cambio de documentación pública.
- [x] Añadir sección “Policy de docs” en `CLAUDE.md`:
  - [x] Fuente de verdad.
  - [x] Qué ficheros deben actualizarse en cada cambio de API.
- [x] Añadir checklist PR (o plantilla) para evitar regresiones de documentación.

---

## Definición de “hecho” (DoD)

- [x] No hay enlaces rotos en docs.
- [x] No hay contradicciones en instalación, providers o `IconButton`.
- [x] Se diferencia explícitamente `@sito/dashboard` vs `@sito/dashboard-app`.
- [x] `CLAUDE.md`, `AGENTS.md`, `README.md` y `.sito/*` tienen propósito claro y no ambiguo.
- [x] El equipo puede responder “qué doc manda para cada caso” en menos de 30 segundos.

## Riesgos y mitigaciones

- Riesgo: sobrecorregir `.sito` y perder valor como referencia upstream.  
  Mitigación: marcar `.sito` como upstream y evitar duplicar toda la guía en dos sitios.

- Riesgo: futuros cambios de API vuelven a desalinear docs.  
  Mitigación: checklist obligatorio en PR + validación automática de enlaces y patrones críticos.

## Orden recomendado de implementación

1. Corregir `CLAUDE.md` (bloqueador de referencia rota).
2. Definir fuente de verdad y scope de `.sito`.
3. Alinear providers e `IconButton` en todos los snippets.
4. Añadir validaciones automáticas y checklist PR.
5. Cerrar con revisión final + changelog (si aplica).
