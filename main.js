/* Loading resources in webpack way */
import "./scss/main.scss";
import "./scss/theme.scss";

/* Main program */
import React from "react";
import { render } from "react-dom";
import Notepad from "./components/Notepad";
import { Header } from "./components/Header";
import EventEmitter from 'eventemitter3';
import Parse from 'parse/node';

Parse.initialize(process.env.PARSE_APP_ID);
Parse.serverURL = process.env.PARSE_SERVER_URL;

const App = () => {
  const events = new EventEmitter();
  return <>
    <Header parse={Parse} events={events} />
    <Notepad parse={Parse} events={events} />
  </>;
}

render(<App/>, document.getElementById("root"));
