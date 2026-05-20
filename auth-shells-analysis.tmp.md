# Auth Visual Shells Analysis

Contexto: comparativa entre `wallet` y `period-calendar` para decidir si tiene sentido extraer shells visuales compartidos de auth en `@sito/dashboard-app`.

## Conclusión

Sí hay duplicación real, pero principalmente en la capa visual y de composición. No conviene extraer pantallas completas `SignIn`, `SignUp`, `UpdatePassword` o `ConfirmEmailSuccess` con lógica incluida, porque cada app mantiene diferencias de backend, rutas, tokens y comportamiento.

La extracción correcta sería crear primitives/shells reutilizables:

- `AuthScreenShell`
- `AuthFormShell`
- `AuthResultView`
- una definición prefab de campos para formularios

## Duplicación Detectada

Las pantallas comparten una estructura base:

- pantalla centrada a altura completa (`w-full h-screen flex items-center justify-center`)
- contenedor `auth-form`
- título `auth-title`
- `form-container`
- inputs de `@sito/dashboard-app`
- links secundarios
- actions con `Button` y `Loading`

El CSS de ambas apps es casi idéntico:

- `wallet/src/views/Auth/styles.css`
- `period-calendar/src/views/Auth/styles.css`

Las diferencias principales son:

- `wallet` usa `w-108`; `period-calendar` usa `w-100`
- `wallet` centra título en algunos breakpoints
- `wallet` usa `TextLogo` y color aleatorio en algunas pantallas
- `period-calendar` no tiene logo en auth

## Logo

El logo debe ser opcional y flexible. No debe acoplarse a `TextLogo`.

Propuesta:

```tsx
<AuthScreenShell logo={<TextLogo variant={color} />}>
  ...
</AuthScreenShell>
```

Tipo recomendado:

```ts
logo?: React.ReactNode;
```

Esto permite:

- `wallet`: pasar `TextLogo`
- `period-calendar`: no pasar logo
- futuras apps: pasar cualquier marca, icono o bloque custom

## Animación

Conviene mezclar los dos comportamientos actuales:

- `blur-appear` en el contenedor, como hace `period-calendar`
- aparición secuencial por bloques, como hace `wallet`

Propuesta de API:

```ts
motion?: "none" | "blur" | "stagger";
```

O una opción más simple:

```ts
animated?: boolean;
```

Recomendación: empezar con `motion`, porque expresa mejor el comportamiento y deja margen sin romper API.

Los bloques animables naturales son:

- header/logo/title
- fields
- helper links
- actions

## Formularios Prefab

Los forms deberían soportar definición declarativa de inputs para poder compartir layout sin imponer los nombres de campos.

Ejemplo:

```ts
fields={[
  {
    kind: "text",
    name: "email",
    type: "email",
    label: t("_entities:user.email.label"),
    required: t("_entities:user.email.required"),
  },
  {
    kind: "password",
    name: "password",
    label: t("_entities:user.password.label"),
    required: t("_entities:user.password.required"),
  },
  {
    kind: "password",
    name: "confirmPassword",
    label: t("_entities:user.confirmPassword.label"),
    required: t("_entities:user.confirmPassword.required"),
  },
]}
```

Esto permite cubrir diferencias como:

- `wallet`: `rPassword`
- `period-calendar`: `confirmPassword`
- `period-calendar SignUp`: campo extra `name`
- `wallet SignUp`: no tiene `name`

El shell no debe validar passwords por su cuenta. La validación sigue en cada app o en hooks específicos, porque los nombres de campo y el backend cambian.

## SignUpSuccess

`wallet` tiene `SignUpSuccess`, y esa pantalla también encaja mejor como result view que como pantalla hardcodeada.

Una primitive tipo `AuthResultView` debería soportar:

- `logo?: ReactNode`
- `title`
- `description`
- `loading`
- `actions`
- children opcional para contenido custom

Ejemplo:

```tsx
<AuthResultView
  logo={<TextLogo variant={color} />}
  title={t("_pages:auth.signUpSuccess.title")}
  description={t("_pages:auth.signUpSuccess.description")}
  actions={...}
/>
```

## Por Que UpdatePassword Es Diferente

Visualmente `UpdatePassword` está muy duplicada entre ambas apps, pero la lógica no.

Diferencias:

- `wallet` soporta `accessToken` o `tokenHash + type`.
- `period-calendar` soporta `sessionTokens` (`accessToken + refreshToken`) o `tokenHash + type`.
- `wallet` usa `extractRecoveryAccessTokenFromLocation`.
- `period-calendar` usa `extractAuthSessionTokensFromLocation`.
- `wallet` usa `rPassword`.
- `period-calendar` usa `confirmPassword`.
- las rutas y enums tienen nombres distintos.
- los mapeos de error son distintos.

Por eso conviene compartir:

- layout
- campos prefab
- links/actions
- estado loading visual

Pero no conviene compartir:

- parsing concreto de tokens
- payload de `resetPassword`
- navegación posterior
- normalizadores locales

## Por Que ConfirmEmailSuccess Es Diferente

Visualmente también está muy duplicada, pero cambia la estrategia de verificación.

Diferencias:

- `wallet` usa `useEffect` manual, estado `isVerifying`, flag `cancelled` y redirects.
- `period-calendar` usa `useMutation`, `requiresVerification`, `isSuccess` y estado derivado.
- `wallet` permite caer a success si no hay token/error params.
- `period-calendar` calcula `requiresVerification` explícitamente.
- los helpers locales y nombres de rutas/enums difieren.

Por eso conviene compartir una `AuthResultView`, pero dejar la verificación en cada app.

## Propuesta De Refactor

Fase 1:

- crear `AuthScreenShell`
- crear `AuthResultView`
- mover estilos comunes de `auth-form`, `auth-title`, layout y animación a la lib
- aceptar `logo?: ReactNode`
- soportar `motion`

Fase 2:

- crear `AuthFormShell`
- soportar fields prefab (`text`, `password`, `checkbox`)
- soportar links secundarios declarativos
- soportar actions como slot o array

Fase 3 opcional:

- crear wrappers más concretos encima si el uso se estabiliza:
  - `SignInFormView`
  - `SignUpFormView`
  - `UpdatePasswordFormView`

Recomendación: no empezar por wrappers concretos. Primero shells genéricos, porque las apps todavía difieren demasiado en lógica.

## Nota Para El Documento De Migracion

La frase actual:

```md
Pendiente: shells visuales compartidos para SignIn / SignUp / UpdatePassword / ConfirmEmail screens (Fase ulterior si el ROI lo justifica).
```

Sería más precisa así:

```md
Pendiente opcional: primitives/shells visuales de Auth compartidos
(`AuthScreenShell`, `AuthFormShell`, `AuthResultView`) para reducir markup
repetido en SignIn / SignUp / UpdatePassword / ConfirmEmail / SignUpSuccess.
No extraer pantallas completas: la lógica de backend, tokens, rutas y algunos
campos sigue siendo app-specific.
```
