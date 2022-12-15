import React, { useEffect } from "react";
import locale from "../../common/locale";
import { website_name } from "../../config";

import "./homePage.scss";

const HomePageComp = () => {
  useEffect(() => {});
  return (
    <div className="page">
      <header className="page-header">{website_name}</header>
      <main className="page-content">
        <div className="home-page">
          <div className="info-box">
            <div className="info-text">
              {locale().welcome_hp}
              <br />
              <br />
              {locale().left_bar_descr_hp}
              <br />
              <br />
              {locale().right_bar_descr_hp}
              <br />
              <br />
              {locale().session_expire_info_hp}
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
              <br />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const HomePage = HomePageComp;
