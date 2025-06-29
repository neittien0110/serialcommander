import React, { createContext, useRef, useState } from "react";

export const SerialContext = createContext();

export const SerialProvider = ({ children }) => {
  const [port, setPort] = useState(null);
  const [output, setOutput] = useState("");
  const [receivedData, setReceivedData] = useState("");
  const portRef = useRef(null);
  const writerRef = useRef(null);
  const readerRef = useRef(null); // ⚠️ lưu reader duy nhất
  const decoderRef = useRef(null); // ⚠️ lưu decoder để không pipeTo nhiều lần

  const connectToSerial = async (baudrate = 115200) => {
    if (!("serial" in navigator)) {
      alert("Trình duyệt không hỗ trợ Web Serial API.");
      return;
    }

    try {
      const selectedPort = await navigator.serial.requestPort();

      // parse baudrate (chuỗi sang số) và fallback 115200
      const parsedBaudrate = parseInt(baudrate) || 115200;

      await selectedPort.open({ baudRate: parsedBaudrate });

      portRef.current = selectedPort;
      setPort(selectedPort);

      // ✅ chỉ pipeTo 1 lần
      const encoder = new TextEncoderStream();
      encoder.readable.pipeTo(selectedPort.writable);
      writerRef.current = encoder.writable.getWriter();

      const decoder = new TextDecoderStream();
      decoderRef.current = decoder;
      selectedPort.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();
      readerRef.current = reader;

      alert(`Đã kết nối thiết bị với baudrate ${parsedBaudrate}`);

      // Bắt đầu đọc liên tục
      readLoop(reader);
    } catch (error) {
      console.error("Kết nối serial thất bại:", error);
      alert("Không thể kết nối đến thiết bị.");
    }
  };
  const readLoop = async (reader) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          setReceivedData(value);
          setOutput((prev) => prev + "\n" + value);
        }
      }
    } catch (err) {
      console.warn("Đã dừng đọc:", err);
    } finally {
      reader.releaseLock();
    }
  };

  const sendData = async (dataMap) => {
    const writer = writerRef.current;

    if (!portRef.current || !writer) {
      alert("Thiết bị chưa được kết nối.");
      return "";
    }

    for (const [key, value] of Object.entries(dataMap)) {
      if (value && value.toString().trim() !== "") {
        await writer.write(`${key}=${value}\n`);
      }
    }

    // ❌ không gọi read lại nữa — đã có vòng `readLoop` rồi
    return receivedData;
  };

  return (
    <SerialContext.Provider
      value={{
        connectToSerial,
        sendData,
        receivedData,
        output,
        port,
        setPort,
        setOutput,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};
