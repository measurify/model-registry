const localization_en = {
  username: "Username",
  password: "Password",
  tenant: "Tenant",
  email: "Email",
  keep_logged: "Keep Logged In",

  select: "Select",
  language: "Language",
  welcome: "Welcome back",
  role: "Role",
  session_expire_in: "Session will expire in ",
  resources: "Resources",
  tools: "Tools",
  notifications: "Notifications",
  file_content: "File content",
  preview: "Preview",
  configuration: "Configuration",

  clear_all: "Clear all",

  enter: "Enter",
  username_suggestion: "Insert your username",
  password_suggestion: "Insert your password",
  tenant_suggestion: "Insert your tenant",
  email_suggestion: "Insert your email",
  add_tenant: "Add tenant",

  //Homepage
  welcome_hp: "Welcome to the ML Registry dashboard!",
  left_bar_descr_hp:
    "The left bar contains the information about your account and  the list of tabs",
  right_bar_descr_hp:
    'The right bar contains the notification bar (Click on "Notifications" to open).',
  session_expire_info_hp: "",
  github_page_hp: "",
  github_issue_page_hp: "Report bugs or issues",

  //profile page
  profile_page_desc:
    "from this page you can view your own profile or change the password",
  pass_change_confirm: "Password will be changed, do you confirm?",
  email_change_confirm: "Email address will be changed, do you confirm?",
  email_changed: "Email changed",
  password_changed: "Password changed",
  password_rules:
    "Password length should be at least 6 characters, contains at least one uppercase character and one number.",
  forgot_password_link: "Have you forgot your password?",
  go_login_page: "Go to login page",

  //404
  oh_no: "Oh No!",
  broken_link: "It looks like you have clicked on a broken link.",

  ///Actions
  submit: "Submit",
  cancel: "Cancel",
  login: "Login",
  logout: "Logout",
  repeat: "Repeat",
  close: "Close",
  import: "Import",
  export: "Export",

  password_recovery: "Password Recovery",
  password_reset: "Reset Password",
  email_sent_successfully:
    "Email sent, please follow the provided instruction to reset the password",

  ///Errors
  login_error: "Wrong login!",
  unauthorised_user: "You are not allowed to use this page",
  session_expired: "Session expired",
  no_file: "Please, select a file",
  no_username: "Please, insert your username",
  no_password: "Please, insert your password",
  define: "Please, define: ",
  no_changes: "No changes in the resource",
  duplicate_resource_error: "The database already contains a resource with",
  error_imported_file: "File contains errors. It was not possible to import it",
  pass_not_match:
    "Provided password and the confirmation do not match. Please insert them again",
  old_pass_empty: "Please. enter old password",
  old_pass_wrong: "The old password is wrong",
  pass_not_null: "Password cannot be empty",
  missing_tenant: "Please, insert your tenant",
  missing_email: "Please, insert your email",
  missing_token: "Please, insert your token",
  stronger_password_required: "Please, insert stronger password",
  email_sent_errors:
    "It was not possible to send the mail, please check the provided info.",
  password_not_changed_errors: "It was not possible to change the password.",
  network_error: "Network error, please check internet connection",
  empty_email_error:
    "Email field is empty, please insert a valid email address.",
  email_not_match:
    "Provided email and the confirmation do not match. Please insert them again.",
  email_same_as_old:
    "The new email is the same as the old email. Please insert a different email address.",
};

export default localization_en;
