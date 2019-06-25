import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const dev = location.hostname === "localhost";
console.log(`dev=${dev}`);
ReactDOM.render(<App dev={dev} />, document.getElementById("App"));
