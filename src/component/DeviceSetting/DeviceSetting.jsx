import React, { useEffect, useState, useRef } from "react";
import ComponentRenderer from "../componentrenderer/ComponentRenderer";
import { SerialContext } from "../SerialContext";
import { useNavigate } from "react-router-dom";

import "./DeviceSetting.css";

function DeviceSetting() {
  const { connectToSerial, sendData, output } = React.useContext(SerialContext);

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
        const res = await fetch("https://be-datn-mc6y.onrender.com/configs/myconfigs", {
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
        ? `https://be-datn-mc6y.onrender.com/share/${idOrCode}`
        : `https://be-datn-mc6y.onrender.com/configs/${idOrCode}`;

      const res = await fetch(url, {
        headers: isGuest
          ? {}
          : { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tìm thấy cấu hình.");

      setConfig(data);
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

  const handleSendAll = async () => {
    await sendData(values);
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
      const res = await fetch("https://be-datn-mc6y.onrender.com/configs/import", {
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
    const res = await fetch(`https://be-datn-mc6y.onrender.com/configs/export/${selectedConfigId}`, {
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
    const res = await fetch(`https://be-datn-mc6y.onrender.com/configs/share/${selectedConfigId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    alert("Share Code: " + data.shareCode);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // để cập nhật lại trạng thái giao diện
  };

  return (
    <div className="devicesetting">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        {isGuest ? (
          <button onClick={handleLogin}>Đăng nhập</button>
        ) : (
          <button onClick={handleLogout}>Đăng xuất</button>
        )}
      </div>

      <h2 className="title">Chọn cấu hình thiết bị</h2>
      <div className="info-item">
        {isGuest ? (
          <>
            <input
              type="text"
              placeholder="Nhập mã chia sẻ..."
              value={selectedConfigId || ""}
              onChange={(e) => setSelectedConfigId(e.target.value)}
            />
            <button onClick={() => loadConfigById(selectedConfigId)}>Tải cấu hình</button>
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
            <button onClick={handleImport}>Import</button>
            <button onClick={handleExport}>Export</button>
            <button onClick={handleShare}>Share</button>
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </>
        )}
        <button onClick={connectToSerial}>Kết nối thiết bị</button>
        <button onClick={handleSendAll}>Gửi toàn bộ cấu hình</button>
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
