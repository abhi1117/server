// components/PrivateRoute.js
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const PrivateRoute = ({ component: Component, roles, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const role = getUserRole();
      if (!role || !roles.includes(role)) {
        return <Redirect to="/login" />;
      }
      return <Component {...props} />;
    }}
  />
);

export default PrivateRoute;
