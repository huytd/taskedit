/* Loading resources in webpack way */
import "./scss/main.scss";
import "./scss/theme.scss";

/* Main program */
import React from "react";
import { render } from "react-dom";
import Notepad from "./components/Notepad";

render(<Notepad/>, document.getElementById("root"));
