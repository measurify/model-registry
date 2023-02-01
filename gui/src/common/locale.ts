import localization_it from "./localizations/localization_it";
import localization_en from "./localizations/localization_en";

import { languages } from "../config";

interface ILocalization {
  username: string;
  password: string;
  tenant: string;
  email: string;
  keep_logged: string;
  select: string;
  language: string;
  welcome: string;
  role: string;
  session_expire_in: string;
  resources: string;
  tools: string;
  notifications: string;
  file_content: string;
  preview: string;
  configuration: string;

  clear_all: string;

  ///Fields
  enter: string;
  username_suggestion: string;
  password_suggestion: string;
  tenant_suggestion: string;
  email_suggestion: string;
  add_tenant: string;

  //homepage
  welcome_hp: string;
  left_bar_descr_hp: string;
  right_bar_descr_hp: string;
  session_expire_info_hp: string;
  github_page_hp: string;
  github_issue_page_hp: string;

  //profile page
  profile_page_desc: string;
  pass_change_confirm: string;
  email_change_confirm: string;
  password_rules: string;

  //404
  oh_no: string;
  broken_link: string;

  ///Actions
  submit: string;
  cancel: string;
  login: string;
  logout: string;
  repeat: string;
  close: string;
  import: string;
  export: string;

  //
  password_recovery: string;
  password_reset: string;
  forgot_password_link: string;
  go_login_page: string;
  email_sent_successfully: string;

  ///Errors
  login_error: string;
  unauthorised_user: string;
  session_expired: string;
  no_file: string;
  no_username: string;
  no_password: string;
  define: string;
  no_changes: string;
  error_imported_file: string;
  duplicate_resource_error: string;
  pass_not_match: string;
  old_pass_empty: string;
  old_pass_wrong: string;
  pass_not_null: string;
  password_changed: string;
  email_changed: string;
  missing_tenant: string;
  missing_email: string;
  missing_token: string;
  stronger_password_required: string;
  email_sent_errors: string;
  password_not_changed_errors: string;
  network_error: string;
  empty_email_error: string;
  email_not_match: string;
  email_same_as_old: string;
}

export default function locale() {
  let tkn = localStorage.getItem("language");
  if (languages.length === 0) {
    return localization_en as ILocalization;
  }
  if (languages.length === 1) {
    tkn = languages[0];
  }

  //check token first
  if (tkn === "it") {
    return localization_it as ILocalization;
  }

  if (tkn === "en") {
    return localization_en as ILocalization;
  }

  //then check language from browser
  if (navigator.language.substring(0, 2) === "it") {
    return localization_it as ILocalization;
  }

  if (navigator.language.substring(0, 2) === "en") {
    return localization_en as ILocalization;
  }

  //if the token found or language is not valid -> default language: english
  return localization_en as ILocalization;
}
