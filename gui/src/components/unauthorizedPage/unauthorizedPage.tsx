import "./unauthorizedPage.scss";

import React from "react";
import locale from "../../common/locale";

export default function UnauthorizedPage() {
  return (
    <div className="unAuth-page">
      <div className="info-box">
        <div className="info-text">{locale().unauthorised_user}</div>
      </div>
    </div>
  );
}
