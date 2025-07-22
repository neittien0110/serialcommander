// MainApp.tsx
import { useState } from "react";
import './App.css';
import './style.css';

import DeviceSetting from "./component/DeviceSetting/DeviceSetting";
import { SerialProvider } from "./component/SerialContext";

type DeviceConfig = {
  leftBanner?: string;
  rightBanner?: string;
};

function MainApp() {
  const [leftBanner, setLeftBanner] = useState<string>("");
  const [rightBanner, setRightBanner] = useState<string>("");

  const handleConfigLoaded = (config: DeviceConfig) => {
    setLeftBanner(config.leftBanner || "");
    setRightBanner(config.rightBanner || "");
  };

  return (
    <SerialProvider>
      <div className="container">
        <div className="scan-device">
          {leftBanner && (
            <iframe src={leftBanner} width="100%" height="100%" />
          )}
        </div>
        <div className="device-setting">
          <DeviceSetting onConfigLoaded={handleConfigLoaded} />
        </div>
        <div className="list-code-button">
          {rightBanner && (
            <iframe src={rightBanner} width="100%" height="100%" />
          )}
        </div>
      </div>
    </SerialProvider>
  );
}

export default MainApp;
