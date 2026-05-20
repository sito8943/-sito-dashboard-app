# Auth Agnostic Auth Views Analysis

Contexto: comparativa entre `wallet` y `period-calendar` para decidir como extraer y consumir shells/vistas compartidas de auth y primitivas legales desde `@sito/dashboard-app`.

## Estado Actual

La duplicacion detectada era real, pero la conclusion ya no es solo "extraer shells visuales". El trabajo correcto combina tres niveles:

- helpers canonicos para leer query/hash y construir DTOs
- hooks agnosticos para flujos comunes
- shells/views presentacionales reutilizables

Ese nucleo ya esta implementado en la lib para los flujos mas delicados:

- reset/update password
- confirm email success/error
- legal/info pages

Las apps ahora deben aportar textos, rutas, logo opcional, callbacks y mapping de errores. La lib centraliza parsing de tokens, DTO building, estados de flujo y markup compartido.

## Implementado En La Lib

### Auth helpers

Ya existen helpers canonicos en `src/lib/auth/utils.ts`:

- `resolveResetPasswordDtoFromLocation`
- `resolveConfirmEmailDtoFromLocation`
- `extractAuthQueryParamFromLocation`
- `extractRecoveryAccessTokenFromLocation`
- `extractAuthSessionTokensFromLocation`
- `hasAuthErrorParamsInLocation`
- `getAuthErrorMessage`

Esto elimina la necesidad de normalizadores locales tipo:

- `normalizeRecoveryTokenType`
- `normalizeConfirmEmailTokenType`

### Auth hooks

Ya existen hooks agnosticos en `src/hooks/auth`:

- `useUpdatePasswordFlow`
- `useConfirmEmailFlow`

Propiedades clave:

- no fuerzan React Router
- reciben `location` agnostico (`hash` / `search`)
- devuelven estado/error crudo
- aceptan callbacks (`onSuccess`, `onInvalidToken`, `onError`, `onCleanUrl`)
- `useUpdatePasswordFlow` limpia su timeout interno
- `successRedirectDelayMs` es configurable y default `1200`

### Auth shells

Ya existen primitives compartidas en `src/components/app/Auth`:

- `AuthScreenShell`
- `AuthFormShell`
- `AuthResultView`

Decisiones ya aplicadas:

- `logo?: ReactNode`
- `headerExtra?: ReactNode`
- `motion?: "none" | "blur" | "stagger"`
- fields prefab en `AuthFormShell`
- fields soportados: `text`, `password`, `checkbox`
- escape hatch por field con `render?: (...) => ReactElement`
- lib i18n-agnostic: textos como `ReactNode` / `string`

### Auth views

Ya existen views concretas construidas encima:

- `AuthUpdatePasswordView`
- `AuthConfirmEmailSuccessView`
- `AuthConfirmEmailErrorView`

Estas views cubren la parte que antes estaba duplicada entre `wallet` y `period-calendar`.

### Legal primitives

Ya existen primitives legales/info:

- `LegalPage`
- `LegalSection`
- `LegalLinksList`
- `richTextComponents`

La lib sigue i18n-agnostic: las apps resuelven `t()` / `<Trans>` y pasan `ReactNode`.

## Migrado En Apps

### wallet

Migrado a shared auth views/shells:

- `src/views/Auth/SignIn.tsx`
- `src/views/Auth/SignUp.tsx`
- `src/views/Auth/SignUpSuccess.tsx`
- `src/views/Auth/UpdatePassword.tsx`
- `src/views/Auth/ConfirmEmailSuccess.tsx`
- `src/views/Auth/ConfirmEmailError.tsx`

Migrado a legal primitives:

- `src/views/Info/About.tsx`
- `src/views/Info/CookiesPolicy.tsx`
- `src/views/Info/PrivacyPolicy.tsx`
- `src/views/Info/TermsAndConditions.tsx`

Notas:

- `wallet` pasa `TextLogo` via `logo={<TextLogo ... />}`.
- `SignUpSuccess` usa `AuthResultView`.
- `SignIn` y `SignUp` usan `AuthFormShell`.
- `SignUp` migro el nombre interno `rPassword` a `confirmPassword`.
- se elimino el tipo local obsoleto de `UpdatePassword`.
- se agrego `src/views/Info/constants.ts` para evitar hardcode largo en el JSX.

### period-calendar

Migrado a shared auth views/shells:

- `src/views/Auth/SignIn/SignIn.tsx`
- `src/views/Auth/SignUp/SignUp.tsx`
- `src/views/Auth/UpdatePassword/UpdatePassword.tsx`
- `src/views/Auth/ConfirmEmailSuccess/ConfirmEmailSuccess.tsx`
- `src/views/Auth/ConfirmEmailError/ConfirmEmailError.tsx`

Migrado a legal primitives:

- `src/views/Info/About/About.tsx`
- `src/views/Info/CookiesPolicy/CookiesPolicy.tsx`
- `src/views/Info/PrivacyPolicy/PrivacyPolicy.tsx`
- `src/views/Info/TermsAndConditions/TermsAndConditions.tsx`

Notas:

- `period-calendar` no pasa logo, porque el logo es opcional.
- `SignIn` y `SignUp` usan `AuthFormShell`.
- se eliminaron utils/types locales que ya cubre la lib.
- `UpdatePassword` ya delega payload/token handling al resolver compartido.
- `ConfirmEmailSuccess` ya delega verificacion al hook/view compartido.

## Pendiente Real

### SignInFormView / SignUpFormView

Siguen como posible fase posterior, no como bloqueo.

No son necesarios para completar la migracion actual porque ambas apps ya usan `AuthFormShell`. Solo tendria sentido crear views concretas si:

- ambas apps terminan usando exactamente el mismo contrato de submit
- los fields base se estabilizan
- el ahorro de codigo justifica otro nivel de API publica

## Riesgos / Notas

### Dist de la libreria

Las apps consumen `@sito/dashboard-app` via package exports, que apuntan a `dist`.

Aunque el source de la lib ya tiene los nuevos exports, las apps no los veran en runtime/typecheck hasta compilar/publicar la lib.

No se ejecuto build por la regla del proyecto: "No ejecutes scripts".

### Scope actual

La migracion actual cubre:

- SignIn
- SignUp
- wallet SignUpSuccess
- UpdatePassword
- ConfirmEmailSuccess
- ConfirmEmailError
- Legal/info pages

No cubre aun una API publica concreta para `SignInFormView` / `SignUpFormView`.

### Error handling

Los hooks comunes devuelven estado/error crudo. Esto esta bien y debe mantenerse:

- la lib no traduce errores
- las apps hacen mapping a mensajes propios
- las apps deciden si notifican, redirigen o renderizan estado

### Navegacion

La lib no debe forzar React Router.

La navegacion se mantiene via:

- `ConfigProvider`
- callbacks
- `signInTo` / `errorTo` / `successTo`
- `onNavigate` implicito desde la integracion de la app

## Decision Final

La fase de auth/legal compartido ya avanzo de "pendiente opcional" a "implementado y migrado en los flujos revisados".

La frase antigua:

```md
Pendiente: shells visuales compartidos para SignIn / SignUp / UpdatePassword / ConfirmEmail screens (Fase ulterior si el ROI lo justifica).
```

Debe reemplazarse por:

```md
Implementado: helpers/hooks agnosticos y shared views para UpdatePassword,
ConfirmEmailSuccess y ConfirmEmailError, shared shell para SignIn / SignUp,
AuthResultView para wallet SignUpSuccess, mas primitives legales compartidas.
Migrado en wallet y period-calendar para esos flujos.

Pendiente: evaluar despues si hacen falta SignInFormView / SignUpFormView como
API publica adicional.
```
