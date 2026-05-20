# Auth Agnostic Auth Views Analysis

Contexto: comparativa entre `wallet` y `period-calendar` para decidir si tiene sentido extraer shells visuales compartidos y vistas agnosticas de auth en `@sito/dashboard-app`.

## Conclusión

Sí hay duplicación real en la capa visual y también hay diferencias de flujo que deberían normalizarse en la lib. La conclusion revisada es que no basta con extraer shells visuales: para que `UpdatePassword` y `ConfirmEmailSuccess` sean realmente agnosticas, la lib debe absorber el parsing comun de tokens, los DTO resolvers y los hooks de flujo.

La extracción correcta combina tres niveles:

- `AuthScreenShell`
- `AuthFormShell`
- `AuthResultView`
- definicion prefab de campos para formularios
- helpers/resolvers canonicos de auth location
- hooks o views agnosticas para flujos comunes (`UpdatePassword`, `ConfirmEmail`)

Las apps deberian aportar textos, rutas, logo opcional y callbacks de navegacion; no deberian repetir parsing de hash/query, normalizacion de token types ni payload building.

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
<AuthScreenShell logo={<TextLogo variant={color} />}>...</AuthScreenShell>
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

## UpdatePassword: Diferencias Actuales Y Objetivo

Visualmente `UpdatePassword` está muy duplicada entre ambas apps. La lógica tambien representa el mismo caso de uso: recibir credenciales de recovery, pedir una nueva password, llamar `resetPassword`, mostrar feedback y volver a sign-in.

Las diferencias actuales son de implementacion:

- `wallet` soporta `accessToken` o `tokenHash + type`.
- `period-calendar` soporta `sessionTokens` (`accessToken + refreshToken`) o `tokenHash + type`.
- `wallet` usa `extractRecoveryAccessTokenFromLocation`.
- `period-calendar` usa `extractAuthSessionTokensFromLocation`.
- `wallet` usa `rPassword`.
- `period-calendar` usa `confirmPassword`.
- las rutas y enums tienen nombres distintos.
- los mapeos de error son distintos.

Objetivo: mover esas diferencias a helpers canonicos y dejar la vista agnostica.

Helper propuesto:

```ts
resolveResetPasswordDtoFromLocation(
  hash: string,
  search: string,
  newPassword: string,
): ResetPasswordDto | null
```

Debe soportar:

- `tokenHash + type=recovery`
- `accessToken`
- `accessToken + refreshToken`

Tambien conviene normalizar el formulario a:

```ts
type UpdatePasswordFormType = {
  password: string;
  confirmPassword: string;
};
```

`wallet` deberia dejar de usar `rPassword` si se quiere una vista comun. `rPassword` es naming heredado, no una necesidad funcional.

Vista/hook objetivo:

```tsx
<AuthUpdatePasswordView
  logo={logo}
  signInTo={AppRoutes.SignIn}
  onNavigate={navigate}
/>
```

O, si se prefiere separar flujo y UI:

```ts
useUpdatePasswordFlow({
  authApi,
  location,
  onSuccess,
  onInvalidToken,
  onError,
});
```

La app no deberia decidir el payload de `resetPassword`; eso debe salir de un resolver compartido que devuelve `ResetPasswordDto`.

## ConfirmEmailSuccess: Diferencias Actuales Y Objetivo

Visualmente también está muy duplicada. La diferencia actual es la estrategia de verificacion, pero el flujo conceptual es el mismo.

Diferencias actuales:

- `wallet` usa `useEffect` manual, estado `isVerifying`, flag `cancelled` y redirects.
- `period-calendar` usa `useMutation`, `requiresVerification`, `isSuccess` y estado derivado.
- `wallet` permite caer a success si no hay token/error params.
- `period-calendar` calcula `requiresVerification` explícitamente.
- los helpers locales y nombres de rutas/enums difieren.

Objetivo: normalizar el flujo y compartir la vista agnostica.

El comportamiento comun deberia ser:

1. mirar si la URL tiene error params
2. si hay error, navegar a confirm-email-error
3. si hay `tokenHash + type=email`, llamar `confirmEmail`
4. si confirma bien, limpiar la URL
5. mostrar success con boton a sign-in
6. si falla, navegar a confirm-email-error

Helper propuesto:

```ts
resolveConfirmEmailDtoFromLocation(
  hash: string,
  search: string,
): ConfirmEmailDto | null
```

Hook/vista objetivo:

```tsx
<AuthConfirmEmailSuccessView
  logo={logo}
  signInTo={AppRoutes.SignIn}
  errorTo={AppRoutes.ConfirmEmailError}
  successTo={AppRoutes.ConfirmEmailSuccess}
  onNavigate={navigate}
/>
```

O, separado:

```ts
useConfirmEmailFlow({
  authApi,
  location,
  onCleanUrl,
  onInvalidToken,
  onError,
});
```

Los normalizadores locales (`normalizeConfirmEmailTokenType`, `normalizeRecoveryTokenType`) deberian desaparecer de las apps si la lib ofrece helpers canonicos.

## Propuesta De Refactor

Fase 1:

- crear helpers canonicos:
  - `resolveResetPasswordDtoFromLocation`
  - `resolveConfirmEmailDtoFromLocation`
  - helper comun para detectar auth error params si falta alguno
- normalizar tipos/form names nuevos a `confirmPassword`
- mantener compatibilidad con los DTOs existentes (`ResetPasswordDto`, `ConfirmEmailDto`)

Fase 2:

- crear hooks de flujo:
  - `useUpdatePasswordFlow`
  - `useConfirmEmailFlow`
- decidir si los hooks reciben `location`/`navigate` o callbacks agnosticos para no acoplar a React Router

Fase 3:

- crear `AuthScreenShell`
- crear `AuthResultView`
- mover estilos comunes de `auth-form`, `auth-title`, layout y animación a la lib
- aceptar `logo?: ReactNode`
- soportar `motion`

Fase 4:

- crear `AuthFormShell`
- soportar fields prefab (`text`, `password`, `checkbox`)
- soportar links secundarios declarativos
- soportar actions como slot o array

Fase 5:

- crear views agnosticas encima si el uso se estabiliza:
  - `SignInFormView`
  - `SignUpFormView`
  - `AuthUpdatePasswordView`
  - `AuthConfirmEmailSuccessView`
  - `AuthConfirmEmailErrorView`

Recomendación: para `UpdatePassword` y `ConfirmEmailSuccess`, no empezar por el shell visual solamente. Primero resolver helpers/hooks de flujo, porque la meta es que las vistas sean agnosticas y funcionen igual.

## Decisiones Cerradas

1. Navegacion agnostica:

   - no forzar React Router como dependencia runtime.
   - la integracion debe apoyarse en `ConfigProvider` para mantenerse agnostica.
   - React Router podria usarse solo como dev dependency para stories si hiciera falta.

2. Nivel de abstraccion:

   - exponer ambos niveles:
     - hooks/shells primitives
     - views concretas construidas encima

3. i18n:

   - la lib sigue i18n-agnostic.
   - props de texto como `string` o `ReactNode`.
   - no recibir translation keys ni depender de `react-i18next`.

4. Redirect post-success:

   - configurable con `successRedirectDelayMs?: number`.
   - default recomendado: `1200`.

5. Limpieza de URL:

   - usar callback, no asumir router.
   - ejemplo: `onCleanUrl?: () => void`.

6. Nombres de campos:

   - migrar `wallet` de `rPassword` a `confirmPassword`.
   - evitar compatibilidad innecesaria en el prefab.

7. Fields prefab:
   - empezar con `text`, `password`, `checkbox`.
   - incluir escape hatch por campo:

```ts
render?: (context: AuthFormFieldRenderContext<TForm>) => React.ReactElement;
```

8. Branding/header:

   - `logo?: ReactNode`.
   - `headerExtra?: ReactNode`.
   - no exponer un `header` completamente libre al inicio para mantener estructura consistente.

9. Error handling:
   - hooks comunes devuelven estado/error crudo.
   - traduccion y mapping de mensajes quedan en la app o en props de la view.

## Nota Para El Documento De Migracion

La frase actual:

```md
Pendiente: shells visuales compartidos para SignIn / SignUp / UpdatePassword / ConfirmEmail screens (Fase ulterior si el ROI lo justifica).
```

Sería más precisa así:

```md
Pendiente opcional: auth views agnosticas y shells visuales compartidos.
Primero normalizar helpers/hooks de flujo para reset password y confirm email
(`resolveResetPasswordDtoFromLocation`, `resolveConfirmEmailDtoFromLocation`,
`useUpdatePasswordFlow`, `useConfirmEmailFlow`), luego extraer
`AuthScreenShell`, `AuthFormShell` y `AuthResultView` para reducir markup
repetido en SignIn / SignUp / UpdatePassword / ConfirmEmail / SignUpSuccess.
Las apps aportan rutas, textos, logo opcional y callbacks; la lib centraliza
parsing de tokens, DTO building y comportamiento comun.
```
