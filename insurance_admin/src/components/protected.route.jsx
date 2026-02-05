import React from "react";
import auth from "../classes/Auth";
import {Navigate, Outlet} from 'react-router-dom';


//This component returns a Route, with the component that was passed in
//This component validates if user is logged in

export const ProtectedRoute = ({}) => {
    return auth.isAuthenticated() ? <Outlet /> : <Navigate to="/login"></Navigate>
}

