import React, { useState, useRef, useEffect } from "react";

export const Header = ({ parse, events }) => {
  const Parse = parse;
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");

  events.on("saving", () => {
    setStatus("saving notes...");
  });

  events.on("done", () => {
    setStatus("last synced at " + (new Date()).toLocaleTimeString());
  });

  events.on("loading", () => {
    setStatus("loading...");
  });

  return <>
    <div className="header">
      <div className="separator"></div>
      <div className="status-text">{status}</div>
      <button className="btn svg with-text">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path class="heroicon-ui" d="M11.85 17.56a1.5 1.5 0 0 1-1.06.44H10v.5c0 .83-.67 1.5-1.5 1.5H8v.5c0 .83-.67 1.5-1.5 1.5H4a2 2 0 0 1-2-2v-2.59A2 2 0 0 1 2.59 16l5.56-5.56A7.03 7.03 0 0 1 15 2a7 7 0 1 1-1.44 13.85l-1.7 1.71zm1.12-3.95l.58.18a5 5 0 1 0-3.34-3.34l.18.58L4 17.4V20h2v-.5c0-.83.67-1.5 1.5-1.5H8v-.5c0-.83.67-1.5 1.5-1.5h1.09l2.38-2.39zM18 9a1 1 0 0 1-2 0 1 1 0 0 0-1-1 1 1 0 0 1 0-2 3 3 0 0 1 3 3z" /></svg>
        <span>Share</span>
      </button>
      <button className="btn svg" onClick={() => { setExpanded(!expanded); }}>
        <svg viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M9 4.58V4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v.58a8 8 0 0 1 1.92 1.11l.5-.29a2 2 0 0 1 2.74.73l1 1.74a2 2 0 0 1-.73 2.73l-.5.29a8.06 8.06 0 0 1 0 2.22l.5.3a2 2 0 0 1 .73 2.72l-1 1.74a2 2 0 0 1-2.73.73l-.5-.3A8 8 0 0 1 15 19.43V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.58a8 8 0 0 1-1.92-1.11l-.5.29a2 2 0 0 1-2.74-.73l-1-1.74a2 2 0 0 1 .73-2.73l.5-.29a8.06 8.06 0 0 1 0-2.22l-.5-.3a2 2 0 0 1-.73-2.72l1-1.74a2 2 0 0 1 2.73-.73l.5.3A8 8 0 0 1 9 4.57zM7.88 7.64l-.54.51-1.77-1.02-1 1.74 1.76 1.01-.17.73a6.02 6.02 0 0 0 0 2.78l.17.73-1.76 1.01 1 1.74 1.77-1.02.54.51a6 6 0 0 0 2.4 1.4l.72.2V20h2v-2.04l.71-.2a6 6 0 0 0 2.41-1.4l.54-.51 1.77 1.02 1-1.74-1.76-1.01.17-.73a6.02 6.02 0 0 0 0-2.78l-.17-.73 1.76-1.01-1-1.74-1.77 1.02-.54-.51a6 6 0 0 0-2.4-1.4l-.72-.2V4h-2v2.04l-.71.2a6 6 0 0 0-2.41 1.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>
      </button>
    </div>
    { expanded && <div className="control-section">
      <div className="section">
        <label>Your encrypted note URL: </label>
        <input type="text" className="textbox right" defaultValue=""></input>
      </div>
      <div className="section">
        Keep this URL for yourself, use it to access this document on another devices, or share it only with the person you trust. Anyone with this URL will be able to read and write to this encrypted document.
      </div>
      <div className="section separator">
        Customize the look of your editor.
      </div>
      <div className="section disabled">
        <label>Appearance: </label>
        <div className="right">
          <input type="radio" id="darkmode-off" name="darkmode" value="off" checked/> <label htmlFor="darkmode-on">Light </label>
          <input type="radio" id="darkmode-on" name="darkmode" value="on" /> <label htmlFor="darkmode-on">Dark </label>
          <input type="radio" id="darkmode-system" name="darkmode" value="system" /> <label htmlFor="darkmode-on">Use system preference</label>
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