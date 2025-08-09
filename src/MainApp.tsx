// MainApp.tsx
import { useState } from "react";
import DeviceSetting from "./component/DeviceSetting/DeviceSetting";
import { SerialProvider } from "./component/SerialContext";

import 'bootstrap/dist/css/bootstrap.min.css';      // Áp dụng bootstrap
import Container from 'react-bootstrap/Container';
import { Col, Row } from "react-bootstrap";
import { SerialConfig } from "./dto/SerialConfig";

function isURL(str: string): boolean {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}

function MainApp() {
  const [leftBanner, setLeftBanner] = useState<string>("");
  const [rightBanner, setRightBanner] = useState<string>("");
  //const [shareCode, setShareCode] = useState<string>("");

  /**
   * Thay đổi banner theo cấu hình
   * @param config Cấu trúc chứa cấu hình hiện thời
   */
  const handleConfigLoaded = (config: SerialConfig) => {
    setLeftBanner(config.leftBanner || import.meta.env.VITE_DEFAULT_LEFT_URL);
    setRightBanner(config.rightBanner || import.meta.env.VITE_DEFAULT_RIGHT_BANNER);
  //  setShareCode("Mã chia sẻ");
  };

  return (
    <SerialProvider>
      <Container fluid>
        <Row className="justify-content-center gx-0"> {/* Thêm gx-0 để loại bỏ khoảng cách ngang */}
          <Col lg={3} className="d-none d-lg-block">  {/* Với container fluid thì đặt sm={0} ko có tác dụng */}
            <div className="fs-4 text-left text-truncate">
              <img id="navlogo" src="/serial-port-svgrepo-com.svg" alt="logo"></img> &nbsp;
              Serial Commander
            </div>
            {isURL(leftBanner) ? (<iframe src={leftBanner} className="w-100 h-100" title="left banner" />)
              : (leftBanner)}
            <hr />
          </Col>
          <Col sm={12} md={8} lg={6} className="p-1">
            {<DeviceSetting onConfigLoaded={handleConfigLoaded} />}
          </Col>
          <Col md={4} lg={3} className="d-none d-sm-block">
            <h2 className="d-flex justify-content-center align-items-center text-truncate">Hướng dẫn sử dụng</h2>
            <hr />
            <div className="text-wrap text-break">
              {isURL(rightBanner) ? (<iframe src={rightBanner} width="100%" height="100%" title="right banner" />)
                : (rightBanner)}
            </div>
            <hr />
          </Col>
        </Row>
      </Container>
    </SerialProvider>
  );
}

export default MainApp;
