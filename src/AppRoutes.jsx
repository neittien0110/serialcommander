import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./component/Login/LoginPage";
import RegisterPage from "./component/Login/RegisterPage";
import MainApp from "./MainApp";
import GuestApp from "./GuestApp";


const AppRoutes = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <MainApp /> : <GuestApp />}
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
