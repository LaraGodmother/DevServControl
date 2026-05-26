export type Language = "pt" | "en" | "es";

export const LANGUAGES: { key: Language; label: string }[] = [
  { key: "pt", label: "Português" },
  { key: "en", label: "English" },
  { key: "es", label: "Español" },
];

type Translations = {
  settings: {
    title: string;
    language: string;
    whatsapp: string;
    changePassword: string;
    backup: string;
    logout: string;
    company: string;
    theme: string;
    save: string;
  };
  common: {
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    back: string;
    search: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    date: string;
    value: string;
    noData: string;
  };
};

const translations: Record<Language, Translations> = {
  pt: {
    settings: {
      title: "Configurações", language: "Idioma", whatsapp: "WhatsApp da empresa",
      changePassword: "Alterar senha", backup: "Exportar dados", logout: "Sair da conta",
      company: "Empresa", theme: "Aparência", save: "Salvar",
    },
    common: {
      save: "Salvar", cancel: "Cancelar", confirm: "Confirmar", delete: "Excluir",
      edit: "Editar", add: "Adicionar", close: "Fechar", loading: "Carregando...",
      error: "Erro", success: "Sucesso", back: "Voltar", search: "Buscar",
      name: "Nome", email: "E-mail", phone: "Telefone", status: "Status",
      date: "Data", value: "Valor", noData: "Nenhum dado encontrado",
    },
  },
  en: {
    settings: {
      title: "Settings", language: "Language", whatsapp: "Company WhatsApp",
      changePassword: "Change password", backup: "Export data", logout: "Sign out",
      company: "Company", theme: "Appearance", save: "Save",
    },
    common: {
      save: "Save", cancel: "Cancel", confirm: "Confirm", delete: "Delete",
      edit: "Edit", add: "Add", close: "Close", loading: "Loading...",
      error: "Error", success: "Success", back: "Back", search: "Search",
      name: "Name", email: "Email", phone: "Phone", status: "Status",
      date: "Date", value: "Value", noData: "No data found",
    },
  },
  es: {
    settings: {
      title: "Configuración", language: "Idioma", whatsapp: "WhatsApp de la empresa",
      changePassword: "Cambiar contraseña", backup: "Exportar datos", logout: "Cerrar sesión",
      company: "Empresa", theme: "Apariencia", save: "Guardar",
    },
    common: {
      save: "Guardar", cancel: "Cancelar", confirm: "Confirmar", delete: "Eliminar",
      edit: "Editar", add: "Agregar", close: "Cerrar", loading: "Cargando...",
      error: "Error", success: "Éxito", back: "Volver", search: "Buscar",
      name: "Nombre", email: "Correo", phone: "Teléfono", status: "Estado",
      date: "Fecha", value: "Valor", noData: "No se encontraron datos",
    },
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] ?? translations.pt;
}
