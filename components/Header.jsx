import React, { useState, useRef, useEffect } from "react";

export const Header = ({ events }) => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");
  const [failedState, setFailedState] = useState(false);
  const [isSharable, setSharable] = useState(false);

  events.on("saving", () => {
    setStatus("saving notes...");
  });

  events.on("done", () => {
    setStatus("last synced at " + (new Date()).toLocaleTimeString());
  });

  events.on("error", () => {
    setFailedState(true);
  });

  events.on("loading", () => {
    setStatus("loading...");
    setSharable(true);
  });

  return failedState ? null : <>
    <div className="header">
      <div className="separator"></div>
      <div className="status-text">{status}</div>
      <button className="btn svg" onClick={() => { setExpanded(!expanded); }}>
        <svg viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M9 4.58V4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v.58a8 8 0 0 1 1.92 1.11l.5-.29a2 2 0 0 1 2.74.73l1 1.74a2 2 0 0 1-.73 2.73l-.5.29a8.06 8.06 0 0 1 0 2.22l.5.3a2 2 0 0 1 .73 2.72l-1 1.74a2 2 0 0 1-2.73.73l-.5-.3A8 8 0 0 1 15 19.43V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.58a8 8 0 0 1-1.92-1.11l-.5.29a2 2 0 0 1-2.74-.73l-1-1.74a2 2 0 0 1 .73-2.73l.5-.29a8.06 8.06 0 0 1 0-2.22l-.5-.3a2 2 0 0 1-.73-2.72l1-1.74a2 2 0 0 1 2.73-.73l.5.3A8 8 0 0 1 9 4.57zM7.88 7.64l-.54.51-1.77-1.02-1 1.74 1.76 1.01-.17.73a6.02 6.02 0 0 0 0 2.78l.17.73-1.76 1.01 1 1.74 1.77-1.02.54.51a6 6 0 0 0 2.4 1.4l.72.2V20h2v-2.04l.71-.2a6 6 0 0 0 2.41-1.4l.54-.51 1.77 1.02 1-1.74-1.76-1.01.17-.73a6.02 6.02 0 0 0 0-2.78l-.17-.73 1.76-1.01-1-1.74-1.77 1.02-.54-.51a6 6 0 0 0-2.4-1.4l-.72-.2V4h-2v2.04l-.71.2a6 6 0 0 0-2.41 1.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>
      </button>
    </div>
    { expanded && <div className="control-section">
      <div className="section">
        Customize the look of your editor.
      </div>
      <div className="section disabled">
        <label>Appearance: </label>
        <div className="right">
          <input type="radio" id="darkmode-off" name="darkmode" value="off" checked/><label htmlFor="darkmode-off">Light </label>
          <input type="radio" id="darkmode-on" name="darkmode" value="on" /><label htmlFor="darkmode-on">Dark </label>
          <input type="radio" id="darkmode-system" name="darkmode" value="system" /><label htmlFor="darkmode-system">Use system preference</label>
        </div>
      </div>
      <div className="section disabled">
        <label>Font family: </label>
        <input type="text" className="textbox right" defaultValue="iA Writer Duospace"></input>
      </div>
      <div className="section disabled">
        <label>Font size: </label>
        <input type="text" className="textbox right" defaultValue="16px"></input>
      </div>
    </div> }
  </>
};
