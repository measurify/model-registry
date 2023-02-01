import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  NavLink,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthPage } from "./components/authPage/authPage.comp";
import { HomePage } from "./components/homePage/homePage";
import { NotFoundPage } from "./components/notFoundPage/notFoundPage";
import Navigation from "./components/navigation/navigation.comp";
import Page from "./components/page/page";
import ProfilePage from "./components/profilePage/profilePage";
import "./App.scss";
import UnauthorizedPage from "./components/unauthorizedPage/unauthorizedPage";

import { Container, Row, Col } from "react-bootstrap";

import NotificationBar from "./components/notificationBar/notificationBar";
import HorizontalNavigationBar from "./components/horizontalNavigationBar/horizontalNavigationBar";
import AppContext from "./context";

import { notificationManager, get_generic } from "./services/http_operations";
import VersioningPage from "./components/versioningPage/versioningPage";
import EditContentPage from "./components/editContentPage/editContentPage";
import AddPage from "./components/addPage/addPage";
import AddExperimentPage from "./components/addExperimentPage/addExperimentPage";
import AddVersionPage from "./components/addVersionPage/addVersionPage";
import { layout } from "./config";
import AddMeasurementsPage from "./components/addMeasurementsPage/addMeasurementsPage";
import cloneDeep from "clone-deep";
import { SetAPIUrl } from "./services/http_operations";
import PasswordRecoveryPage from "./components/passwordRecoveryPage/PasswordRecoveryPage";
import PasswordResetPage from "./components/PasswordResetPage/PasswordResetPage";
/*
    notifications follow this schema

    {
        name: "notification name"
        time: ""
        message: "this is a message"
    }


*/

interface INotification {
  type: string;
  time: string;
  msg: string;
}

function App() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [types, setTypes] = useState<Object | undefined>();
  const [data, setData] = useState<Object>({});

  let layoutRef = React.useRef<string | null>();
  const tkn = localStorage.getItem("token");

  //set api url to run https operations
  SetAPIUrl();

  ////////////////NOTIFICATION MANAGEMENT FRAGMENT
  //function to push a new notification at the beginning of the list
  function PushNotification(obj: INotification) {
    setNotifications((prev) => [obj].concat(prev));
    //notifications.push(obj);
  }

  //function to remove a single notification from list
  function RemoveNotification(id: number) {
    let tmp = [...notifications];
    tmp.splice(id, 1);
    setNotifications(tmp);
  }

  //function to clear notifications list
  function ClearNotifications() {
    setNotifications([]);
  }

  const notificationManagement = {
    notifications: notifications,
    PushNotification,
    RemoveNotification,
    ClearNotifications,
  };

  notificationManager.ClearNotifications = ClearNotifications;
  notificationManager.PushNotification = PushNotification;
  notificationManager.RemoveNotification = RemoveNotification;

  ///////////////END NOTIFICATION MANAGEMENT FRAGMENT

  ///////////////FETCHED TYPES AND DATA MANAGEMENT FRAGMENT
  //function to push a new notification at the beginning of the list
  function UpdateData(fetched: string[], key: string) {
    setData((prev) => {
      return { ...prev, [key]: [...fetched] };
    });
  }

  //function to push a new notification at the beginning of the list
  function RemoveData(key: string) {
    setData((prev) => {
      return { ...prev, [key]: undefined };
    });
  }

  //use effect to fetch static data from the server /types
  useEffect(() => {
    // declare the async data fetching function
    const fetchTypes = async () => {
      // get the data from the api
      try {
        const response = await get_generic("types", {}, {}, "");

        setTypes(response.response.data);
      } catch (error) {
        console.log(error);
      }
    };

    //if types has been already set, ignore it
    if (types !== undefined) return;
    // call the function
    try {
      fetchTypes();
    } catch (error) {
      console.log(error);
    }
    // make sure to catch any error
  }, []);

  const fetchedManagement = {
    types: types,
    data: data,
    UpdateData: UpdateData,
    RemoveData: RemoveData,
  };
  ///////////////END FETCHED TYPES MANAGEMENT FRAGMENT

  //mobile view only allowed to be vertical
  if (/Mobi/i.test(window.navigator.userAgent) == true) {
    layoutRef.current = "vertical";
  } else {
    layoutRef.current = layout;
  }

  //not logged => show auth page
  if (tkn === null)
    return (
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route
              path="/passwordrecovery"
              element={<PasswordRecoveryPage />}
            />
            <Route path="/passwordreset" element={<PasswordResetPage />} />
            <Route
              path="/add/tenants"
              element={<AddPage resource={"tenants"} />}
            />
          </Routes>
        </Router>
      </div>
    );

  return (
    <AppContext.Provider
      value={{
        notifications: notificationManagement,
        fetched: fetchedManagement,
      }}
    >
      <Router>
        <Container
          fluid
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            height: 100 + "vh",
          }}
        >
          {layoutRef.current === "horizontal" ? (
            <Row style={{ padding: 0 }}>
              <HorizontalNavigationBar />
            </Row>
          ) : (
            ""
          )}
          <Row
            style={{
              padding: 0,
            }}
          >
            {layoutRef.current === "vertical" ? (
              <Col md="auto" style={{ padding: 0, minWidth: 250 + "px" }}>
                <Navigation />
              </Col>
            ) : (
              ""
            )}
            {/Mobi/i.test(window.navigator.userAgent) == true && (
              <Col md="auto" style={{ padding: 0 }}>
                <NotificationBar />
              </Col>
            )}
            <Col style={{ paddingLeft: 0, paddingRight: 0 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/viewProfile" element={<ProfilePage />} />
                <Route
                  path="/add/experiments/"
                  element={<AddExperimentPage />}
                />
                <Route
                  path="/add/measurements/"
                  element={<AddMeasurementsPage />}
                />

                <Route
                  path="/edit/:resource/:id"
                  element={<EditContentPage />}
                />
                <Route
                  path="/versions/:resource/:id"
                  element={<VersioningPage />}
                />
                <Route
                  path="/add/:type/:resource/:id"
                  element={<AddVersionPage />}
                />
                <Route path="/add/:resource/" element={<AddPage />} />
                <Route path="/:page" element={<Page res=":page" />} />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/404" element={<NotFoundPage />} />

                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Col>
            {layoutRef.current === "vertical" &&
              /Mobi/i.test(window.navigator.userAgent) == false && (
                <Col md="auto" style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <NotificationBar />
                </Col>
              )}
          </Row>
        </Container>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
