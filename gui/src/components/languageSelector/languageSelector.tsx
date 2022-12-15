import React from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import { languages } from "../../config";
import "./languageSelector.scss";

export const LanguageSelector = () => {
  function setSessionLanguage(language: string) {
    localStorage.setItem("language", language);
    window.location.reload();
  }

  return (
    <div>
      {locale().language}
      <div>
        {languages.includes("it") && (
          <Button
            variant="outline-info"
            onClick={() => setSessionLanguage("it")}
          >
            Ita
          </Button>
        )}
        {languages.includes("en") && (
          <Button
            variant="outline-info"
            onClick={() => setSessionLanguage("en")}
          >
            Eng
          </Button>
        )}
      </div>
    </div>
  );
  //
};
