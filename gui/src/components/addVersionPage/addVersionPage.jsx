import React, { useEffect, useState, useContext } from "react";
import { addFields, addTypes } from "../../config";
import {
  post_generic,
  get_generic,
  post_version_file_generic,
} from "../../services/http_operations";
import locale from "../../common/locale";
import {
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Nav } from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";
import AppContext from "../../context";
import { fetchedPageTypes, fetchedPageData } from "../../config";

const cloneDeep = require("clone-deep");

/*
APPUNTI FORM

 <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              TEXT
            </Form.Label>
            <Form.Control type="text" placeholder="PLACEHOLDER TEXT" />
            <Form.Text className="text-muted">
              LABEL
            </Form.Text>
          </Form.Group>

tipi consentiti nel form control:
text | number (verifica del numero automatica) | email (verifica email automatica) | file | checkbox

*/

export default function AddVersionsPage(props) {
  //get resource and id from url params
  let { type, resource, id } = useParams();
  //get from attribute from search param

  const [searchParams, setSearchParams] = useSearchParams();

  //info about entity
  const [resourceEntity, setResourceEntity] = useState({});

  //check if resource was passed as params - used for tenants creation
  if (props.resource !== undefined) resource = props.resource;

  //redirect hook
  const navigate = useNavigate();
  //type of input to post resources
  const [postType, setPostType] = useState(addTypes[type][0]);
  //message for user
  const [msg, setMsg] = useState("");  
  const [isError, setIsError] = useState(false);
  //deep copy addOption dictionary without any references
  const [values, setValues] = useState(cloneDeep(addFields[type]));

  //file upload state
  const [file, setFile] = useState(undefined);
  const [contentHeader, setContentHeader] = useState(null);
  const [contentBody, setContentBody] = useState(null);
  const [contentPlain, setContentPlain] = useState(null);

  const context = useContext(AppContext);
  let myFetched;
  if (context !== undefined) myFetched = context.fetched;
  else myFetched = {};

  /////////////FETCH REQUIRED RESOURCES
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

  //useeffect to get resource if required
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      // get the data from the api
      const response = await get_generic(resource, qs);

      const data = response.docs[0];
      setResourceEntity(response.docs[0]);
      let tmpValues = cloneDeep(values);

      tmpValues = sortObject(data, tmpValues);

      tmpValues = maintainEmptyElements(tmpValues, addFields, resource);
      setValues(tmpValues);
    };

    const fst = { _id: id };
    const qs = { filter: JSON.stringify(fst) };
    fetchData(qs);
  }, [resource]);

  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

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
    valuesPtr[path[i]] = val;
    if (typeof path[i] === "number") lastIndexNumber = i;

    if (lastIndexNumber !== -1)
      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        addFields,
        resource
      );

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

    tmpPtr.splice(path[i], 1);

    val = maintainEmptyElement(val, path.slice(0, i), addFields, resource);
    setValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => {setIsError(false);setMsg("");setPostType(eventKey)};

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  //post the body for forms
  const postBody = async (e) => {
    e.preventDefault();
    //deep clone values
    let token = undefined;
    let body = cloneDeep(values);
    if (body.token !== undefined) {
      token = body.token;
      delete body.token;
    }

    let tmpValues = cloneDeep(body);
    removeDefaultElements(tmpValues);
    let res;
    try {
      const resp = await post_generic(
        resource,
        JSON.stringify(tmpValues),
        token
      );
      res = resp.response;
      setMsg(res.statusText);
    } catch (error) {
      console.log(error);
      res = error.error.response;
      //add details
      setIsError(true);
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }

    if (res.status === 200) {
      setIsError(false);
      window.alert("Version uploaded successfully");
      navigate("/" + type + "/" + resource + "/" + id);
    }
  };

  const postVersionFile = async (e) => {
    e.preventDefault();
    let res;
    if (file === undefined) {
      setMsg(locale().no_file);
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await post_version_file_generic(resource, id, formData);
      res = resp.response;
      setIsError(false);
      setMsg(res.statusText);
    } catch (error) {
      console.log(error);

      res = error.error.response;
      //add details
      setIsError(true);
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }
    /*
    if (file.name.endsWith(".json")) {
      try {
        const resp = await post_generic(resource, contentPlain, undefined);
        res = resp.response;
        setMsg(res.statusText);
      } catch (error) {
        console.log(error);
        res = error.error.response;
        //add details
        setMsg(
          error.error.response.data.message +
            " : " +
            error.error.response.data.details
        );
      }
    }*/

    if (res.status === 200) {
      window.alert("Version uploaded successfully");
      navigate("/" + type + "/" + resource + "/" + id);
    }
  };
  return (
    <div className="page">
      <header className="page-header">
        Add version of&nbsp;
        {resource.slice(0, -1)}
        :&nbsp;
        {resourceEntity.name !== undefined ? <b>{resourceEntity.name}</b> : ""}
      </header>
      <main className="page-content">
        <Nav
          justify
          variant="tabs"
          className="justify-content-center"
          onSelect={handleTypeSelect}
          defaultActiveKey={addTypes[type][0]}
        >
          {addTypes[type].includes("form") && (
            <Nav.Item>
              <Nav.Link eventKey="form">Form</Nav.Link>
            </Nav.Item>
          )}

          {addTypes[type].includes("file") &&
            searchParams.get("from") === null && (
              <Nav.Item>
                <Nav.Link eventKey="file">File</Nav.Link>
              </Nav.Item>
            )}
        </Nav>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 2 + "px",
            borderStyle: "solid",
            borderColor: "rgba(18, 54, 81, 0.9)",
            borderWidth: 1 + "px",
            width: 100 + "%",
            height: "fit-content",
          }}
        >
          {postType === "form" && (
            <div style={{ margin: 5 + "px" }}>
              <FormManager
                values={values}
                resource={resource}
                functionalFields={addFields}
                disabledFields={{}}
                handleChangesCallback={handleChanges}
                arrayDeleteCallback={handleDeleteItemArray}
                submitFunction={postBody}
                backFunction={back}
              />

              <br />
              <font style={{ marginLeft: 5 + "px" ,color: isError ? "red" : "black"}}>{msg}</font>
            </div>
          )}
          {postType === "file" && (
            <div style={{ margin: 5 + "px" }}>
              <FormFile
                submitFunction={postVersionFile}
                backFunction={back}
                setContentBody={setContentBody}
                setContentHeader={setContentHeader}
                setContentPlain={setContentPlain}
                setFile={setFile}
                contentPlain={contentPlain}
                contentHeader={contentHeader}
                contentBody={contentBody}
                filePickerExtensions={""}
              />
              <font style={{ marginLeft: 5 + "px" ,color: isError ? "red" : "black"}}>{msg}</font>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
