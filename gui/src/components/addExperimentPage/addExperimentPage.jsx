import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import { addFields, addTypes } from "../../config";
import {
  post_generic,
  get_generic,
  post_file_generic,
} from "../../services/http_operations";
import {
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { Form, Nav } from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";

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

export default function AddExperimentPage(props) {
  //get resource and id from url params
  const resource = "experiments";
  //get from attribute from search param

  const [searchParams, setSearchParams] = useSearchParams();

  //redirect hook
  const navigate = useNavigate();
  //type of input to post resources
  const [postType, setPostType] = useState("form");
  //message for user
  const [msg, setMsg] = useState("");
  //values
  const [values, setValues] = useState(cloneDeep(addFields[resource]));
  //disabled
  const [disabledFields, setDisabledFields] = useState({});

  //protocols
  const [protocols, setProtocols] = useState();

  //file upload state
  const [file, setFile] = useState(undefined);
  const [contentHeader, setContentHeader] = useState(null);
  const [contentBody, setContentBody] = useState(null);
  const [contentPlain, setContentPlain] = useState(null);

  //useeffect to get resource if required
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      // get the protocols data from the api
      const response = await get_generic("protocols", qs);

      setProtocols(response.docs.map((e) => e._id));
    };
    const qs = { limit: 100 };
    fetchData(qs);
  }, [props, searchParams]);

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
    if (typeof path[i] === "number") lastIndexNumber = i;
    valuesPtr[path[i]] = val;
    //check if an array is present
    if (lastIndexNumber !== -1) {
      //only string and numbers are allowed as item, with this version
      const item = typeof val === "number" ? NaN : "";
      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        addFields,
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
      addFields,
      resource,
      item
    );
    setValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => setPostType(eventKey);

  //handle changes to selected protocols
  const handleProtocolChange = async (e) => {
    e.preventDefault();
    const selectedProtocol = e.target.value;
    const fst = { _id: e.target.value };
    const qs = { filter: JSON.stringify(fst) };
    const res = await get_generic("protocols", qs);
    const protocol = res.docs[0];

    const metadata = [];
    for (let i = 0; i < protocol.metadata.length; i++) {
      if (protocol.metadata[i].type === "scalar") {
        metadata.push({
          name: protocol.metadata[i].name,
          value: NaN,
        });
      }
      if (protocol.metadata[i].type === "text") {
        metadata.push({
          name: protocol.metadata[i].name,
          value: "",
        });
      }
      if (protocol.metadata[i].type === "vector") {
        metadata.push({
          name: protocol.metadata[i].name,
          value: [NaN],
        });
      }
    }

    const tmpValues = cloneDeep(values);
    tmpValues["protocol"] = selectedProtocol;
    if (metadata.length !== 0) tmpValues["metadata"] = metadata;

    const tmpDisabled = cloneDeep(disabledFields);
    tmpDisabled["protocol"] = true;

    setDisabledFields(tmpDisabled);
    //setProtocol(selectedProtocol);
    setValues(tmpValues);
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
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }

    if (res.status === 200) {
      if (window.confirm("Back to resource page?") === true) {
        if (resource === "tenants") navigate("/");
        else navigate("/" + resource);
      } else {
      }
    }
  };

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const postFile = async (e) => {
    e.preventDefault();
    let res;
    if (file.name.endsWith(".csv")) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await post_file_generic(resource, formData);

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
    }
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
    }

    if (res.status === 200) {
      if (window.confirm("Back to resource page?") === true) {
        navigate("/" + resource);
      } else {
      }
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        Add resource &nbsp;
        <b>{resource}</b>
      </header>
      <main className="page-content">
        <Nav
          justify
          variant="tabs"
          className="justify-content-center"
          onSelect={handleTypeSelect}
          defaultActiveKey="form"
        >
          {addTypes[resource].includes("form") && (
            <Nav.Item>
              <Nav.Link eventKey="form">Form</Nav.Link>
            </Nav.Item>
          )}

          {addTypes[resource].includes("file") &&
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
          {postType === "form" && protocols !== undefined && (
            <div style={{ margin: 5 + "px" }}>
              <Form.Select
                aria-label={locale().select + " protocol"}
                onChange={handleProtocolChange}
              >
                <option>{locale().select} protocol</option>
                {React.Children.toArray(
                  protocols.map((e) => {
                    return <option value={e}>{e}</option>;
                  })
                )}
              </Form.Select>
              <br />
              <FormManager
                values={values}
                resource={resource}
                functionalFields={addFields}
                disabledFields={disabledFields}
                handleChangesCallback={handleChanges}
                arrayDeleteCallback={handleDeleteItemArray}
                submitFunction={postBody}
                backFunction={back}
              />

              <br />

              <font style={{ marginLeft: 5 + "px" }}>{msg}</font>
            </div>
          )}
          {postType === "file" && (
            <div style={{ margin: 5 + "px" }}>
              <FormFile
                submitFunction={postFile}
                backFunction={back}
                setContentBody={setContentBody}
                setContentHeader={setContentHeader}
                setContentPlain={setContentPlain}
                setFile={setFile}
                contentPlain={contentPlain}
                contentHeader={contentHeader}
                contentBody={contentBody}
              />
              <font style={{ marginLeft: 5 + "px" }}>{msg}</font>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
