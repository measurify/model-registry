import {
  Button,
  Badge,
  Offcanvas,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import React, { useState, useContext, useEffect } from "react";
import locale from "../../common/locale";
import "./notificationBar.scss";
import AppContext from "../../context";
import { layout } from "../../config";
const oldNotifications = React.createRef();

export default function NotificationBar(props) {
  const [show, setShow] = useState(false);
  const [highlight, setHighlight] = useState(false);

  let layoutRef = React.useRef();
  const myNotifications = useContext(AppContext).notifications;
  oldNotifications.current = 0;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  /*
  handleClick = () => {
    this.setState({ highlight: true });
    setTimeout(() => {
      this.setState({ highlight: false });
    }, 2000);
  };*/

  useEffect(() => {
    if (oldNotifications.current < myNotifications.notifications.length) {
      oldNotifications.current = myNotifications.notifications.length;

      setHighlight(true);
      setTimeout(() => {
        setHighlight(false);
      }, 600);
    }
  }, [myNotifications.notifications]);

  //mobile view only allowed to be vertical
  if (/Mobi/i.test(window.navigator.userAgent) === true) {
    layoutRef.current = "vertical";
  } else {
    layoutRef.current = layout;
  }
  const errorNot = myNotifications.notifications.filter(
    (e) => e.name === "error"
  );

  return (
    <div
      className="notificationBar"
      style={
        layoutRef.current === "vertical" &&
        /Mobi/i.test(window.navigator.userAgent) === false
          ? { height: 100 + "vh" }
          : {}
      }
    >
      <Button
        variant="link"
        onClick={() => {
          handleShow();
        }}
        style={{
          color: "#fff",
          textDecoration: "none",
        }}
      >
        {locale().notifications}&nbsp;
        <Badge
          pill
          bg={errorNot.length > 0 ? "danger" : "success"}
          className={`element${highlight ? " highlight" : ""}`}
        >
          {myNotifications.notifications.length}
        </Badge>
        <span className="visually-hidden">Unread notifications</span>
      </Button>

      <Offcanvas
        style={{
          backgroundColor: "#123651",
          color: "#fff",
        }}
        show={show}
        onHide={handleClose}
        placement="end"
        name={"notification_bar"}
        scroll={false}
        backdrop={true}
        keyboard={true}
      >
        <Offcanvas.Header>
          <Offcanvas.Title>
            {locale().notifications}
            &nbsp;
            <Badge pill bg={errorNot.length > 0 ? "danger" : "success"}>
              {myNotifications.notifications.length}
            </Badge>
            &nbsp;&nbsp;&nbsp;
            <Button variant="outline-secondary" onClick={() => handleClose()}>
              {locale().close + " " + locale().notifications}
            </Button>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div
            style={{
              width: 100 + "%",
              height: 100 + "%",
            }}
          >
            {myNotifications.notifications.length !== 0 && (
              <Button
                variant="warning"
                onClick={() => myNotifications.ClearNotifications()}
              >
                {locale().clear_all}
              </Button>
            )}

            <ToastContainer>
              {myNotifications.notifications.map((notification, index) => {
                let type;
                if (notification.name === "info") type = "success";
                if (notification.name === "error") type = "danger";
                return (
                  <Toast
                    className="d-inline-block m-1"
                    key={"notification_" + index}
                    bg={type}
                    animation={true}
                    onClose={() => {
                      myNotifications.RemoveNotification(index);
                    }}
                  >
                    <Toast.Header>
                      <img
                        src="holder.js/20x20?text=%20"
                        className="rounded me-2"
                        alt=""
                      />
                      <strong className="me-auto">{notification.name}</strong>
                      <small>{notification.time.slice(0, 15)}</small>
                    </Toast.Header>
                    <Toast.Body>{notification.msg}</Toast.Body>
                  </Toast>
                );
              })}
            </ToastContainer>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
