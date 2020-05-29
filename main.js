import 'regenerator-runtime/runtime';
import 'core-js/es6/symbol';
import 'core-js/es6/set';
import 'core-js/es6/map';

/* Loading resources in webpack way */
import "./scss/main.scss";

/* Main program */
import React from "react";
import { render } from "react-dom";
import Notepad from "./components/Notepad";
import { Header } from "./components/Header";
import EventEmitter from 'eventemitter3';
import Parse from './parse.min.js';

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
