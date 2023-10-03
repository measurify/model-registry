import { base_api_url } from "../config";
import { GetProgressbarValue, updateProgressbar } from "./progressbar_manager";

import axios from "axios"; 

export const instance = axios.create({});

export let api_url;


export let notificationManager = {
  PushNotification: (obj) => {},
  RemoveNotification: (id) => {},
  ClearNotifications: () => {},
};

//set APIs url according to configuration or GUI host
export function SetAPIUrl() {
  console.log(window.location.origin);
  api_url =
    base_api_url !== undefined
      ? base_api_url
      : (window.location.origin.includes("localhost")
          ? "https://localhost"
          : window.location.origin) + "/v1";
}

//login
export function login(username, password, tenant, saveToken = true) {
  const body = {
    username: `${username}`,
    password: `${password}`,
    tenant: `${tenant}`,
  };
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      //Authorization: GetToken(),
    },
  };
  const url_string = api_url + "/login";

  return new Promise((resolve, reject) => {
    instance
      .post(url_string, body, options)
      .then((response) => {
        if (saveToken === true) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "token-expiration-time",
            response.data.token_expiration_time
          );
          localStorage.setItem("username", response.data.user.username);
          localStorage.setItem("userId", response.data.user._id);
          localStorage.setItem("user-role", response.data.user.role);
          localStorage.setItem("user-email", response.data.user.email);
          localStorage.setItem("user-tenant", tenant);
          localStorage.setItem("login-time", new Date().getTime().toString());
        }
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
//refresh token
export function refreshToken() {
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: GetToken(),
    },
  };

  const url_string = api_url + "/login";

  return new Promise((resolve, reject) => {
    instance
      .put(url_string, {}, options)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("login-time", new Date().getTime().toString());
        localStorage.setItem(
          "token-expiration-time",
          response.data.token_expiration_time
        );
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function post_file_generic(
  resource_type,
  formData,
  additionalHeader = {},
  token = undefined
) {
  if (token === undefined) token = GetToken();
  const url_string = api_url + "/" + resource_type + "/file";

  console.log("POST file:" + url_string);

  const tempH = {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache",
    Authorization: token,
  };

  Object.entries(additionalHeader).forEach(([k, v]) => {
    tempH[k] = v;
  });
  const options = {
    headers: tempH,
  };

  return new Promise((resolve, reject) => {
    instance
      .post(url_string, formData, options)
      .then((response) => {
        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg: "Successful POST of file on: " + resource_type,
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg: "Error doing a POST of file on: " + resource_type,
        });
        reject({ error: error }); //false;
      });
  });
}

export async function post_version_file_generic(
  resource_type,
  id,
  formData,
  additionalHeader = {},
  token = undefined
) {
  if (token === undefined) token = GetToken();
  const url_string = api_url + "/" + resource_type + "/" + id + "/versions";

  console.log("POST file:" + url_string);

  const tempH = {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache",
    Authorization: token,
  };

  Object.entries(additionalHeader).forEach(([k, v]) => {
    tempH[k] = v;
  });
  const options = {
    headers: tempH,
  };

  return new Promise((resolve, reject) => {
    instance
      .post(url_string, formData, options)
      .then((response) => {
        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg: "Successful POST of file on: " + resource_type,
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg: "Error doing a POST of file on: " + resource_type,
        });
        reject({ error: error }); //false;
      });
  });
}

export async function post_generic(resource_type, body, token = undefined) {
  if (token === undefined) token = GetToken();
  const url_string = api_url + "/" + resource_type + "/";

  console.log("POST :" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .post(url_string, body, options)
      .then((response) => {
        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg: "Successful POST of a resource type: " + resource_type,
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg: "Error doing a POST of a resource type: " + resource_type,
        });
        reject({ error: error }); //false;
      });
  });
}

export async function put_generic(resource_type, body, id, token = undefined) {
  const url_string = api_url + "/" + resource_type + "/" + id;
  if (token === undefined) token = GetToken();

  console.log("PUT :" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .put(url_string, body, options)
      .then((response) => {
        //obscure password in notification bar
        if (body["password"] !== undefined)
          body["password"] = "".padStart(body["password"].length, "*");

        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg:
            "Successful PUT of a resource type: " +
            resource_type +
            ", id: " +
            id +
            ", body: " +
            JSON.stringify(body),
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        //obscure password in notification bar
        if (body["password"] !== undefined)
          body["password"] = "".padStart(body["password"].length, "*");

        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg:
            "Error doing a PUT on resource type: " +
            resource_type +
            ", id: " +
            id +
            ", body: " +
            JSON.stringify(body) +
            ". " +
            error.message,
        });

        reject({ error: error }); //false;
      });
  });
}

export async function delete_generic(resource_type, id, token = undefined) {
  let url_string = api_url + "/" + resource_type;
  if (token === undefined) token = GetToken();
  if (id !== undefined) {
    url_string += "/" + id;
  }
  console.log("DELETE :" + url_string);

  //url: url_string;
  let options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };

  return new Promise((resolve, reject) => {
    instance
      .delete(url_string, options)
      .then((response) => {
        if (id !== undefined) {
          notificationManager.PushNotification({
            name: "info",
            time: new Date().toTimeString(),
            msg: "Deleted resource: " + id + ", of type: " + resource_type,
          });
        } else {
          notificationManager.PushNotification({
            name: "info",
            time: new Date().toTimeString(),
            msg: "Deleted resources of type: " + resource_type,
          });
        }
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg:
            "error deleting resource: " +
            id +
            ", of type: " +
            resource_type +
            ". " +
            error.message,
        });
        if (error.statusCode === 404) {
          //Not found
          notificationManager.PushNotification({
            name: "error",
            time: new Date().toTimeString(),
            msg:
              "Please check if your user is authorized to delete the resource. " +
              error.message,
          });
        }

        reject({ error: error }); //false;
      });
  });
}

export async function delete_version(
  resource_type,
  idResource,
  id,
  token = undefined
) {
  if (idResource === undefined || id === undefined) {
    console.log("idResource or id can't be null");
    return;
  }
  let url_string =
    api_url + "/" + resource_type + "/" + idResource + "/versions" + "/" + id;
  if (token === undefined) token = GetToken();

  console.log("DELETE :" + url_string);

  //url: url_string;
  let options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };

  return new Promise((resolve, reject) => {
    instance
      .delete(url_string, options)
      .then((response) => {
        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg:
            "Deleted resource: " + id + ", version of type: " + resource_type,
        });
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg:
            "error deleting resource: " +
            id +
            ", version of type: " +
            resource_type +
            ". " +
            error.message,
        });
        if (error.statusCode === 404) {
          //Not found
          notificationManager.PushNotification({
            name: "error",
            time: new Date().toTimeString(),
            msg:
              "Please check if your user is authorized to delete the resource. " +
              error.message,
          });
        }

        reject({ error: error }); //false;
      });
  });
}

export async function get_generic(
  resource_type,
  qs = {},
  _options = {},
  token
) {
  let url = api_url + "/" + resource_type + "/";
  if (token === undefined) token = GetToken();

  if (qs.filter !== undefined) {
    url = url.concat("?filter=" + qs.filter);
  } else {
    url = url.concat("?filter=");
  }
  if (qs.limit !== undefined) {
    url = url.concat("&limit=" + qs.limit);
  }
  if (qs.page !== undefined) {
    url = url.concat("&page=" + qs.page);
  }
  if (qs.select !== undefined && qs.length !== 0) {
    url = url.concat('&select=["' + qs.select.join('","') + '"]');
  }

  console.log("GET :" + url);

  let options = {
    ..._options,
    ...{
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Authorization: token,
      },

      json: true,
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .get(url, options)
      .then((response) => {
        resolve({
          response: response,
          docs: response.data.docs,
          totalDocs: response.data.totalDocs,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          page: response.data.page,
          pagingCounter: response.data.pagingCounter,
          hasPrevPage: response.data.hasPrevPage,
          hasNextPage: response.data.hasNextPage,
          prevPage: response.data.prevPage,
          nextPage: response.data.nextPage,
        });
      })
      .catch((error) => {
        /*commons.PushMsg({
          type: "error",
          msg:
            "Error getting resource(s) of type: " +
            resource_type +
            ", with filter: " +
            qs.limit +
            ". " +
            error.message,
        });*/
        reject({ error: error });
      });
  });
}

//return the login token from the localstorage
function GetToken() {
  return localStorage.getItem("token");
}

//function to request a password reset
export async function requestPasswordReset(tenant, email) {
  console.log({ email, tenant });

  const url_string = api_url + "/self/reset?tenant=" + tenant;
  const body = JSON.stringify({ email: email });
  console.log("POST password reset request:" + url_string);
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .post(url_string, body, options)
      .then((response) => {
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        reject({ error: error }); //false;
      });
  });
}

//function to reset the password from token
export async function resetPassword(tenant, token, password) {
  const url_string = api_url + "/self";
  console.log("PUT password reset:" + url_string);
  const body = JSON.stringify({
    reset: token,
    password: password,
    tenant: tenant,
  });
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .put(url_string, body, options)
      .then((response) => {
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        reject({ error: error }); //false;
      });
  });
}

//get required password strength from the API
export async function getPasswordStrength() {
  const url_string = api_url + "/types/passwordStrength";
  console.log("GET password strength:" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .get(url_string, options)
      .then((response) => {
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        reject({ error: error }); //false;
      });
  });
}

/////////////////////////////////////////
////TEST

export async function DownloadToTarget(route, filename, setNow) {
  const newHandle = await window.showSaveFilePicker({
    suggestedName: filename,
  });
  const writableStream = await newHandle.createWritable();
  return new Promise((resolve, reject) => {
    fetch(api_url + "/" + route, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Authorization: GetToken(),
      },
    })
      .then((response) => response.body)
      .then((rb) => {
        const reader = rb.getReader();

        new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(async ({ done, value }) => {
                // If there is no more data to read
                if (done) {
                  updateProgressbar(undefined);
                  setNow(GetProgressbarValue());
                  await writableStream.close();
                  controller.close();
                  return;
                }
                // Get the data and send it to the browser via the controller
                //controller.enqueue(value);
                // Check chunks by logging to the console

                updateProgressbar(value.length);
                setNow(GetProgressbarValue());
                await writableStream.write(value);
                //console.log(done, value);
                push();
              });
            }

            push();
          },
        });
      });
  });
}

export async function DownloadToBlob(route, mimetype, setNow) {
  let arr = [];
  let blob;
  return new Promise((resolve, reject) => {
    fetch(api_url + "/" + route, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Authorization: GetToken(),
      },
    })
      .then((response) => response.body)
      .then((rb) => {
        const reader = rb.getReader();

        return new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(async ({ done, value }) => {
                // If there is no more data to read
                if (done) {
                  controller.close();
                  const uint_arr = new Uint8Array(arr);
                  updateProgressbar(undefined);
                  setNow(GetProgressbarValue());
                  blob = new Blob([uint_arr], { type: mimetype });
                  resolve(blob);
                  return;
                }

                const temp = Array.from(value);
                arr = arr.concat(temp);
                updateProgressbar(value.length);
                setNow(GetProgressbarValue());
                push();
              });
            }

            push();
            return;
          },
        });
      });
  });
}
