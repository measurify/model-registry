import React from "react";
import locale from "../../common/locale";

import "./notFoundPage.scss";

const notFoundPageComp = () => {
  return (
    <div className="notFound-page">
      {locale().oh_no}
      <br />
      <br />
      {locale().broken_link}
      <br />
      <br />
      <a
        href="https://github.com/measurify/server/issues"
        target="_blank"
        rel="noopener noreferrer"
        title="https://github.com/measurify/server/issues"
      >
        {locale().github_issue_page_hp}
      </a>
    </div>
  );
};

export const NotFoundPage = notFoundPageComp;
