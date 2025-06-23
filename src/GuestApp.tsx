// MainApp.tsx
import './App.css';
import './style.css';
import './serial_events';

import DeviceSetting from "./component/DeviceSetting/DeviceSetting";
import { SerialProvider } from "./component/SerialContext";

function GuestApp() {
  document.title = import.meta.env.VITE_APP_TITLE;

  return (
    <>
      <SerialProvider>
        <div className="container">
          <div className="scan-device">
          </div>
          <div className="device-setting"><DeviceSetting /></div>
          <div className="list-code-button"></div>
        </div>
      </SerialProvider>
    </>
  );
}

export default GuestApp;