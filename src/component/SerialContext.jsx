import React, { createContext, useRef, useState } from "react";

export const SerialContext = createContext();

export const SerialProvider = ({ children }) => {
  const [port, setPort] = useState(null);
  const [output, setOutput] = useState("");
  const [receivedData, setReceivedData] = useState("");
  const portRef = useRef(null);
  const writerRef = useRef(null); // lưu writer toàn cục

  const connectToSerial = async () => {
    if (!("serial" in navigator)) {
      alert("Trình duyệt không hỗ trợ Web Serial API.");
      return;
    }

    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });

      portRef.current = selectedPort;
      setPort(selectedPort);

      // ✅ Khởi tạo TextEncoder và writer một lần
      const encoder = new TextEncoderStream();
      encoder.readable.pipeTo(selectedPort.writable);
      writerRef.current = encoder.writable.getWriter();

      alert("Đã kết nối thiết bị.");
      await readData(selectedPort);
    } catch (error) {
      console.error("Kết nối serial thất bại:", error);
      alert("Không thể kết nối đến thiết bị.");
    }
  };

  const sendData = async (dataMap) => {
    const currentPort = portRef.current;
    const writer = writerRef.current;

    if (!currentPort || !writer) {
      alert("Thiết bị chưa được kết nối.");
      return "";
    }

    for (const [key, value] of Object.entries(dataMap)) {
      if (value && value.toString().trim() !== "") {
        await writer.write(`${key}=${value}\n`);
      }
    }

    return await readData(currentPort);
  };

  const readData = async (port) => {
    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    let data = "";

    try {
      const { value } = await reader.read();
      if (value) {
        data += value;
        setReceivedData(data);
        setOutput((prev) => prev + "\n" + data);
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi đọc từ thiết bị:", error);
      return "";
    } finally {
      reader.releaseLock();
    }
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
