import { Navigate, Route, Routes } from "react-router-dom";
import Login from "src/pages/auth/login.tsx";
import NotFound from "src/pages/not-found.tsx";
import Register from "src/pages/auth/register.tsx";
import ForgotPassword from "src/pages/auth/forgot-password.tsx";
import UpdatePassword from "src/pages/auth/update-password.tsx";

const routes = [{
  path: "/login",
  label: "Log In",
  element: (<Login />)
}, {
  path: "/register",
  label: "Sign Up",
  element: (<Register />)
}, {
  path: "/forgot-password",
  label: "Forgot Password",
  element: (<ForgotPassword />)
}, {
  path: "/update-password",
  label: "Update Password",
  element: (<UpdatePassword />)
}];

function Auth() {
  return (
    <>
      <Routes>
        <Route index path="/" element={<Navigate to="./login" replace />} />
        {routes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default Auth;
