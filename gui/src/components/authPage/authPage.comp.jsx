import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import { login } from "../../services/http_operations";
import { NavLink } from "react-router-dom";
import { languages } from "../../config";
import "./authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { Form, Container, Row, Col } from "react-bootstrap";
const userRef = React.createRef();
const pswRef = React.createRef();
const tenantRef = React.createRef();

const AuthPageComp = () => {
  //const { location, replace } = useHistory();
  const [msg, setMsg] = useState("");

  async function submitForm(e) {
    e.preventDefault();

    const user = userRef.current.value;
    const psw = pswRef.current.value;
    const tenant = tenantRef.current.value;

    try {
      await login(user, psw, tenant);
      window.location.replace("/");
    } catch (error) {
      console.log({ error: error.response.data });
      setMsg(error.response.data.message + " : " + error.response.data.details);
    }
  }

  return (
    <div className="auth-page">
      <div className="title-wrapper">
        <div className="title-section">Measurify</div>
        <br />
        <div className="subtitle-section">From the edge to cloud and back</div>
      </div>
      {languages.length > 1 && (
        <div className="language-wrapper">
          <LanguageSelector />
        </div>
      )}

      <br />
      <br />
      <div className="login-section">
        <h4>{locale().login}</h4>
        <Form onSubmit={submitForm}>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>{locale().username}</Form.Label>
            <Form.Control
              ref={userRef}
              type="text"
              placeholder={locale().username_suggestion}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>{locale().password}</Form.Label>
            <Form.Control
              type="password"
              ref={pswRef}
              placeholder={locale().password_suggestion}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="tenant">
            <Form.Label>{locale().tenant}</Form.Label>
            <Form.Control
              type="text"
              ref={tenantRef}
              placeholder={locale().tenant_suggestion}
            />
          </Form.Group>
          <Button variant="success" type="submit">
            {locale().submit}
          </Button>
        </Form>
        <br />
        <div style={{ color: "red" }}>{msg}</div>
        <br />
        <div className="form-row row">
          <NavLink to={`/add/tenants`}>
            <Button variant="outline-success" size="sm">
              {locale().add_tenant}
              <i
                className="fa fa-plus-circle"
                aria-hidden="true"
                title={"Add"}
                style={{
                  width: 30 + "px",
                  height: 30 + "px",
                  marginRight: 10 + "px",
                  opacity: 0.85,
                }}
              ></i>
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export const AuthPage = AuthPageComp;
