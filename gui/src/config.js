import { isFeatureInUse, alwaysTrue } from "./services/validations";

//url of APIs
//export const api_url = "https://hi-drive.measurify.org:8080/v1";
export const api_url = "https://registry.measurify.org/v1";

//name of this dashboard, shown to users
export const website_name = "Model Registry Dashboard";

//languages enabled for this GUI, only english "en" and italian "it" are supported with this version
//if no languages are enabled, the GUI will be localized in english
//export const languages = ["en", "it"];
export const languages = [];

//gui layout
// options are "horizontal" or "vertical"
export const layout = "vertical";

//dictionary of pages: key is the route for the API REST, value is an array that contains the fields shown to users
//action is a special field that will enable actions for each row || still required, future version may have it removed
export const pages = {};
pages["users"] = ["username", "role", "actions"];
pages["tags"] = ["_id", "usage", "actions"];
pages["datasets"] = [
  "name",
  "metadata",
  "tags",
  "actions",
];
pages["models"] = [
  "name",
  "metadata",
  "status",
  "tags",
  "actions",
];
pages["algorithms"] = [
  "name",
  "metadata",
  "status",
  "tags",
  "actions",
];

//version pages: key is the model + "Version", value is an array that contains the fields shown to users
//action is a special field that will enable actions for each row || still required, future version may have it removed
export const versionPages = {};
versionPages["datasets"] = ["ordinal", "original", "timestamp", "size", "actions"];
versionPages["models"] = ["ordinal", "original", "timestamp", "size", "actions"];
versionPages["algorithms"] = ["ordinal", "original", "timestamp", "size", "actions"];


//alias dictionary: key is the page, value are object with pairs of the fields that will be renamed into page table header ("key" is renamed as "value")
export const aliasPages = {};
aliasPages["datasets"] = { original: "filename", timestamp: "data", size: "size (byte)" };
aliasPages["models"] = { original: "filename", timestamp: "data", size: "size (byte)" };
aliasPages["algorithms"] = { original: "filename", timestamp: "data", size: "size (byte)" };
//aliasPages["features"] = { _id: "Feature Name", actions: "Actions" };
//aliasPages["tags"] = { _id: "Tag Name", actions: "Actions" };
//aliasPages["devices"] = { _id: "Device Name", actions: "Actions" };

//actions dictionary: key is the page, value is an array that contains actions || working actions arae "view" | "edit" | "delete"
export const pageActions = {};
pageActions["users"] = ["view", "delete"];
pageActions["tags"] = ["view", "delete"];
pageActions["datasets"] = ["view", "edit", "versioning", "delete"];
pageActions["models"] = ["view", "edit", "versioning", "delete"];
pageActions["algorithms"] = ["view", "edit", "versioning", "delete"];
pageActions["datasetsVersion"] = ["downloadVersion", "deleteVersion"];
pageActions["modelsVersion"] = ["downloadVersion", "deleteVersion"];
pageActions["algorithmsVersion"] = ["downloadVersion", "deleteVersion"];

//view dictionary: key is the page, value is an array that contains the fields shown to the user with "view" action
export const viewFields = {};
viewFields["users"] = ["username", "role"];
viewFields["tags"] = ["_id", "usage", "owner", "actions"];
viewFields["datasets"] = ["_id", "name", "metadata", "versions", "users"];
viewFields["models"] = [
  "name",
  "metadata",
  "datasets",
  "versions",
  "users",
  "tags",
];
viewFields["algorithms"] = [
  "name",
  "metadata",
  "datasets",
  "versions",
  "users",
  "tags",
];


//edit dictionary: key is the page, value is an array that contains the fields that can be edited with "edit" action
//fields should be specified in the same format of the object that will be represented:
// - key:"" for an string field,
// - key:NaN for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string

export const editFields = {};
//editFields["devices"] = { visibility: "", tags: [""] };

//editFields["tags"] = { _id:"", usage: "" };

editFields["models"] = {
  status: "",
  visibility: "",
  users: [""],
  datasets: [""],
  metadata: [{ name: "", value: "" }],
  tags: [""],
};

editFields["algorithms"] = {
  status: "",
  visibility: "",
  users: [""],
  datasets: [""],
  metadata: [{ name: "", value: "" }],
  tags: [""],
};

editFields["datasets"] = {
  name: "", 
  users: [""],
  metadata: [{ name: "", value: "" }],
  tags: [""],
};

//add dictionary: key is the page, value is an array that contains the fields that can will be used to post the entity
//fields should be specified in the same format of the objet that will be represented:
// - key:"" for an string field,
// - key:NaN for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string

export const addFields = {};
addFields["tenants"] = {
  token: "",
  _id: "",
  organization: "",
  address: "",
  email: "",
  phone: "",
  admin_username: "",
  admin_password: "",
  passwordhash: "",
};

addFields["datasets"] = {
  name: "",
  users: [""],
  metadata: [{ name: "", value: "" }],
  visibility: "",
  tags: [""]
};

addFields["models"] = {
  name: "",
  users: [""],
  datasets: [""],
  status: "",
  metadata: [{ name: "", value: "" }],
  visibility: "",
  tags: [""]
};

addFields["algorithms"] = {
  name: "",
  users: [""],
  datasets: [""],
  status: "",
  metadata: [{ name: "", value: "" }],
  visibility: "",
  tags: [""]
};

addFields["versions"] = {
  ordinal: "",
  file: "",
};

addFields["users"] = { username: "", password: "", role: "" };

addFields["tags"] = { _id: "", usage: "" };

//edit fields specifiers dictionary
//this dictionary allow to specify particular behaviour for input fields, that can be managed by a specific function
// type can be "disable" -> policy is applied to fields to be disabled, true when field should be disabled
//
export const editFieldsSpecifier = {};
editFieldsSpecifier["features"] = {
  _id: { type: "disable", policy: isFeatureInUse },
  items: { type: "disable", policy: isFeatureInUse },
};

//dictionary to select the way to post entity/ies, it's an array which can contain "form", "file", or both
export const addTypes = {};
addTypes["users"] = ["form", "file"];
addTypes["tags"] = ["form", "file"];
addTypes["models"] = ["form", "file"];
addTypes["algorithms"] = ["form", "file"];
addTypes["datasets"] = ["form", "file"];
addTypes["versions"] = ["file"];
addTypes["tenants"] = ["form"];

//dictionary for fetched types
//types are fetched on the /types route and matched with fields following this dictionary
export const fetchedPageTypes = {};
fetchedPageTypes["users"] = { role: "UserRoles" };
fetchedPageTypes["datasets"] = { visibility: "VisibilityTypes" };
fetchedPageTypes["models"] = { visibility: "VisibilityTypes", status: "ModelStatusTypes" };
fetchedPageTypes["algorithms"] = { visibility: "VisibilityTypes", status: "AlgorithmStatusTypes" };
fetchedPageTypes["tags"] = { usage: "UsageTypes" };

//dictionary for fetched data
//data is fetched on the according resource route and matched with fields following this dictionary
//the value of the specified field is the route to search for data. _ids of that route will be used as options
export const fetchedPageData = {};
/*fetchedPageData["tags"] = { tags: "tags" };
fetchedPageData["things"] = { tags: "tags" };
fetchedPageData["devices"] = { features: "features" };
fetchedPageData["features"] = { tags: "tags" };
fetchedPageData["measurements"] = {
  device: "devices",
  thing: "things",
  tags: "tags",
};*/

fetchedPageData["datasets"] = { users: "users" };
fetchedPageData["models"] = { datasets: "datasets", users: "users" };
fetchedPageData["algorithms"] = { datasets: "datasets", users: "users" };