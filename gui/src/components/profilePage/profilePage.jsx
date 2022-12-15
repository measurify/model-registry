import React, { useEffect, useState } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import locale from "../../common/locale";
import { put_generic, login } from "../../services/http_operations";
import "../page/page.scss";
export default function ProfilePage(params) {
  //save in status informations of profile
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [tenant, setTenant] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [msg, setMsg] = useState("");
  function renderIconRole() {
    if (role === "admin") {
      return (
        <i className="fa fa-user-tie" aria-hidden="true" title="Admin"></i>
      );
    } else if (role === "provider") {
      return (
        <i
          className="fa fa-user-graduate"
          aria-hidden="true"
          title="Provider"
        ></i>
      );
    } else if (role === "analyst") {
      return (
        <i className="fa fa-user-cog" aria-hidden="true" title="Analyst"></i>
      );
    } else if (role === "supplier") {
      return (
        <i className="fa fa-user-tag" aria-hidden="true" title="Supplier"></i>
      );
    } else {
      return (
        <i className="fa fa-user" aria-hidden="true" aria-label="User"></i>
      );
    }
  }
  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("user-role");
    const tenant = localStorage.getItem("user-tenant");
    setUsername(username !== null ? username : "");
    setRole(role !== null ? role : "");
    setTenant(tenant !== null && tenant !== "" ? tenant : "-");
  }, []);
  const submitPassword = async (e) => {
    e.preventDefault();
    if (oldPassword === "") {
      setMsg(locale().old_pass_empty);
    }
    if (password !== passwordConfirm) {
      setMsg(locale().pass_not_match);
      return;
    }
    if (password === "" || passwordConfirm === "") {
      setMsg(locale().pass_not_null);
      return;
    }
    try {
      await login(
        username,
        oldPassword,
        tenant !== "-" ? tenant : undefined,
        false
      );
    } catch (error) {
      setMsg(locale().old_pass_wrong);
      return;
    }
    const result = window.confirm(locale().pass_change_confirm);
    if (result) {
      try {
        const response = await put_generic(
          "users",
          { password: password },
          username
        );
        setOldPassword("");
        setPassword("");
        setPasswordConfirm("");
        if (response.response.status === 200) {
          setMsg(locale().password_changed);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div className="page">
      <header className="page-header">
        {locale().welcome}&nbsp;<b>{username}</b>:&nbsp;
        {locale().profile_page_desc}
      </header>
      <main className="page-content">
        <Container fluid>
          <Row>
            <Col xs={1}>Username:&nbsp;</Col>
            <Col>
              <b>{username}</b>
            </Col>
          </Row>
          <Row>
            <Col xs={1}>{locale().role}</Col>
            <Col>
              {role}&nbsp;
              {renderIconRole()}
            </Col>
          </Row>
          <Row>
            <Col xs={1}>{locale().tenant + " "}</Col>
            <Col>
              <b>{tenant}</b>
            </Col>
          </Row>
        </Container>
        <hr />
        <Container fluid>
          <Col>
            <Row>
              <b>Edit password</b>
            </Row>
          </Col>
          <Row>
            <Col>
              <Form onSubmit={submitPassword}>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type={"password"}
                      onChange={(e) => {
                        e.preventDefault();
                        setOldPassword(e.target.value);
                      }}
                      value={oldPassword}
                      placeholder={locale().enter + " old password"}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type={"password"}
                      onChange={(e) => {
                        e.preventDefault();
                        setPassword(e.target.value);
                      }}
                      value={password}
                      placeholder={locale().enter + " new password"}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type={"password"}
                      onChange={(e) => {
                        e.preventDefault();
                        setPasswordConfirm(e.target.value);
                      }}
                      value={passwordConfirm}
                      placeholder={locale().repeat + " new password"}
                      aria-describedby="passwordHelpBlock"
                    />
                    <Form.Text id="passwordHelpBlock" muted>
                      {msg}
                    </Form.Text>
                  </Form.Group>
                </Row>
                <Button variant="primary" type="submit">
                  {locale().submit}
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}