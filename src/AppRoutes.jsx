import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./component/LoginPage";
import RegisterPage from "./component/RegisterPage";
import MainApp from "./MainApp";

const AppRoutes = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <Routes>
      <Route
        path='/'       //Bổ sung mã chia sẻ trên url
        element={<MainApp />}
      />      
      <Route
        path='/:sharecodefromurl'       //Bổ sung mã chia sẻ trên url
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
