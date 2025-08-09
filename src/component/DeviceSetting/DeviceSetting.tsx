import React, { useEffect, useState, useRef } from "react";
import ComponentRenderer from "../componentrenderer/ComponentRenderer";
import { SerialContext } from "../SerialContext";
import ShareCode from "../ShareCode/ShareCode";
import { useNavigate } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import SplitButton from 'react-bootstrap/SplitButton';

import { SerialConfig } from '../../dto/SerialConfig';
import { SerialAction } from "../../dto/SerialAction";


// Định nghĩa kiểu cho props
interface DeviceSettingProps {
  onConfigLoaded: (config: SerialConfig) => void;
}


function DeviceSetting({ onConfigLoaded }: DeviceSettingProps) {
  const { connectToSerial, sendData, serialOutput, setSerialOutput, disconnect } = React.useContext(SerialContext);

  const [shareCode, setShareCode] = useState<string>("");
  /** Chứa danh sách các cấu hình của tài khoản hiện thời */
  const [configs, setConfigs] = useState<SerialConfig[]>([]);
  /** ID của cấu hình đang được áp dụng/hiển thị lên giao diện. */
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  /** Nội đung hoàn chỉnh của cấu hình đang được render lên giao diện, tương ứng với selectedConfigId */
  const [config, setConfig] = useState<SerialConfig | null>(null);
  /** Danh sách các serial default command  và id của từng SerialAction */
  const [values, setValues] = useState<{ [key: number]: string }>({});
  /** Điều khiển upload file cấu hình */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const isGuest = !localStorage.getItem("token");
  const navigate = useNavigate();

  /**
   * Lấy về toàn bộ CÁC cấu hình của TÀI KHOẢN hiện tại
   * @description do cần gọi hàm async fetch nên bắt buộc phải tạo một hàm async fetchConfigs và gọi ra ngay lập tức. Đây là qui định của useEffect.
   */
  useEffect(() => {

    const fetchConfigs = async () => {
      try {
        // Gửi yêu cầu tải về về các cấu hình của tài khoản hiện thời
        const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/myconfigs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        /// Lấy về các cấu hình
        const data = await res.json();
        /// Phân tích trạng thái response
        if (res.ok) {
          /// Nếu ổn thì lưu vào state configs
          setConfigs(data);
          /// Nếu ổn thì lưu vào state configs
          if (data.length > 0) {
            /// - Coi như người dùng chọn cấu hình đầu tiên. Lưu state Id này ==> kích hoạt useEffect update
            setSelectedConfigId(data[0].id);
          }
        } else {
          console.error("Lỗi khi lấy danh sách cấu hình:", res.text);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Lỗi khi lấy danh sách cấu hình:", err.message);
        } else {
          console.error("Lỗi khi lấy danh sách cấu hình:", String(err));
        }
      }
    };
    fetchConfigs();
  }, []);  // Kết thúc useEffect


  /// 

  /** 
   * Logic xử lý khi thay đổi cấu hình được chọn
   * @prop selectedConfigId  Nếu state thay đổi thì tự động kích hoạt logic
   */
  useEffect(() => {
    async function fetchData() {
      if (selectedConfigId) {
        // Render giao diện phần thân chính, đồng thời lúc này mới có state config, shareCode, values
        await loadConfigById(selectedConfigId, null);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfigId]);

  useEffect(() => {

    if (isGuest) {
      setSelectedConfigId(0);
    }
  }, [isGuest]);


  /**
   * Nạp tải cấu hình lên giao diện với các component
   * @param idOrCode    Id hoặc ShareCode của cấu hình
   * @return  state config, state values, state ShareCode
   */
  async function loadConfigById(configId: number | null, shareCode: string | null): Promise<SerialConfig | null> {
    try {
      let url: string;
      if (configId == null) {
        if (shareCode !=null) {
          url = `${import.meta.env.VITE_SPECIALIZED_API_URL}/share/${shareCode}`;
        } else {
          return null;
        }
      } else {
        url = `${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/${configId}`;
      }
      console.log(url);

      /// Tạo request để tải cấu hình về
      const res = await fetch(url, {
        headers: isGuest
          ? {}
          : { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      /// Đợi response
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tìm thấy cấu hình.");
      /// Lưu state chứa toàn bộ cấu hình
      setConfig(data);
      // Ghi nhận vào state chứa mã chia sẻ
      if (shareCode == null) {
        setShareCode(data.shareCode);
      }else{
        setShareCode(shareCode);
      }
      /// Cập nhật banner hiển thị thông tin hướng dẫn hoặc quảng cáo mà URL năm trong cấu hình
      if (onConfigLoaded) {
        onConfigLoaded(data);
      }
      /// Lưu lại vào state danh sách các serial default command chứa trong cấu hình
      const initial: { [key: number]: string } = {};
      data.components.forEach((c : SerialAction) => {
        initial[c.id] = c.defaultValue || "";
      });
      setValues(initial);
      return data;
    } catch (err) {
      alert("Lỗi khi tải cấu hình: " + (err instanceof Error ? err.message : String(err)));
      setConfig(null);
      setValues({});
      throw err;
    }
  };

  const handleChange = (id : number, value : string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendSingle = async (value : string, id : number) => {
    const response = await sendData({ [id]: value });

    setFeedbacks((prev) => ({ ...prev, [id]: response }));

    // ✅ Thêm phản hồi vào khung output tổng
    setSerialOutput((prev : string) => prev + `↪ ${id}: ${response}\n`);
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
      const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/import`, {
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
    const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/export/${selectedConfigId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "config"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Hàm sự kiện Chia sẻ cấu hình với cộng đồng
   * @param selectedConfigId Tham số ngầm định, là id của cấu hình dang chọn
   * @callback Nút bấm trên giao diện 
   * @returns 
   */
  const handleShare = async () => {
    if (!selectedConfigId) return;
    // Gửi yêu cầu lên server
    const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/share/${selectedConfigId}`, {
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
    if (!window.confirm("Bạn chắc chắn muốn xoá cấu hình này?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/${selectedConfigId}`, {
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
      alert("Lỗi khi xoá cấu hình: " + (err instanceof Error ? err.message : String(err)));
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
    connectToSerial(config?.baudrate || 115200)
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand id="sharedcode">
            <ShareCode code={shareCode} UpdateGUI={loadConfigById} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          &nbsp;
          <Navbar.Collapse id="basic-navbar-nav">
            <select
              title="Serial Configurations"
              onChange={(e ) => setSelectedConfigId(e.target.value ? Number(e.target.value) : null)}
              disabled={isGuest}
              value={selectedConfigId || ""}
            >
              <option value="">-- Chọn cấu hình --</option>
              {configs.map((cfg) => (
                <option key={cfg.id} value={cfg.id} className={cfg.isShared ? "text-danger" : "text-dark"}>
                  {cfg.name}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Nav className="me-auto">
              <NavDropdown title="Cấu hình" id="basic-nav-dropdown">                
                <NavDropdown.Item onClick={handleShare} className={(isGuest ? "disabled" : "text-danger")}> <i className="bi bi-globe"></i> Chia sẻ với cộng đồng    </NavDropdown.Item>
                <NavDropdown.Item onClick={handleShare} className={(isGuest ? "disabled" : "text-dark")}> <i className="bi bi-person-lock"></i> Dừng chia sẻ (todo) </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleDeleteConfig} className={isGuest ? "disabled" : ""}> <i className="bi bi-trash"></i> Xoá cấu hình hiện thời..</NavDropdown.Item>
                <NavDropdown.Item onClick={handleImport} className={isGuest ? "disabled" : ""}> <i className="bi bi-cloud-arrow-up"></i> Up lên file cấu hình... </NavDropdown.Item>
                <NavDropdown.Item onClick={handleExport} className={isGuest ? "disabled" : ""}> <i className="bi bi-cloud-arrow-down"></i> Tải về file cấu hình </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          <div className="vr"></div>            
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
            <div className="vr"></div>
            &nbsp;
          </Navbar.Collapse>
          {isGuest ? (<Nav.Link onClick={handleLogin} className="text-decoration-underline">Đăng nhập <i className="bi bi-box-arrow-in-right"></i></Nav.Link>)
            : (<Nav.Link onClick={handleLogout} className="text-decoration-underline">Đăng xuất <i className="bi bi-box-arrow-right"></i></Nav.Link>)}
        </Container>
      </Navbar>


      <h2 className="title">Kết nối Serial </h2>
      <div className="info-item align-items-center text-center">

        <Button variant="danger" onClick={onClickConnectToDevice}>Kết nối thiết bị</Button>
        &nbsp;
        &nbsp;
        <SplitButton
          key='baudrate'
          id='dropdown-split-variants-baudrate'
          variant='warning'
          title='baudrate (todo)'
        >
          <Dropdown.Item eventKey="4800">4800</Dropdown.Item>
          <Dropdown.Item eventKey="9600">9600</Dropdown.Item>
          <Dropdown.Item eventKey="19200">19200</Dropdown.Item>
          <Dropdown.Item eventKey="38400">38400</Dropdown.Item>
          <Dropdown.Item eventKey="57600">57600</Dropdown.Item>
          <Dropdown.Item eventKey="115200">11520</Dropdown.Item>
          <Dropdown.Item eventKey="230400">230400</Dropdown.Item>
        </SplitButton>
        &nbsp;
        &nbsp;
        <Button variant="success" onClick={disconnect}>Ngắt kết nối</Button>
      </div>


      {config && (
        <>
          <h3>{config.name}</h3>
          <p><strong>Hệ thống:</strong> {config.description}</p>

          <div>
            {config.components.map((comp : SerialAction) => (
              <ComponentRenderer
                key={comp.id}
                component={comp}
                value={values[comp.id]}
                onChange={(val : string) => handleChange(comp.id, val)}
                onSend={() => handleSendSingle(values[comp.id], comp.id)}
                feedback={feedbacks[comp.id] || ""}
              />

            ))}
          </div>

          <div className="info-item">
            <label>Phản hồi từ thiết bị:</label>
            <textarea value={serialOutput} readOnly rows={6} style={{ width: "100%" }} />
          </div>
        </>
      )}
    </div>
  );
}

export default DeviceSetting;
