import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Button, ProgressBar } from "react-bootstrap";
import {
  get_generic,
  DownloadToTarget,
  DownloadToBlob,
} from "../../services/http_operations";
import { useParams } from "react-router-dom";

import { editFields, editFieldsSpecifier, fetchedPageData } from "../../config";

import { useNavigate } from "react-router-dom";

import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";

import { versionPages, pageActions, addFields } from "../../config";

import ContentTable from "../contentTable/contentTable";

import { saveAs } from "file-saver";
import locale from "../../common/locale";
import {
  resetProgressbar,
  updateProgressbar,
  GetProgressbarValue,
} from "../../services/progressbar_manager";
const cloneDeep = require("clone-deep");

export default function VersioningPage(props) {
  //get resource and id from url params
  const { resource, id } = useParams();

  const [resourceElement, setResourceElement] = useState(undefined);
  const [resourceEntity, setResourceEntity] = useState({});
  const [header, setHeader] = useState(undefined);
  const [actions, setActions] = useState(undefined);

  const [original, setOriginal] = useState();

  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const [now, setNow] = useState(undefined);

  //redirect hook
  const navigate = useNavigate();

  //deep copy editOption dictionary without any references
  const [values, setValues] = useState(cloneDeep(editFields[resource]));

  const [disabledFields, setDisabledFields] = useState(undefined);
  //const [mounted, setMounted] = useState(false);

  //check if is my resource
  const [isNotMine, setIsNotMine] = useState(true);

  //useeffect to get resource if required
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      // get the data from the api
      const response = await get_generic(resource, qs);

      const data = response.docs[0];
      //console.log(data.versions);
      let tmpValues = cloneDeep(values);

      tmpValues = sortObject(data, tmpValues);

      // set state with the result
      const headerVersion = versionPages[resource];

      setHeader(headerVersion);
      setResourceElement(response.docs[0].versions);
      setResourceEntity(response.docs[0]);
      setIsNotMine(
        localStorage.getItem("user-role") !== "admin" &&
          response.docs[0].owner &&
          localStorage.getItem("userId") != response.docs[0].owner
      );
      if (pageActions[resource + "Version"] !== undefined)
        setActions(pageActions[resource + "Version"]);

      //this function evaluate if a field should be disabled or not
      const evaluateSpecifiers = async () => {
        if (editFieldsSpecifier[resource] === undefined) {
          setDisabledFields({});

          const keys = Object.keys(tmpValues);
          for (let i = 0; i < keys.length; i++) {
            const _key = keys[i];

            tmpValues = maintainEmptyElement(
              tmpValues,
              [_key],
              editFields,
              resource
            );
          }

          setValues(tmpValues);
          //deep copy and set state
          setOriginal(cloneDeep(tmpValues));
          return;
        }

        let disabled = {};
        if (disabledFields !== undefined) disabled = disabledFields;

        const specsEntries = Object.entries(editFieldsSpecifier[resource]);

        for (let i = 0; i < specsEntries.length; i++) {
          const key = specsEntries[i][0]; //key
          const value = specsEntries[i][1]; //value

          if (tmpValues[key] === undefined) continue;

          if (value.type === "disable") {
            const resp = await value.policy(id);

            disabled[key] = resp;
          }
        }

        const keys = Object.keys(tmpValues);
        for (let i = 0; i < keys.length; i++) {
          const _key = keys[i];

          if (disabled[_key] === undefined || disabled[_key] === false) {
            tmpValues = maintainEmptyElement(
              tmpValues,
              [_key],
              editFields,
              resource
            );
          }
        }

        setDisabledFields(disabled);

        setValues(tmpValues);
        //deep copy and set state
        setOriginal(cloneDeep(tmpValues));
      };

      evaluateSpecifiers();
    };

    const fst = { _id: id };
    const qs = { filter: JSON.stringify(fst) };
    resetProgressbar();
    fetchData(qs);
  }, []);

  const back = (e) => {
    e.preventDefault();
    navigate("/" + resource);
  };

  const takeSingle = (id) => {
    return resourceElement.find((r) => r.ordinal === id);
  };

  const removeSingle = (id) => {
    let tmp = resourceElement.filter((el) => {
      return el.ordinal !== id;
    });
    setResourceElement(tmp);
  };

  const download = async (identifier) => {
    let browser;
    const sizeLimit = 2000000000;

    if (
      (navigator.userAgent.indexOf("Opera") ||
        navigator.userAgent.indexOf("OPR")) != -1
    ) {
      browser = "opera";
    } else if (navigator.userAgent.indexOf("Edg") != -1) {
      browser = "edge";
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
      browser = "chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
      browser = "safari";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      browser = "firefox";
    } else if (
      navigator.userAgent.indexOf("MSIE") != -1 ||
      !!document.documentMode == true
    ) {
      //IF IE > 10
      browser = "ie";
    } else {
      browser = "unknown";
    }


    const picked = resourceElement.find((r) => r.ordinal === identifier);
    const filename = picked.original;
    const mimetype = picked.mimetype;
    const size = picked.size;

    switch (browser) {
      case "chrome":
      case "edge":
      case "opera":
        updateProgressbar(0, size);
        downloadNewSingle(identifier, filename);
        break;
      case "firefox":
      case "ie":
      case "safari":
      default:
        if (size > sizeLimit) {
          alert("This browser does not support the download of large files");
          return;
        }
        updateProgressbar(0, size);
        downloadOldSingle(identifier, filename, mimetype);
    }
  };

  const downloadOldSingle = async (identifier, filename, mimetype) => {
    try {
      const route = resource + "/" + id + "/versions/" + identifier;

      setIsError(false);
      setMsg("Downloading " + filename + "...");
      const blob = await DownloadToBlob(route, mimetype, setNow);

      saveAs(blob, filename);
      setIsError(false);
      setMsg(filename + " downloaded successfully");
    } catch (error) {
      console.log(error);

      //res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }
  };

  const downloadNewSingle = async (identifier, filename) => {
    try {
      const route = resource + "/" + id + "/versions/" + identifier;
      setIsError(false);
      setMsg("Downloading " + filename + "...");
      const response =await DownloadToTarget(route, filename, setNow);
      setIsError(false);
      setMsg(filename + " downloaded successfully");
    } catch (error) {
      console.log(error);

      //res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        Versions of&nbsp;{resource.slice(0, -1)}&nbsp;
        {resourceEntity.name !== undefined ? <b>{resourceEntity.name}</b> : ""}
        &nbsp;
        {addFields["versions"] !== undefined && (
          <NavLink
            to={isNotMine ? "" : `/add/versions/` + resource + "/" + id}
            key={resource + "_versions_add_navlink"}
          >
            <Button
              variant={isNotMine ? "outline-secondary" : "link"}
              size="sm"
              style={{ backgroundColor: "transparent", border: 0 + "px" }}
              key={resource + "button"}
              title={
                isNotMine
                  ? "You cannot add versions to resources that are not yours"
                  : "Add"
              }
            >
              <i
                key={resource + "icon"}
                className="fa fa-plus-circle"
                aria-hidden="true"
                style={{
                  width: 30 + "px",
                  height: 30 + "px",
                  marginRight: 10 + "px",
                  opacity: 0.85,
                }}
              ></i>
            </Button>
          </NavLink>
        )}
      </header>
      <main className="page-content">
        <div style={{ paddingBottom: 10 + "px" }}>
          <Button variant="outline-primary" onClick={back}>
            Back to {resource}
          </Button>
        </div>
        <font
          style={{
            marginLeft: 5 + "px",
            color: isError ? "red" : "black",
          }}
        >
          {msg}
        </font>
        {now !== undefined && <ProgressBar variant={now===100? "success":"primary"} now={now} label={`${now}%`} />}
        <br />
        <ContentTable
          resType={resource}
          header={header}
          resources={resourceElement}
          actions={actions}
          takeSingle={takeSingle}
          removeSingle={removeSingle}
          downloadSingle={download}
          idResource={id}
          isNotMine={isNotMine}
        />
      </main>
    </div>
  );
}
