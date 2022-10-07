import React, { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { Home } from "./views/index";

import "./index.css";
import { SampleContextProvider } from "@context/SampleContext";

ReactDOM.render(
  <SampleContextProvider>
    <BrowserRouter>
      <div>
        <Switch>
          <Route path="/" exact component={Home} />
          <Redirect from="*" to="/" />
        </Switch>
      </div>
    </BrowserRouter>
  </SampleContextProvider>,
  document.getElementById("root")
);
