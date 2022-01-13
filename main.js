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

let searchParams = new URLSearchParams(window.location.search);
let noteId = searchParams.get('note');

const App = () => {
  const events = new EventEmitter();
  return <>
    <Header events={events} />
    <Notepad events={events} noteId={noteId} />
  </>;
}

render(<App/>, document.getElementById("root"));
