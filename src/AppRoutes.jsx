import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./component/Login/LoginPage";
import RegisterPage from "./component/Login/RegisterPage";
import MainApp from "./MainApp";

const AppRoutes = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<MainApp />}
      />
      <Route
        path="/login"
        element={
          <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
        }
      />
      <Route
        path="/register"
        element={<RegisterPage />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
export default AppRoutes;
