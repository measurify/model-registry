import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import { get_generic, put_generic } from "../../services/http_operations";
import { useParams } from "react-router-dom";
import {
  areEqual,
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";

import { editFields, editFieldsSpecifier, fetchedPageData } from "../../config";

import { useNavigate } from "react-router-dom";

import { FormManager } from "../formManager/formManager";

import AppContext from "../../context";
import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";

import { versionPages, pageActions, addFields } from "../../config";

import ContentTable from "../contentTable/contentTable";

import { saveAs } from "file-saver";
import locale from "../../common/locale";

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
  //redirect hook
  const navigate = useNavigate();

  //deep copy editOption dictionary without any references
  const [values, setValues] = useState(cloneDeep(editFields[resource]));

  //keep trace of deleted elements
  const [deleted, setDeleted] = useState({});

  const [disabledFields, setDisabledFields] = useState(undefined);
  //const [mounted, setMounted] = useState(false);

  //check if is my resource
  const [isNotMine, setIsNotMine] = useState(true);

  const context = useContext(AppContext);
  const myFetched = context.fetched;
  /////////////FETCH REQUIRED RESOURCES
  /*
  const fetchData = async (res) => {
    if (myFetched.data[res] !== undefined) return;
    // get the data from the api
    try {
      const response = await get_generic(res, { limit: 100 });
      myFetched.UpdateData(
        response.docs.map((e) => e._id),
        res
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (fetchedPageData[resource] !== undefined) {
      Object.values(fetchedPageData[resource]).forEach((e) => fetchData(e));
    }
  }, []);
*/
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
      //console.log(headerVersion);
      //console.log(resource)
      setHeader(headerVersion);
      setResourceElement(response.docs[0].versions);
      setResourceEntity(response.docs[0]);
      setIsNotMine(localStorage.getItem("user-role")!=="admin"&&response.docs[0].owner &&
        localStorage.getItem("userId") !=response.docs[0].owner);
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
    fetchData(qs);
  }, []);

  //handle changes
  const handleChanges = (val, path) => {
    let tmpVals = cloneDeep(values);
    let valuesPtr = tmpVals;

    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      valuesPtr = valuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    valuesPtr[path[i]] = val;
    //check if an array is present
    if (lastIndexNumber !== -1) {
      //only string and numbers are allowed as item, with this version
      const item = typeof val === "number" ? NaN : "";
      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        editFields,
        resource,
        item
      );
    }

    setValues(tmpVals);
  };

  const handleDeleteItemArray = (path) => {
    let val = cloneDeep(values);
    let tmpPtr = val;

    let i;
    for (i = 0; i < path.length - 1; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }

    const removed = tmpPtr.splice(path[i], 1);

    const item = typeof removed[0] === "number" ? NaN : "";
    val = maintainEmptyElement(
      val,
      path.slice(0, i),
      editFields,
      resource,
      item
    );

    //save removed element into appropriate structure
    //do this only when array is on first layer of object
    if (i === 1) {
      if (deleted[path[0]] === undefined)
        deleted[path[0]] = { indexes: [], elements: [], minDel: Infinity };

      //ignore default
      if (!isDefault(removed[0])) {
        //save element (maybe not required anymore)
        deleted[path[0]].elements.push(removed[0]);
        //save index of deletion (considering the original ones)

        deleted[path[0]].indexes.push(
          path[i] >= deleted[path[0]].minDel
            ? path[i] +
                deleted[[path[0]]].indexes.filter((e) => e >= path[i]).length
            : path[i]
        );

        if (path[i] < deleted[path[0]].minDel)
          deleted[path[0]].minDel = path[i];
      }
    }

    setValues(val);
  };

  const back = (e) => {
    e.preventDefault();
    navigate("/" + resource);
  };

  const submit = async (e) => {
    e.preventDefault();

    //da fare
    let tmpValues = cloneDeep(values);
    let tmpOrig = cloneDeep(original);
    removeDefaultElements(tmpValues);
    removeDefaultElements(tmpOrig);
    let toSend = {};

    const entr = Object.entries(tmpValues);
    for (let i = 0; i < entr.length; i++) {
      const k = entr[i][0];
      const v = entr[i][1];

      //value is array
      if (Array.isArray(v)) {
        //prepare add/update/remove elements
        if (toSend[k] === undefined)
          toSend[k] = { add: [], remove: [], update: [] };

        //get original length of that array
        const origArr = [...tmpOrig[k]];
        //add removed elements (from original elements)
        if (deleted[k] !== undefined) {
          for (let i = 0; i < deleted[k].indexes.length; i++) {
            const removed = origArr.splice(deleted[k].indexes[i][0], 1)[0];
            if (removed.constructor === Object) {
              const key = Object.keys(removed)[0];
              toSend[k].remove.push(removed[key]);
            } else {
              toSend[k].remove.push(removed);
            }
          }
        }
        //check other elements
        for (let j = 0; j < tmpValues[k].length; j++) {
          if (j < origArr.length && !areEqual(tmpValues[k][j], origArr[j])) {
            //update management

            //object case
            if (tmpValues[k][j].constructor === Object) {
              const key = Object.keys(origArr[j])[0];
              toSend[k].update.push({
                [key]: origArr[j][key],
                new: tmpValues[k][j],
              });
            }
            //non object case (i.e., strings)
            else {
              //remove the old value and add the new one
              toSend[k].add.push(tmpValues[k][j]);
              toSend[k].remove.push(origArr[j]);
            }
          }
          if (j >= origArr.length) toSend[k].add.push(tmpValues[k][j]);
        }
        if (areEqual(toSend[k], { add: [], remove: [], update: [] }))
          delete toSend[k];
      }
      //value is obj
      else if (v.constructor === Object) {
        //compare both obj
      }
      //single valued prop
      else {
        //update when values are different
        if (v !== original[k]) toSend[k] = v;
      }
    }

    //end da fare

    let res;
    try {
      const resp = await put_generic(resource, toSend, id);
      res = resp.response;
      setMsg(res.statusText);
      navigate("/" + resource);
    } catch (error) {
      res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }
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

  const downloadSingle = async (identifier) => {
    try {
      const route = resource + "/" + id + "/versions/" + identifier;
      const resp = await get_generic(
        route,
        {},
        { responseType: "arraybuffer" }
      );
      //console.log(JSON.stringify(resp.response.data))
      //console.log(resp)
      //console.log(resp.response.data)

      const filename = resourceElement.find(
        (r) => r.ordinal === identifier
      ).original;
      const mimetype = resourceElement.find(
        (r) => r.ordinal === identifier
      ).mimetype;
      const blob = new Blob([resp.response.data], { type: mimetype });
      saveAs(blob, filename);
      //res = resp.response;
      //setMsg(res.statusText);
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
        Version of&nbsp;{resource.slice(0, -1)}&nbsp;
        {resourceEntity.name !== undefined ? <b>{resourceEntity.name}</b> : ""}
        &nbsp;(id:&nbsp;{id})
        {addFields["versions"] !== undefined && (
          <NavLink
            to={isNotMine?"":`/add/versions/` + resource + "/" + id}
            key={resource + "_versions_add_navlink"}
          >
            <Button
              variant={isNotMine ? "outline-secondary" : "link"}
              size="sm"
              style={{ backgroundColor: "transparent", border: 0 + "px" }}
              key={resource + "button"}
              title={isNotMine? "You cannot add versions to resources that are not yours": "Add"}
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
        <ContentTable
          resType={resource}
          header={header}
          resources={resourceElement}
          actions={actions}
          takeSingle={takeSingle}
          removeSingle={removeSingle}
          downloadSingle={downloadSingle}
          idResource={id}
          isNotMine={isNotMine}
        />
        {
          //<RenderPagination />
        }
      </main>
      {/*
      <main className="page-content">
        <FormManager
          values={values}
          resource={resource}
          functionalFields={editFields}
          disabledFields={disabledFields}
          handleChangesCallback={handleChanges}
          arrayDeleteCallback={handleDeleteItemArray}
          submitFunction={submit}
          backFunction={back}
        />
        <br />
        <font style={{ marginLeft: 5 + "px" }}>{msg}</font>
      </main>
  */}
    </div>
  );
}
