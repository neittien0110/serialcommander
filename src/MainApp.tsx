// MainApp.tsx
import { useState } from "react";
import DeviceSetting from "./component/DeviceSetting/DeviceSetting";
import { SerialProvider } from "./component/SerialContext";

import 'bootstrap/dist/css/bootstrap.min.css';      // Áp dụng bootstrap
import Container from 'react-bootstrap/Container';
import { Col, Row } from "react-bootstrap";

type DeviceConfig = {
  leftBanner?: string;
  rightBanner?: string;
};

function MainApp() {
  const [leftBanner, setLeftBanner] = useState<string>("");
  const [rightBanner, setRightBanner] = useState<string>("");

  const handleConfigLoaded = (config: DeviceConfig) => {
    setLeftBanner(config.leftBanner || import.meta.env.VITE_DEFAULT_LEFT_URL);
    setRightBanner(config.rightBanner || import.meta.env.VITE_DEFAULT_RIGHT_BANNER);
  };

  return (
    <SerialProvider>
      <Container fluid>
        <Row className="justify-content-center gx-0"> {/* Thêm gx-0 để loại bỏ khoảng cách ngang */}
          <Col lg={3} className="d-none d-lg-block">  {/* Với container fluid thì đặt sm={0} ko có tác dụng */}
            {leftBanner && (<iframe src={leftBanner} width="100%" height="100%" title="Left banner" />)}
          </Col>
          <Col sm={12} md={8} lg={6}>
            {<DeviceSetting onConfigLoaded={handleConfigLoaded} />}
          </Col>
          <Col md={4} lg={3} className="d-none d-sm-block">
            <h2 className="d-flex justify-content-center align-items-center">Hướng dẫn sử dụng</h2>
            <hr/>
            <div className="text-wrap text-break">
              {rightBanner}
            </div>
            <hr/>
          </Col>
        </Row>
      </Container>
    </SerialProvider>
  );
}

export default MainApp;
