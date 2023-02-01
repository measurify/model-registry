import React from "react";
import { aliasPages } from "../../config";

import { Table } from "react-bootstrap";
import ActionManager from "../actionsManager/actionsManager";
import { FormatDate, FormatMetadata } from "../../services/misc_functions";

export default function ContentTable(props) {
  if (props.header === undefined || props.resources === undefined)
    return <div>Loading</div>;
  if (props.header.includes("actions") && props.actions === undefined)
    return <div>Loading</div>;
  return (
    <div>
      <Table responsive striped bordered hover>
        <thead>
          <tr key={"header"}>
            {React.Children.toArray(
              props.header.map((e) => {
                if (aliasPages[props.resType] !== undefined)
                  if (aliasPages[props.resType][e] !== undefined)
                    return <th>{aliasPages[props.resType][e]}</th>;
                return <th>{e}</th>;
              })
            )}
          </tr>
        </thead>
        <tbody>
          {React.Children.toArray(
            props.resources.map((row, index) => {
              return (
                <tr>
                  {React.Children.toArray(
                    props.header.map((e) => {
                      if (e === "actions") {
                        return (
                          <td>
                            {props.actions.includes("view") ? (
                              <ActionManager
                                resType={props.resType}
                                action="view"
                                k={index + "_view"}
                                id={row["_id"]}
                                takeSingle={props.takeSingle}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("downloadVersion") ? (
                              <ActionManager
                                resType={props.resType}
                                action="downloadVersion"
                                k={index + "_downloadVersion"}
                                idResource={props.idResource}
                                id={row["ordinal"]}
                                downloadSingle={props.downloadSingle}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("edit") ? (
                              <ActionManager
                                resType={props.resType}
                                action="edit"
                                k={index + "_edit"}
                                id={row["_id"]}
                                disabled={row.owner&&localStorage.getItem("user-role")!=="admin"&&row.owner!=localStorage.getItem("userId")}
                                //takeSingle={props.takeSingle}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("duplicate") ? (
                              <ActionManager
                                resType={props.resType}
                                action="duplicate"
                                k={index + "_duplicate"}
                                id={row["_id"]}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("versioning") ? (
                              <ActionManager
                                resType={props.resType}
                                action="versioning"
                                id={row["_id"]}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("delete") ? (
                              <ActionManager
                                resType={props.resType}
                                action="delete"
                                k={index + "_delete"}
                                id={row["_id"]}
                                removeSingle={props.removeSingle}
                                disabled={row.owner&&localStorage.getItem("user-role")!=="admin"&&row.owner!=localStorage.getItem("userId")}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("deleteVersion") ? (
                              <ActionManager
                                resType={props.resType}
                                action="deleteVersion"
                                k={index + "_deleteVersion"}
                                idResource={props.idResource}
                                id={row["ordinal"]}
                                removeSingle={props.removeSingle}
                                disabled={props.isNotMine}  
                                                              
                              />
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      }
                      if (row[e] === undefined) return (<td>--undefined--</td>);
                      if (Array.isArray(row[e])) {
                        if (
                          row[e][0] !== undefined &&
                          row[e][0].constructor === Object
                        ) {                          
                          if (e === "metadata") {
                            return <td>{FormatMetadata(row[e])}</td>;
                          }
                          const str =
                            "[ " +
                            row[e]
                              .map((el) =>
                                Object.entries(el)
                                  .map((e) => e[0] + " : " + e[1])
                                  .join(" - ")
                              )
                              .join(" -- ") +
                            " ]";
                          return (
                            <td>
                              {str.length <= 100
                                ? str
                                : str.slice(0, 97) + "..."}
                            </td>
                          );
                        }
                        return <td>{"[ " + row[e].join(" , ") + " ]"}</td>;
                      }
                      if (e === "date" || e === "timestamp")
                        return <td>{FormatDate(row[e])}</td>;
                      return <td>{row[e]}</td>;
                    })
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
