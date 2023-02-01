import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import {
  resetPassword,
  getPasswordStrength,
} from "../../services/http_operations";
import { NavLink } from "react-router-dom";
import { languages } from "../../config";
import "../authPage/authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { Form, Container, Row, Col } from "react-bootstrap";
import LogoHolder from "../logoHolder/logoHolder";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { passwordStrength } from "check-password-strength";
const tenantRef = React.createRef();
const pswRef = React.createRef();
const pswConfirmRef = React.createRef();

export default function PasswordResetPage() {
  //const { location, replace } = useHistory();
  const [msg, setMsg] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token"));  
  const [isError, setIsError] = useState(false);

  //redirect hook
  const navigate = useNavigate();

  const go_login = () => {
    navigate("/");
  };

  async function submitForm(e) {
    e.preventDefault();

    let requiredStr;
    try {
      const res = await getPasswordStrength();
      requiredStr = res.response.data.passwordStrength;
    } catch (error) {     
      console.log(error);
      //Required password strength cannot be acquired from the server, use the default
      requiredStr = 1;
    }

    const tenant = tenantRef.current.value;
    const psw = pswRef.current.value;
    const pswConfirm = pswConfirmRef.current.value;

    if (psw === "" || pswConfirm === "") {
      setMsg(locale().pass_not_null);
      setIsError(true);
      return;
    }

    if (psw !== pswConfirm) {
      setMsg(locale().pass_not_match);
      setIsError(true);
      return;
    }
    if (tenant === "") {
      setMsg(locale().missing_email);
      setIsError(true);
      return;
    }
    if (token === "" || token == undefined) {
      setMsg(locale().missing_token);
      setIsError(true);
      return;
    }
    const pswDetails = passwordStrength(psw);

    if (pswDetails.id < requiredStr) {
      setMsg(locale().stronger_password_required);
      setIsError(true);
      return;
    }
    //console.log(pswDetails.id);

    try {
      const resp = await resetPassword(tenant, token, psw);
      if (resp.response.status === 200) {setIsError(false);setMsg(locale().password_changed);}
      else {setIsError(true);setMsg(locale().password_not_changed_errors);}
    } catch (error) {
      setIsError(true);
      console.log(error);
      if (error.error.message === "Network Error") {
        setMsg(locale().network_error);
        return;
      }
      setMsg(error.error.response.data.message + " : " + error.error.response.data.details);
    }
  }

  return (
    <div className="auth-page">
      <div className="title-wrapper">
        <LogoHolder />
      </div>
      {languages.length > 1 && (
        <div className="language-wrapper">
          <LanguageSelector />
        </div>
      )}
      <br />
      <br />
      <div className="login-section">
        <Form onSubmit={submitForm}>
          <Container fluid>
            <Row>
              <Col>
                <h4>{locale().password_reset}</h4>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="tenant">
                  <Form.Label>{locale().tenant}</Form.Label>
                  <Form.Control
                    ref={tenantRef}
                    type="text"
                    placeholder={locale().tenant_suggestion}
                  />
                </Form.Group>
              </Col>
            </Row>{" "}
            {(searchParams.get("token") === null ||
              searchParams.get("token") === "") && (
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="token">
                    <Form.Label>Token</Form.Label>
                    <Form.Control
                      onChange={(e) => {
                        e.preventDefault();
                        setToken(e.target.value);
                      }}
                      type="text"
                      placeholder={locale().enter + " token"}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="tenant">
                  <Form.Label>{locale().password}</Form.Label>
                  <Form.Control
                    ref={pswRef}
                    type="password"
                    placeholder={locale().enter + " new password"}
                  />
                  <Form.Text className="text-muted">
                    {locale().password_rules}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Control
                    type="password"
                    ref={pswConfirmRef}
                    placeholder={locale().repeat + " new password"}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button variant="success" type="submit">
                  {locale().submit}
                </Button>{" "}
                &nbsp;&nbsp;&nbsp;
                <Button variant="secondary" onClick={go_login}>
                  {locale().go_login_page}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <div style={{ color: isError?"red":"black" }}>{msg}</div>
              </Col>
            </Row>
          </Container>
        </Form>

        <br />
      </div>
    </div>
  );
}
