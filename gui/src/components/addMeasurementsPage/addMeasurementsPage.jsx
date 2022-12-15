import React, { useEffect, useState, useContext } from "react";
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

import {
  Form,
  Nav,
  Container,
  Row,
  Col,
  Button,
  Accordion,
} from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import AppContext from "../../context";
import { fetchedPageData } from "../../config";
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

export default function AddMeasurementsPage(props) {
  //get resource and id from url params
  const resource = "measurements";
  //get from attribute from search param

  const [searchParams, setSearchParams] = useSearchParams();
  const [samples, setSamples] = useState([]);
  const [items, setItems] = useState([]);

  //redirect hook
  const navigate = useNavigate();
  //type of input to post resources
  const [postType, setPostType] = useState("form");
  //message for user
  const [msg, setMsg] = useState("");
  //formValues
  const [formValues, setFormValues] = useState(cloneDeep(addFields[resource]));
  //disabled
  const [disabledFields, setDisabledFields] = useState({});

  //protocols
  const [features, setFeatures] = useState();
  const [feature, setFeature] = useState("");

  //file upload state
  const [file, setFile] = useState(undefined);
  const [contentHeader, setContentHeader] = useState(null);
  const [contentBody, setContentBody] = useState(null);
  const [contentPlain, setContentPlain] = useState(null);

  const context = useContext(AppContext);
  const myFetched = context.fetched;

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
      // get the protocols data from the api
      try {
        const response = await get_generic("features", qs);

        setFeatures(response.docs.map((e) => e._id));
      } catch (error) {
        console.log(error);
      }
    };
    const qs = { limit: 100 };
    fetchData(qs);
  }, [props, searchParams]);

  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

  //handle changes
  const handleChanges = (val, path) => {
    let tmpVals = cloneDeep(formValues);
    let formValuesPtr = tmpVals;

    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      formValuesPtr = formValuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    formValuesPtr[path[i]] = val;
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
    setFormValues(tmpVals);
  };

  const handleDeleteItemArray = (path) => {
    let val = cloneDeep(formValues);
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
    setFormValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => setPostType(eventKey);

  //handle changes to selected feature
  const handleFeatureChange = async (e) => {
    e.preventDefault();
    const selectedFeature = e.target.value;
    const fst = { _id: selectedFeature };
    const qs = { filter: JSON.stringify(fst) };
    const res = await get_generic("features", qs);
    const feature = res.docs[0];

    const items = feature.items;

    const samples = [];
    const tmp = addSample(samples, items);
    setSamples(tmp);
    setItems(items);
    setFeature(selectedFeature);
    return;
  };

  const addSample = (samples, items) => {
    const values = [];
    const tmpSample = cloneDeep(samples);
    items.forEach((item) => {
      if (item.type === "number") {
        if (item.dimension === 0)
          values.push({ name: item.name, value: NaN, type: item.type });
        else values.push([{ name: item.name, value: NaN, type: item.type }]);
      } else if (item.type === "text") {
        if (item.dimension === 0)
          values.push({ name: item.name, value: "", type: item.type });
        else values.push([{ name: item.name, value: "", type: item.type }]);
      } else if (item.type === "enum") {
        if (item.dimension === 0)
          values.push({
            name: item.name,
            value: "",
            enumValues: item.range,
            type: item.type,
          });
        else
          values.push([
            {
              name: item.name,
              value: "",
              enumValues: item.range,
              type: item.type,
            },
          ]);
      }
    });
    tmpSample.push({ values: values });
    return tmpSample;
  };

  //post the body for forms
  const postBody = async (e) => {
    e.preventDefault();
    //deep clone formValues
    let token = undefined;
    let body = cloneDeep(formValues);
    console.log(samples);
    let tmpSamples = samples.map((sample) => {
      return { values: sample.values.map((v) => v.value) };
    });
    if (body.token !== undefined) {
      token = body.token;
      delete body.token;
    }
    removeDefaultElements(body);
    body["feature"] = feature;
    body["samples"] = tmpSamples;
    //let tmpformValues = cloneDeep(body);

    let res;
    try {
      const resp = await post_generic(resource, JSON.stringify(body), token);
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
          {postType === "form" && features !== undefined && (
            <div style={{ margin: 5 + "px" }}>
              <Form.Select
                aria-label={locale().select + " feature"}
                onChange={handleFeatureChange}
                value={feature}
              >
                <option>{locale().select} feature</option>
                {React.Children.toArray(
                  features.map((e) => {
                    return <option value={e}>{e}</option>;
                  })
                )}
              </Form.Select>
              <hr />
              <Container fluid>
                <Row>
                  <b>Samples :{samples.length}</b>
                </Row>
                <br />
                {React.Children.toArray(
                  samples.map((sample, i) => {
                    return (
                      <Row
                        style={{
                          padding: 10,
                        }}
                      >
                        <Accordion defaultActiveKey="0">
                          <Accordion.Item eventKey={i}>
                            <Accordion.Header>
                              <b>
                                <i>Sample [{i}]</i>
                              </b>
                            </Accordion.Header>
                            <Accordion.Body>
                              {React.Children.toArray(
                                Object.values(sample.values).map((entr) => {
                                  return (
                                    <Row
                                      style={{
                                        borderBottomStyle: "solid",
                                        borderBottomWidth: 1 + "px",
                                        marginBottom: 5 + "px",
                                        padding: 10,
                                      }}
                                    >
                                      <Col
                                        sm={2}
                                        style={{
                                          borderRightStyle: "dotted",
                                          borderRightWidth: 1 + "px",
                                        }}
                                      >
                                        <b>
                                          <i>{entr.name}</i>
                                        </b>
                                      </Col>
                                      <Col sm={2}>
                                        {entr.type === "enum" ? (
                                          <Form.Select
                                            aria-label={
                                              locale().select + " " + entr.name
                                            }
                                            //value={entr.value}
                                            onChange={(e) => {
                                              e.preventDefault();
                                              entr.value = e.target.value;
                                            }}
                                          >
                                            <option value="">
                                              {locale().select +
                                                " " +
                                                entr.name}
                                            </option>
                                            {React.Children.toArray(
                                              entr.enumValues.map((e) => {
                                                return (
                                                  <option value={e}>{e}</option>
                                                );
                                              })
                                            )}
                                          </Form.Select>
                                        ) : entr.type === "text" ? (
                                          <Form.Control
                                            type="text"
                                            //value={entr.value}
                                            id={entr.name}
                                            onChange={(e) => {
                                              e.preventDefault();
                                              entr.value = e.target.value;
                                            }}
                                            aria-label={
                                              locale().enter + " " + entr.name
                                            }
                                          />
                                        ) : (
                                          <Form.Control
                                            type="number"
                                            id={entr.name}
                                            //value={isNaN(entr.value) ? "" : entr.value}
                                            onChange={(e) => {
                                              e.preventDefault();
                                              entr.value = parseInt(
                                                e.target.value,
                                                10
                                              );
                                            }}
                                            aria-label={
                                              locale().enter + " " + entr.name
                                            }
                                          />
                                        )}
                                      </Col>
                                    </Row>
                                  );
                                })
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Row>
                    );
                  })
                )}
                {samples.length !== 0 && (
                  <Button
                    variant="link"
                    onClick={() => {
                      const sampl = addSample(samples, items);
                      setSamples(sampl);
                    }}
                  >
                    <i
                      className="fa fa-plus-circle"
                      aria-hidden="true"
                      title={"Add sample"}
                      style={{
                        width: 30 + "px",
                        height: 30 + "px",
                        marginRight: 10 + "px",
                        opacity: 0.85,
                      }}
                    ></i>
                  </Button>
                )}
              </Container>
              <hr />
              <br />
              <FormManager
                values={formValues}
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
