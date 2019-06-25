import React from "react";

function ErrorWidget({ error }) {
  const cssOuter = {
    float: "left",
    padding: "1em",
    background: "gold",
    color: "red",
    fontWeight: "bold",
    border: "solid 2px red",
  };
  const cssMessage = {
  };
  const cssData = {
  };
  const cssTitle = {
    border: "none",
    borderBottom: "solid 2px black",
  };
  return (
    <div style={cssOuter}>
      <div style={cssTitle}>Error</div>
      <div style={cssMessage}>{
        error
          ? error.message || error.toString()
          : "There was an error"
      }</div>
      {
        (error && error.httpStatus) && (
          <div style={cssMessage}>{`http.status=${error.httpStatus}`}</div>
        )
      }
      {
        (error && error.data) && (
          <pre style={cssData}>{
            JSON.stringify(error.data, null, 1)
          }</pre>
        )
      }
    </div>
  )
}

export default ErrorWidget;
