import React, { useEffect, useState, useRef } from "react";
import ComponentRenderer from "../componentrenderer/ComponentRenderer";
import { SerialContext } from "../SerialContext";
import { useNavigate } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import SplitButton from 'react-bootstrap/SplitButton';
import Overlay from 'react-bootstrap/Overlay';
function DeviceSetting({ onConfigLoaded }) {
  const { connectToSerial, sendData, output, disconnect } = React.useContext(SerialContext);

  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [config, setConfig] = useState(null);
  const [values, setValues] = useState({});
  const fileInputRef = useRef();
  const [feedbacks, setFeedbacks] = useState({});
  const isGuest = !localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/myconfigs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setConfigs(data);
        if (data.length > 0) {
          setSelectedConfigId(data[0].id);
          loadConfigById(data[0].id);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách cấu hình:", err);
      }
    };
    fetchConfigs();
  }, []);
  useEffect(() => {
    if (selectedConfigId) {
      loadConfigById(selectedConfigId);
    }
  }, [selectedConfigId]);
  useEffect(() => {
    if (isGuest) {
      setSelectedConfigId("000000");
    }
  }, [isGuest]);

  const loadConfigById = async (idOrCode) => {
    try {
      const url = isGuest
        ? `${import.meta.env.VITE_SPECIALIZED_API_URL}/share/${idOrCode}`
        : `${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/${idOrCode}`;

      const res = await fetch(url, {
        headers: isGuest
          ? {}
          : { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tìm thấy cấu hình.");

      setConfig(data);
      onConfigLoaded && onConfigLoaded(data);
      const initial = {};
      data.components.forEach((c) => {
        initial[c.id] = c.defaultValue || "";
      });
      setValues(initial);
    } catch (err) {
      alert("Lỗi khi tải cấu hình: " + err.message);
      setConfig(null);
      setValues({});
    }
  };


  const handleSelectConfig = () => {
    if (selectedConfigId) {
      loadConfigById(selectedConfigId);
    }
  };

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendSingle = async (value, id) => {
    const response = await sendData({ [id]: value });

    setFeedbacks((prev) => ({ ...prev, [id]: response }));

    // ✅ Thêm phản hồi vào khung output tổng
    setOutput((prev) => prev + `↪ ${id}: ${response}\n`);
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
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
    } catch (err) {
      alert("Lỗi import file: " + err.message);
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

  const handleShare = async () => {
    if (!selectedConfigId) return;
    const res = await fetch(`${import.meta.env.VITE_SPECIALIZED_API_URL}/configs/share/${selectedConfigId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
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
      alert("Lỗi khi xoá cấu hình: " + err.message);
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
          <Navbar.Brand href="#home">
            Mã chia sẻ
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          &nbsp;
          <div className="vr"></div>
          &nbsp;
          <Navbar.Collapse id="basic-navbar-nav">
            {isGuest ? (
              <>
                <input
                  type="text"
                  placeholder="Nhập mã chia sẻ..."
                  value={selectedConfigId || ""}
                  onChange={(e) => setSelectedConfigId(e.target.value)}
                />
                &nbsp;
                <button onClick={() => loadConfigById(selectedConfigId)}>
                  ..
                </button>

              </>
            ) : (
              <>
                <select
                  onChange={(e) => setSelectedConfigId(e.target.value)}
                  value={selectedConfigId || ""}
                >
                  <option value="">-- Chọn cấu hình --</option>
                  {configs.map((cfg) => (
                    <option key={cfg.id} value={cfg.id}>
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
              </>
            )}
            <Nav className="me-auto">
              <NavDropdown title="Cấu hình" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleImport}> Nhập vào từ file json... </NavDropdown.Item>
                <NavDropdown.Item onClick={handleExport}> Xuất ra file json        </NavDropdown.Item>
                <NavDropdown.Item onClick={handleDeleteConfig}> Xoá cấu hình hiện thời..</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleShare}>  Chia sẻ với cộng đồng    </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav className="me-auto">
              <NavDropdown title="Hợp tác (todo)" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleImport}> Kết nối từ xa (todo)... </NavDropdown.Item>
                <NavDropdown.Item onClick={handleExport}> Ngắt kết nối (todo)  </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={""} className="text-bg-info">  Chia sẻ phiên (todo)</NavDropdown.Item>
                <NavDropdown.Item onClick={""} className="text-bg-info">  Dừng chia sẻ (todo)</NavDropdown.Item>
              </NavDropdown>
            </Nav>            
            &nbsp;
            <div className="vr"></div>
            &nbsp;
          </Navbar.Collapse>
          {isGuest ? (<Nav.Link onClick={handleLogin}>Đăng nhập</Nav.Link>)
            : (<Nav.Link onClick={handleLogout}>Đăng xuất</Nav.Link>)}
        </Container>
      </Navbar>


      <h2 className="title">Kết nối Serial</h2>

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
            {config.components.map((comp) => (
              <ComponentRenderer
                key={comp.id}
                component={comp}
                value={values[comp.id]}
                onChange={(val) => handleChange(comp.id, val)}
                onSend={() => handleSendSingle(values[comp.id], comp.id)}
                feedback={feedbacks[comp.id] || ""}
              />

            ))}
          </div>

          <div className="info-item">
            <label>Phản hồi từ thiết bị:</label>
            <textarea value={output} readOnly rows={6} style={{ width: "100%" }} />
          </div>
        </>
      )}
    </div>
  );
}

export default DeviceSetting;
