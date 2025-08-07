import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  /// Thiết lập tên trang web dựa theo <---  vite.config.ts <--- package.json 
  document.title = import.meta.env.VITE_APP_NAME + " v" + import.meta.env.VITE_APP_VERSION
  return (
    <Router basename={import.meta.env.VITE_BASE_URL}>     { /* Thiết lập basename cho các liên kết động */ }
      <AppRoutes isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
}

export default App;
