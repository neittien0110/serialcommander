import React, { useEffect, useState, useRef } from "react";
import ComponentRenderer from "./ComponentRenderer";
import { SerialContext } from "./SerialContext";
import ShareCode from "./ShareCode";
import { useNavigate } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { SerialConfig } from '../dto/SerialConfig';
import { SerialAction } from "../dto/SerialAction";

import { useParams } from "react-router-dom";     //Lấy tham số từ URL

// Định nghĩa kiểu cho props
interface DeviceSettingProps {
  onConfigLoaded: (scenario: SerialConfig) => void;
}


function DeviceSetting({ onConfigLoaded }: DeviceSettingProps) {
  const { connectToSerial, sendData, serialOutput, setSerialOutput, disconnect } = React.useContext(SerialContext);

  const [shareCode, setShareCode] = useState<string>("");
  /** Chứa danh sách các kịch bản của tài khoản hiện thời */
  const [scenarios, setSenarios] = useState<SerialConfig[]>([]);
  /** ID của kịch bản đang được áp dụng/hiển thị lên giao diện. */
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  /** Nội đung hoàn chỉnh của kịch bản đang được render lên giao diện, tương ứng với selectedConfigId */
  const [scenario, setConfig] = useState<SerialConfig | null>(null);
  /** Danh sách các serial default command  và id của từng SerialAction */
  const [serialCommands, setSerialCommands] = useState<{ [key: number]: string }>({});
  /** Điều khiển upload file kịch bản */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

  /** Định nghĩa mảng chứa các baudrate. */
  const baudrates: number[] = [
    300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800,
    38400, 57600, 115200, 230400, 460800, 500000, 921600,
    1000000, 2000000,
  ];

  /** Tốc độ baudrate*/
  const [selectedBaudrate, setSelectedBaudrate] = useState<number>(115200); // Mặc định là 115200

  /** Kí tự phân tách lệnh serial là gì? */
  const [newLineValue, setNewLineValue] = useState<string>('CRLF');
  const isGuest = !localStorage.getItem("token");
  const navigate = useNavigate();

  // Lấy giá trị của tham số từ URL.
  // Tên biến 'sharecode' phải trùng với tên đã thiết lập route '/:sharecode'.
  const { sharecodefromurl } = useParams();
  /**
   * Lấy về toàn bộ CÁC kịch bản của TÀI KHOẢN hiện tại
   * @description do cần gọi hàm async fetch nên bắt buộc phải tạo một hàm async fetchConfigs và gọi ra ngay lập tức. Đây là qui định của useEffect.
   */
  useEffect(() => {

    const fetchConfigs = async () => {
      try {
        /// Nếu chưa đăng nhập, hoặc có đăng nhập nhưng sử dụng mã chia sẻ thì không được chọn bất cứ kịch bản nào
        if (isGuest || sharecodefromurl) {
          /// Xóa danh sách các kịch bản nếu là guest
          if (isGuest) setSenarios([]);
          /// Xóa kịch bản đang chọn
          setSelectedConfigId(null);
          return;
        }
        // Gửi yêu cầu tải về về các kịch bản của tài khoản hiện thời
        const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/scenarios/myscenarios`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        /// Lấy về các kịch bản
        const data = await res.json();
        /// Phân tích trạng thái response
        if (res.ok) {
          /// Nếu ổn thì lưu vào state scenarios
          setSenarios(data);
          /// Nếu ổn thì lưu vào state scenarios
          if (data.length > 0) {
            /// - Coi như người dùng chọn kịch bản đầu tiên. Lưu state Id này ==> kích hoạt useEffect update
            setSelectedConfigId(data[0].id);
          }
        } else {
          console.error("Lỗi khi lấy danh sách kịch bản:", res.text);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Lỗi khi lấy danh sách kịch bản:", err.message);
        } else {
          console.error("Lỗi khi lấy danh sách kịch bản:", String(err));
        }
      }
    };
    fetchConfigs();
  }, []);  // Kết thúc useEffect


  /// 

  /** 
   * Logic xử lý khi thay đổi kịch bản được chọn
   * @prop selectedConfigId  Nếu state thay đổi thì tự động kích hoạt logic
   */
  useEffect(() => {
    async function fetchData() {
      if (selectedConfigId) {
        // Render giao diện phần thân chính, đồng thời lúc này mới có state scenario, shareCode, serialCommands
        await loadConfigById(selectedConfigId, null);
      }
      else {
        setShareCode("");
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfigId]);

  /**
   * Logix xử lý khi đăng xuất
   */
  useEffect(() => {

    if (isGuest) {
      loadConfigById(null, import.meta.env.VITE_DEFAULT_SHARE_CODE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);


  useEffect(() => {
    if (sharecodefromurl && sharecodefromurl != shareCode) {
      console.log(`URL ShareCode: ${sharecodefromurl}`);
      loadConfigById(null, sharecodefromurl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharecodefromurl]);

  /**
   * Nạp tải kịch bản lên giao diện với các component
   * @param idOrCode    Id hoặc ShareCode của kịch bản
   * @return  state scenario, state serialCommands, state ShareCode
   */
  async function loadConfigById(configId: number | null, shareCode: string | null): Promise<SerialConfig | null> {
    try {
      let url: string;
      if (configId == null) {
        if (shareCode != null) {
          url = `${import.meta.env.VITE_SPECIALIZED_API_URL}/share/${shareCode}`;
        } else {
          return null;
        }
      } else {
        url = `${import.meta.env.VITE_SPECIALIZED_API_URL}/scenarios/${configId}`;
      }
      console.log(url);

      /// Tạo request để tải kịch bản về
      const res = await fetch(url, {
        headers: isGuest
          ? {}
          : { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      /// Đợi response
      const data = await res.json() as SerialConfig;
      if (!res.ok) throw new Error("Không tìm thấy kịch bản.");
      /// Lưu state chứa toàn bộ kịch bản
      setConfig(data);
      // Ghi nhận vào state chứa mã chia sẻ
      if (shareCode == null) {
        setShareCode(data.shareCode);
      } else {
        setShareCode(shareCode);
        setSelectedConfigId(null);
      }

      /// Cập nhật banner hiển thị thông tin hướng dẫn hoặc quảng cáo mà URL năm trong kịch bản
      if (onConfigLoaded) {
        onConfigLoaded(data);
      }
      /// Lưu lại vào state danh sách các serial default command chứa trong kịch bản
      const initial: { [key: number]: string } = {};
      data.components.forEach((c: SerialAction) => {
        initial[c.id] = c.defaultValue || "";
      });
      setSerialCommands(initial);
      return data;
    } catch (err) {
      alert("Lỗi khi tải kịch bản: " + (err instanceof Error ? err.message : String(err)));
      setConfig(null);
      setSerialCommands({});
      throw err;
    }
  };

  const handleChange = (id: number, value: string) => {
    setSerialCommands((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendSingle = async (value: string, id: number) => {
    const response = await sendData({ [id]: value });

    setFeedbacks((prev) => ({ ...prev, [id]: response }));

    // ✅ Thêm phản hồi vào khung output tổng
    setSerialOutput((prev: string) => prev + `↪ ${id}: ${response}\n`);
  };

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    const text = await file.text();
    try {
      const payload = JSON.parse(text);
      const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/scenarios/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import thất bại");

      alert("Import thành công!");
      window.location.reload();
    } catch (err: unknown) {
      alert("Lỗi import file: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleExport = async () => {
    if (!selectedConfigId) return;
    const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/scenarios/export/${selectedConfigId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "scenario"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Hàm sự kiện Chia sẻ kịch bản với cộng đồng
   * @param selectedConfigId Tham số ngầm định, là id của kịch bản dang chọn
   * @callback Nút bấm trên giao diện 
   * @returns 
   */
  const handleShare = async () => {
    if (!selectedConfigId) return;
    // Gửi yêu cầu lên server
    const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/scenarios/share/${selectedConfigId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    // lấy về mã chia sẻ
    const data = await res.json();
    setShareCode(data.shareCode);
    alert("Share Code: " + data.shareCode);
  };

  const handleDeleteConfig = async () => {
    if (!selectedConfigId) return;
    if (!window.confirm("Bạn chắc chắn muốn xoá kịch bản này?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/scenarios/${selectedConfigId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xoá thất bại");
      alert("Xoá thành công!");
      window.location.reload();
    } catch (err) {
      alert("Lỗi khi xoá kịch bản: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // để cập nhật lại trạng thái giao diện
  };

  const onClickConnectToDevice = () => {
    connectToSerial(scenario?.baudrate || 115200)
  };

  function handleInputShareCode(): void {
    const manualShareCode: string | null = prompt("Nhập mã chia sẻ của một kịch bản nào dó bạn biết.", "");
    if (manualShareCode != null) {
      // Gọi hàm ngoài update lại giao diện
      loadConfigById(null, manualShareCode);
    }
  }


  /**
   * Hàm xử lý sự kiện click dropdown để chọn kí tự phân tách lệnh mới: CRLF, CR, LF
   * @param eventKey 
   */
  function handleNewLineSelect(eventKey: string | null) {
    if (eventKey) {
      setNewLineValue(eventKey);
    }
  };

  // Hàm này sẽ render nội dung của tooltip
  const renderTooltip = (props: any) => (
    <Tooltip id="dropdown-newline-tooltip" {...props}>
      CR = 0x0D = \r <br />
      LF = 0x0A = \n
    </Tooltip>
  );


  /**
   * Hàm xử lý sự kiện click dropdown để chọn baudrate
   * @param eventKey 
   */
  const handleBaudrateSelect = (eventKey: number | null) => {
    if (eventKey) {
      setSelectedBaudrate(eventKey);
    }
  };


  /** Tên của kịch bản được chọn */
  const selectedScenario = scenarios.find(cfg => cfg.id === selectedConfigId);

  /**
   * Hàm xử lý sự kiện click dropdown để chọn screnario
   * @description Hàm này sẽ được gọi khi người dùng chọn một mục trong dropdown
   * @callback Hàm này sẽ cập nhật state selectedConfigId để kích hoạt useEffect cập nhật kịch bản
   * @param eventKey 
   */
  const handleScenarioSelect = (eventKey: string | null) => {
    setSelectedConfigId(eventKey ? Number(eventKey) : null);
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand id="sharedcode">
            <ShareCode code={shareCode} />
          </Navbar.Brand>



          <Dropdown onSelect={handleScenarioSelect}>
            <Dropdown.Toggle
              variant="light"
              id="scenario-dropdown"
              disabled={isGuest}
              title="Serial Scenarios"
              className="m-auto"
            >
              {selectedScenario ? selectedScenario.name : "-- Chọn kịch bản --"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey={undefined} active={selectedConfigId === null}>
                -- Chọn kịch bản --
              </Dropdown.Item>

              {/* Dùng map để lặp qua mảng scenarios từ state */}
              {scenarios.map((cfg) => (
                <Dropdown.Item
                  key={cfg.id}
                  eventKey={cfg.id.toString()}
                  className={cfg.isShared ? "text-danger" : "text-dark"}
                  active={cfg.id === selectedConfigId}
                >
                  {cfg.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>


          <input
            type="file"
            accept="application/json"
            className="d-none"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="Kịch bản" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleInputShareCode} className="text-danger"> <i className="bi bi-code-square"></i> Nhập mã kịch bản...</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleShare} className={(isGuest ? "disabled" : "text-danger")}> <i className="bi bi-globe"></i> Chia sẻ với cộng đồng    </NavDropdown.Item>
                <NavDropdown.Item onClick={handleShare} className={(isGuest ? "disabled" : "text-dark")}> <i className="bi bi-person-lock"></i> Dừng chia sẻ (todo) </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleImport} className={isGuest ? "disabled" : ""}> <i className="bi bi-cloud-arrow-up"></i> Up lên file kịch bản... </NavDropdown.Item>
                <NavDropdown.Item onClick={handleExport} className={isGuest ? "disabled" : ""}> <i className="bi bi-cloud-arrow-down"></i> Tải về file kịch bản </NavDropdown.Item>
                <NavDropdown.Item onClick={handleDeleteConfig} className={isGuest ? "disabled" : ""}> <i className="bi bi-trash"></i> Xóa kịch bản hiện thời..</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <div className="vr d-none d-lg-block"></div>
            <Nav className="me-auto">
              <NavDropdown title="Hợp tác (todo)" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleImport} className="text-danger"> <i className="bi bi-link-45deg"></i> Kết nối từ xa (todo)... </NavDropdown.Item>
                <NavDropdown.Item onClick={handleExport}> <i className="bi bi-ban"></i> Ngắt kết nối (todo)  </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="text-danger"> <i className="bi bi-share"></i> Chia sẻ phiên (todo)</NavDropdown.Item>
                <NavDropdown.Item > <i className="bi bi-wifi-off"></i> Dừng chia sẻ (todo)</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            &nbsp;
            <div className="vr d-none d-lg-block"></div>
            &nbsp;
            {isGuest ? (<Nav.Link onClick={handleLogin} className="text-decoration-underline">Đăng nhập <i className="bi bi-box-arrow-in-right"></i></Nav.Link>)
              : (<Nav.Link onClick={handleLogout} className="text-decoration-underline">Đăng xuất <i className="bi bi-box-arrow-right"></i></Nav.Link>)}
          </Navbar.Collapse>
        </Container>
      </Navbar>


      <h2 className="title">Kết nối Serial </h2>
      <div className="d-flex align-items-center text-center">
        <Button variant="danger" onClick={onClickConnectToDevice} className="m-1">
          Kết nối thiết bị
        </Button>
        <Dropdown onSelect={handleBaudrateSelect}>
          <Dropdown.Toggle variant="warning" id="dropdown-baudrate" className="m-1">
            {selectedBaudrate}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {/* 5. Dùng map để tạo các Dropdown.Item. */}
            {baudrates.map((rate, index) => (
              <Dropdown.Item
                key={index}
                // Đảm bảo eventKey là string, vì Dropdown chỉ nhận string.
                eventKey={rate.toString()}
                active={rate == selectedBaudrate}
                className={rate == selectedBaudrate ? "text-light" : "text-dark"}
              >
                {rate}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          <Dropdown onSelect={handleNewLineSelect}>
            <Dropdown.Toggle variant="info" id="dropdown-newline" className="m-1">
              {newLineValue}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {/* Mỗi Dropdown.Item cần có eventKey để xác định giá trị */}
              <Dropdown.Item eventKey="need to do">need to do</Dropdown.Item>
              <Dropdown.Item eventKey="CRLF">CRLF</Dropdown.Item>
              <Dropdown.Item eventKey="CR">CR</Dropdown.Item>
              <Dropdown.Item eventKey="LF">LF</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </OverlayTrigger>
        <Button variant="success" onClick={disconnect} className="m-1">
          Ngắt kết nối
        </Button>
      </div>

      {scenario && (
        <>
          <h2 className="title">{scenario.name}</h2>
          <p><strong>Hệ thống:</strong> {scenario.description}</p>

          <div>
            {scenario.components.map((comp: SerialAction) => (
              <ComponentRenderer
                key={comp.id}
                component={comp}
                value={serialCommands[comp.id]}
                onChange={(val: string) => handleChange(comp.id, val)}
                onSend={() => handleSendSingle(serialCommands[comp.id], comp.id)}
                feedback={feedbacks[comp.id] || ""}
              />

            ))}
          </div>

          <div className="info-item">
            <label>Phản hồi từ thiết bị:</label>
            <textarea value={serialOutput} readOnly rows={6} className="w-100" />
          </div>
        </>
      )}
    </div>
  );
}

export default DeviceSetting;
