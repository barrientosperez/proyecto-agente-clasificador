import React from "react";
import auth from "../classes/Auth";
import {Navigate, Outlet} from 'react-router-dom';

export const PublicRoute = ({}) => {
    return auth.isAuthenticated() ? <Navigate to="/dashboard"></Navigate> : <Outlet />
}
