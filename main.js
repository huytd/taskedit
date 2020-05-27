import 'regenerator-runtime/runtime';
import 'core-js/es6/symbol';
import 'core-js/es6/set';
import 'core-js/es6/map';

/* Loading resources in webpack way */
import "./scss/main.scss";
import "./scss/theme.scss";

/* Main program */
import React from "react";
import { render } from "react-dom";
import Notepad from "./components/Notepad";
import { Header } from "./components/Header";
import EventEmitter from 'eventemitter3';
import Parse from './parse.min.js';

Parse.initialize(process.env.APP_ID);
Parse.serverURL = "/api";

const App = () => {
  const events = new EventEmitter();
  return <>
    <Header parse={Parse} events={events} />
    <Notepad parse={Parse} events={events} />
  </>;
}

render(<App/>, document.getElementById("root"));
