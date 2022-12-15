import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import { Button, Container, Row, Col } from "react-bootstrap";
import NotificationBar from "../notificationBar/notificationBar";
import "./horizontalNavigationBar.scss";

import locale from "../../common/locale";
import { refreshToken } from "../../services/http_operations";

import fontawesome from "@fortawesome/fontawesome";
import {
  faTimes,
  faBars,
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser,
  faCheck,
} from "@fortawesome/fontawesome-free-solid";

import { pages, languages, website_name } from "../../config";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { capitalize } from "../../services/misc_functions";

fontawesome.library.add(
  faTimes,
  faBars,
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser,
  faCheck
);

let intervalRef = React.createRef();
let loginTime = React.createRef();

let remainingSeconds = React.createRef();
let duration = React.createRef();

let role = React.createRef();
let username = React.createRef();
let tenant = React.createRef();

export default function HorizontalNavigationBar() {
  const [isOpened, setIsOpened] = useState(false);

  const usr = localStorage.getItem("username");
  const rl = localStorage.getItem("user-role");
  const tn = localStorage.getItem("user-tenant");

  username.current = usr !== null ? usr : "";
  role.current = rl !== null ? rl : "";
  tenant.current = tn !== null && tn !== "" ? tn : "-";

  //useeffect on change time
  useEffect(() => {
    //convert duration time in string format to milliseconds
    function DurationToMilliSeconds() {
      let exp = localStorage.getItem("token-expiration-time");

      if (exp === null) return 300;
      if (exp.endsWith("h")) {
        return parseInt(exp.slice(0, -1)) * 60 * 60 * 1000;
      } else if (exp.endsWith("m")) {
        return parseInt(exp.slice(0, -1)) * 60 * 1000;
      } else if (exp.endsWith("s")) {
        return parseInt(exp.slice(0, -1)) * 1000;
      }
      //default case, right now the same as seconds
      else {
        return parseInt(exp.slice(0, -1)) * 1000;
      }
    }

    //calculate remaining seconds and refresh token if required
    function CalcEnding() {
      let t0;
      let remainingSec;
      //if remaining time is already calculated, just decrement that number by 1
      if (remainingSeconds.current !== null) {
        remainingSec = remainingSeconds.current - 1;
      }
      //otherwise, calculate remaining seconds
      else {
        //check if login time is already defined, if it's null get it from localstorage or current time (refresh case)
        if (loginTime.current === null) {
          const retryLoginTime = localStorage.getItem("login-time");
          //if localstorage containst login time, use it and store it into state
          if (retryLoginTime !== null) {
            loginTime.current = retryLoginTime;
            t0 = parseInt(retryLoginTime, 10);
          }
          //otherwise get it from current time and store it into state
          else {
            t0 = Date.now();
            loginTime.current = t0;
          }
        }
        //use logintime stored into state
        else {
          t0 = parseInt(loginTime.current, 10);
        }
        if (duration.current === null)
          duration.current = DurationToMilliSeconds();
        const endTime = t0 + duration.current;

        remainingSec = (endTime - Date.now()) / 1000;
      }

      if (remainingSec < 60) {
        clearInterval(intervalRef.current);
        refreshToken().then(() => {
          remainingSeconds.current = null;
          loginTime.current = null;

          intervalRef.current = setInterval(() => {
            CalcEnding();
          }, 1000);
          return;
        });
      }
      if (remainingSec <= 0) {
        localStorage.clear();
        //session expired, automatically logout
        window.location.replace("/");
        return;
      }

      //const mins = Math.floor(remainingSec / 60);
      //const secs = Math.floor(remainingSec % 60);

      remainingSeconds.current = parseInt(remainingSec, 10);
    }

    intervalRef.current = setInterval(() => {
      CalcEnding();
    }, 1000);
  }, []);

  function logOut() {
    localStorage.clear();
    document.location.replace("/");
  }

  function renderIconRole() {
    if (role.current === "admin") {
      return (
        <i className="fa fa-user-tie" aria-hidden="true" title="Admin"></i>
      );
    } else if (role.current === "provider") {
      return (
        <i
          className="fa fa-user-graduate"
          aria-hidden="true"
          title="Provider"
        ></i>
      );
    } else if (role.current === "analyst") {
      return (
        <i className="fa fa-user-cog" aria-hidden="true" title="Analyst"></i>
      );
    } else if (role.current === "supplier") {
      return (
        <i className="fa fa-user-tag" aria-hidden="true" title="Supplier"></i>
      );
    } else {
      return (
        <i className="fa fa-user" aria-hidden="true" aria-label="User"></i>
      );
    }
  }

  return (
    <nav className="horizontal-nav">
      <div className="horizontal-nav-links">
        <div className="data-wrapper">
          <Container fluid>
            <Row style={{ padding: 0 }}>
              <Col>
                <NavLink to="/home" className="nav-wrap">
                  {website_name}
                </NavLink>
              </Col>
              <Col>
                <NavLink to={`/viewProfile/`} key={`viewProfile`}>
                  {locale().welcome + " "}
                  <b>{username.current}</b>
                </NavLink>
              </Col>
              <Col>
                <div className="horizontal-nav-text">
                  {locale().role + " "}
                  {renderIconRole()}
                </div>
              </Col>
              <Col>
                <div className="horizontal-nav-text">
                  {locale().tenant + " "}
                  <b>{tenant.current}</b>
                </div>
              </Col>
              <Col>
                <Button variant="outline-danger" onClick={() => logOut()}>
                  {locale().logout}
                </Button>
              </Col>

              {languages.length > 1 && (
                <Col>
                  <LanguageSelector />
                </Col>
              )}
              <Col>
                <NotificationBar />
              </Col>
            </Row>
            <Row style={{ padding: 0 }}>
              <hr />
              <div
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "flex-start",
                }}
              >
                {locale().tools}
              </div>
            </Row>
            <Row style={{ padding: 0 }}>
              {React.Children.toArray(
                Object.keys(pages).map((k) => {
                  return (
                    <Col>
                      <NavLink
                        to={`/` + k}
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                        //activeClassName="active"
                        key={k}
                        onClick={() => setIsOpened(false)}
                      >
                        {capitalize(k)}
                      </NavLink>
                    </Col>
                  );
                })
              )}
            </Row>
          </Container>
        </div>
      </div>
    </nav>
  );
}
