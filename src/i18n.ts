export type DashboardAppTranslationValue = string | {
  [key: string]: DashboardAppTranslationValue;
};

export type DashboardAppLanguageResources = {
  _accessibility: DashboardAppTranslationValue;
  _pages: DashboardAppTranslationValue;
  _messages: DashboardAppTranslationValue;
};

export const dashboardAppResources: Record<"en" | "es", DashboardAppLanguageResources> = {
  en: {
    _accessibility: {
      actions: { retry: "Retry" },
      ariaLabels: {
        cancel: "Cancel", closeDialog: "Close dialog", closeMenu: "Close menu",
        closeNotification: "Close notification", hidePassword: "Hide password",
        next: "Next", ok: "OK", openMenu: "Open menu", showPassword: "Show password",
        skip: "Skip", start: "Start", submit: "Submit",
      },
      buttons: {
        back: "Back", cancel: "Cancel", closeDialog: "Close", closeNotification: "Close notification",
        next: "Next", ok: "OK", openMenu: "Open menu", signIn: "Sign in", skip: "Skip",
        startAsGuest: "Continue as guest", submit: "Submit", toTop: "Back to top",
      },
      errors: { "500": "Something went wrong. Please try again.", unknownError: "An unknown error occurred." },
      labels: { ago: "ago", file: "File", hour: "hour", hours: "hours", justNow: "just now", minute: "minute", minutes: "minutes", yesterday: "yesterday" },
      messages: { empty: "No results found." },
    },
    _pages: {
      common: { actions: {
        delete: { dialog: { title: "Delete" }, successMessage: "Deleted successfully.", text: "Delete" },
        edit: { text: "Edit" },
        export: { successMessage: "Exported successfully.", text: "Export" },
        import: { dialog: { title: "Import" }, override: "Override existing items", previewCount: "{{count}} items to import", text: "Import" },
        refresh: { text: "Refresh" },
        restore: { dialog: { title: "Restore" }, successMessage: "Restored successfully.", text: "Restore" },
      } },
      home: { appName: "Dashboard" },
      notFound: { body: "The page you requested could not be found.", cta: "Go to home", title: "Page not found" },
    },
    _messages: { errors: { parseFile: "Could not read this file: {{fileName}}" }, loading: { processingFile: "Processing {{fileName}}…" } },
  },
  es: {
    _accessibility: {
      actions: { retry: "Reintentar" },
      ariaLabels: {
        cancel: "Cancelar", closeDialog: "Cerrar diálogo", closeMenu: "Cerrar menú",
        closeNotification: "Cerrar notificación", hidePassword: "Ocultar contraseña",
        next: "Siguiente", ok: "Aceptar", openMenu: "Abrir menú", showPassword: "Mostrar contraseña",
        skip: "Omitir", start: "Empezar", submit: "Enviar",
      },
      buttons: {
        back: "Atrás", cancel: "Cancelar", closeDialog: "Cerrar", closeNotification: "Cerrar notificación",
        next: "Siguiente", ok: "Aceptar", openMenu: "Abrir menú", signIn: "Iniciar sesión", skip: "Omitir",
        startAsGuest: "Continuar como invitado", submit: "Enviar", toTop: "Volver arriba",
      },
      errors: { "500": "Algo salió mal. Inténtalo de nuevo.", unknownError: "Se ha producido un error desconocido." },
      labels: { ago: "hace", file: "Archivo", hour: "hora", hours: "horas", justNow: "ahora mismo", minute: "minuto", minutes: "minutos", yesterday: "ayer" },
      messages: { empty: "No se encontraron resultados." },
    },
    _pages: {
      common: { actions: {
        delete: { dialog: { title: "Eliminar" }, successMessage: "Eliminado correctamente.", text: "Eliminar" },
        edit: { text: "Editar" },
        export: { successMessage: "Exportado correctamente.", text: "Exportar" },
        import: { dialog: { title: "Importar" }, override: "Reemplazar elementos existentes", previewCount: "{{count}} elementos para importar", text: "Importar" },
        refresh: { text: "Actualizar" },
        restore: { dialog: { title: "Restaurar" }, successMessage: "Restaurado correctamente.", text: "Restaurar" },
      } },
      home: { appName: "Panel" },
      notFound: { body: "No se encuentra la página solicitada.", cta: "Ir al inicio", title: "Página no encontrada" },
    },
    _messages: { errors: { parseFile: "No se pudo leer el archivo: {{fileName}}" }, loading: { processingFile: "Procesando {{fileName}}…" } },
  },
};
