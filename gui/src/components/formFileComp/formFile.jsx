import React from "react";
import locale from "../../common/locale";
import { Button, Form, Accordion, Table } from "react-bootstrap";

export const FormFile = (props) => {
  //return "loading" if something is undefined
  /*console.log({
    submit: props.submitFunction,
    back: props.backFunction,
    setContHead: props.setContentHeader,
    setContBdy: props.setContentBody,
    setContPln: props.setContentPlain,
    setFl: props.setFile,
    contBod: props.contentBody,
    contPln: props.contentPlain,
    contHdr: props.contentHeader,
  });*/
  if (
    props.submitFunction === undefined ||
    props.backFunction === undefined ||
    props.setContentHeader === undefined ||
    props.setContentPlain === undefined ||
    props.setContentBody === undefined ||
    props.setFile === undefined ||
    props.contentBody === undefined ||
    props.contentPlain === undefined ||
    props.contentHeader === undefined
  )
    return "Loading";

  return (
    <Form onSubmit={props.submitFunction}>
      <Form.Label>
        <b>{locale().select_file}</b>
      </Form.Label>
      <Form.Control
        className="mb-3"
        type="file"
        accept={props.filePickerExtensions !== undefined ? "" : " .json"}
        label="File"
        onChange={(e) => {
          const file = e.target.files[0];
          props.setFile(file);
          const fileReader = new FileReader();

          fileReader.onloadend = () => {
            const content = fileReader.result;
            if (file.name.endsWith(".csv")) {
              //not used csv
              const regex = new RegExp("\\r", "g");
              let splitted = content.replace(regex, "").split("\n");

              props.setContentHeader(splitted[0]);
              splitted.splice(0, 1);
              props.setContentBody(splitted);
            }
            if (file.name.endsWith(".json")) {
              const content = JSON.stringify(
                JSON.parse(fileReader.result),
                null,
                4
              );              
              props.setContentPlain(content);
            }
          };
          fileReader.readAsText(file);
        }}
      />
      {props.contentBody !== null && props.contentHeader !== null && (
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>{locale().file_content}</Accordion.Header>
            <Accordion.Body style={{ overflow: "scroll", height: 70 + "vh" }}>
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    {React.Children.toArray(
                      props.contentHeader.split(",").map((h) => {
                        return <th>{h}</th>;
                      })
                    )}
                  </tr>
                </thead>
                <tbody>
                  {React.Children.toArray(
                    props.contentBody.map((e) => {
                      return (
                        <tr>
                          {React.Children.toArray(
                            e.split(",").map((h) => {
                              return <td>{h}</td>;
                            })
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
      {props.contentPlain !== null && (
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>{locale().file_content}</Accordion.Header>
            <Accordion.Body style={{ overflow: "scroll", height: 70 + "vh" }}>
              <textarea
                style={{ resize: "both" }}
                cols="120"
                rows="10"
                readOnly
                value={props.contentPlain}
              ></textarea>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
      <Button variant="primary" type="submit" key={"submit"}>
        {locale().submit}
      </Button>
      &nbsp;&nbsp;&nbsp;
      <Button variant="secondary" key={"cancel"} onClick={props.backFunction}>
        {locale().cancel}
      </Button>
    </Form>
  );
};
