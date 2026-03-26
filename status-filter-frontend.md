# Frontend Guide: `softDeleteScope` Filter (Wallet)

Esta guia resume como usar el query param `softDeleteScope` desde frontend en los endpoints de `wallet`.

## Valores soportados

- `ACTIVE`: solo registros no borrados.
- `DELETED`: solo registros borrados.
- `ALL`: registros no borrados + borrados.

Uso recomendado:

```http
GET /transactions?softDeleteScope=ACTIVE
GET /transactions?softDeleteScope=DELETED
GET /transactions?softDeleteScope=ALL
```

Tambien funciona en minusculas (`active`, `deleted`, `all`).

## `softDeleteScope` vs params legacy

Se recomienda `softDeleteScope` como forma estandar en frontend.

Si tu backend mantiene compatibilidad legacy, tambien podria aceptar:

- `?status=ACTIVE`
- `?filters=status==ACTIVE`

Evita mezclar `softDeleteScope` con params legacy en la misma request para no introducir ambiguedad de precedencia.

## Endpoints con comportamiento completo (`ACTIVE/DELETED/ALL`)

- `GET /transactions`
- `GET /transactions/export`
- `GET /accounts`
- `GET /accounts/export`
- `GET /currencies`
- `GET /currencies/export`
- `GET /transaction-categories`
- `GET /transaction-categories/export`
- `GET /users`

## Excepciones importantes

### 1) Endpoints que siempre ignoran borrados (siempre devuelven no borrados)

- `GET /transactions/common`
- `GET /transactions/weekly`
- `GET /transactions/type-resume`
- `GET /transactions/grouped-by-type`
- `GET /accounts/common`
- `GET /currencies/common`
- `GET /transaction-categories/common`
- `GET /users/common`

En estos endpoints, `softDeleteScope` no altera el resultado.

### 2) User dashboard config (hard delete)

- `GET /user-dashboard-config`
- `GET /user-dashboard-config/export`

`user-dashboard-config` usa hard delete, por lo que no hay papelera/restore con `deletedAt`.
En la practica, `softDeleteScope` no cambia el resultado.

## Recomendacion para UI

- Vistas de listado principales: usar selector `ACTIVE | DELETED | ALL`.
- Vistas `common` y agregados (`weekly`, `type-resume`, `grouped-by-type`): ocultar selector de papelera.
- Para `user-dashboard-config`: ocultar selector de papelera.
