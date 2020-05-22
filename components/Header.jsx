import React, { useState, useRef, useEffect } from "react";

export const Header = ({ parse, events }) => {
  const Parse = parse;
  const [expanded, setExpanded] = useState(false);
  const userNameRef = useRef();
  const passwordRef = useRef();
  let currentUser = Parse.User.current();
  const [loggedIn, setLoggedIn] = useState(!!currentUser);

  const signUp = () => {
    (async () => {
      const username = userNameRef?.current.value;
      const password = passwordRef?.current.value;
      if (username && password) {
        const user = new Parse.User({ username, password });
        try {
          await user.signUp();
          setLoggedIn(true);
          currentUser = Parse.User.current();
          events.emit('userUpdated');
        } catch (error) {
          console.log(error);
        }
      }
    })();
  };

  const signIn = () => {
    (async () => {
      const username = userNameRef?.current.value;
      const password = passwordRef?.current.value;
      if (username && password) {
        try {
          const user = await Parse.User.logIn(username, password);
          setLoggedIn(true);
          events.emit('userUpdated');
        } catch (error) {
          console.log(error);
        }
      }
    })();
  };

  const signOut = () => {
    (async () => {
      await Parse.User.logOut();
      setLoggedIn(false);
      events.emit('userUpdated');
    })();
  };

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
      <button className="btn svg" onClick={() => { setExpanded(!expanded); }}>
        <svg viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M9 4.58V4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v.58a8 8 0 0 1 1.92 1.11l.5-.29a2 2 0 0 1 2.74.73l1 1.74a2 2 0 0 1-.73 2.73l-.5.29a8.06 8.06 0 0 1 0 2.22l.5.3a2 2 0 0 1 .73 2.72l-1 1.74a2 2 0 0 1-2.73.73l-.5-.3A8 8 0 0 1 15 19.43V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.58a8 8 0 0 1-1.92-1.11l-.5.29a2 2 0 0 1-2.74-.73l-1-1.74a2 2 0 0 1 .73-2.73l.5-.29a8.06 8.06 0 0 1 0-2.22l-.5-.3a2 2 0 0 1-.73-2.72l1-1.74a2 2 0 0 1 2.73-.73l.5.3A8 8 0 0 1 9 4.57zM7.88 7.64l-.54.51-1.77-1.02-1 1.74 1.76 1.01-.17.73a6.02 6.02 0 0 0 0 2.78l.17.73-1.76 1.01 1 1.74 1.77-1.02.54.51a6 6 0 0 0 2.4 1.4l.72.2V20h2v-2.04l.71-.2a6 6 0 0 0 2.41-1.4l.54-.51 1.77 1.02 1-1.74-1.76-1.01.17-.73a6.02 6.02 0 0 0 0-2.78l-.17-.73 1.76-1.01-1-1.74-1.77 1.02-.54-.51a6 6 0 0 0-2.4-1.4l-.72-.2V4h-2v2.04l-.71.2a6 6 0 0 0-2.41 1.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>
      </button>
    </div>
    { expanded && <div className="control-section">
      {loggedIn && currentUser ? <>
        <div className="section">
          Hi, {currentUser?.get('username')}! Your data is now synced to the server. If you would like to disconnect this device, click the Logout button below.
        </div>
        <div className="section">
          <button className="btn" onClick={signOut}>Logout</button>
        </div>
      </> : <>
        <div className="section">
          To sync data between devices, connect this device with your account. Please note that all your current work will be replaced with your exists data on the server when you click Login.
        </div>
        <div className="section">
          <label>Username:</label>
          <input type="text" className="textbox" ref={userNameRef}></input>
        </div>
        <div className="section">
          <label>Password:</label>
          <input type="password" className="textbox" ref={passwordRef}></input>
        </div>
        <div className="section">
          <button className="btn" onClick={signIn}>Login</button>
          &nbsp;
          <button className="btn" onClick={signUp}>Sign Up</button>
        </div>
      </> }
      <div className="section separator">
        Customize the look of your editor.
      </div>
      <div className="section disabled">
        <label>Font family: </label>
        <input type="text" className="textbox" defaultValue="iA Writer Duospace"></input>
      </div>
      <div className="section disabled">
        <label>Font size: </label>
        <input type="text" className="textbox" defaultValue="16px"></input>
      </div>
    </div> }
  </>
};