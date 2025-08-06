// GuestApp.tsx
import { useState } from "react";

import DeviceSetting from "./component/DeviceSetting/DeviceSetting";
import { SerialProvider } from "./component/SerialContext";

type DeviceConfig = {
  leftBanner?: string;
  rightBanner?: string;
};

function GuestApp() {
  document.title = import.meta.env.VITE_APP_TITLE;

  const [leftBanner, setLeftBanner] = useState<string>("");
  const [rightBanner, setRightBanner] = useState<string>("");

  const handleConfigLoaded = (config: DeviceConfig) => {
    setLeftBanner(config.leftBanner || "");
    setRightBanner(config.rightBanner || "");
  };

  return (
    <SerialProvider>
      <div className="container">
        <div className="">
          {leftBanner && (
            <iframe src={leftBanner} width="100%" height="100%" />
          )}
        </div>
        <div className="">
          <DeviceSetting onConfigLoaded={handleConfigLoaded} />
        </div>
        <div className="">
          {rightBanner && (
            <iframe src={rightBanner} width="100%" height="100%" />
          )}
        </div>
      </div>
    </SerialProvider>
  );
}

export default GuestApp;
