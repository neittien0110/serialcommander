import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import packageJson from '../package.json';      // Lấy số hiệu version

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  /// Thiết lập tên trang web dựa theo <---  vite.config.ts <--- package.json 
  document.title = import.meta.env.VITE_APP_NAME + " v" + packageJson.version;
  return (
    <Router basename={import.meta.env.VITE_BASE_URL}>     { /* Thiết lập basename cho các liên kết động */ }
      <AppRoutes isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
}

export default App;
