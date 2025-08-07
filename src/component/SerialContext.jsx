import React, { createContext, useRef, useState } from "react";

export const SerialContext = createContext();

export const SerialProvider = ({ children }) => {
  const [port, setPort] = useState(null);
  const [output, setOutput] = useState("");
  const [receivedData, setReceivedData] = useState("");
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);

  const connectToSerial = async (baudrate = 115200) => {
    if (!("serial" in navigator)) {
      alert("Trình duyệt không hỗ trợ Web Serial API.");
      return;
    }

    let selectedPort;
    try {
      selectedPort = await navigator.serial.requestPort();
    } catch {
      return;
    }

    try {  
      await selectedPort.open({ baudRate: parseInt(baudrate) || 115200 });
      portRef.current = selectedPort;
      
      setPort(selectedPort);

      writerRef.current = selectedPort.writable.getWriter();
      readerRef.current = selectedPort.readable.getReader();

      alert(`Kết nối thiết bị baudrate ${baudrate} thành công`);
      readLoop();
    } catch (error) {
      console.error("Kết nối serial thất bại:", error);
      alert("Không thể kết nối thiết bị.");
    }
  };

  const readLoop = async () => {
    try {
      while (true) {
        const { value, done } = await readerRef.current.read();
        if (done) break;
        if (value) {
          const text = new TextDecoder().decode(value);
          setReceivedData(text);
          setOutput((prev) => prev + "\n" + text);
        }
      }
    } catch (err) {
      console.warn("Đã dừng đọc:", err);
    } finally {
      readerRef.current?.releaseLock();
    }
  };

  const sendData = async (dataMap) => {
    if (!writerRef.current) {
      alert("Chưa kết nối thiết bị.");
      return "";
    }
    for (const [, value] of Object.entries(dataMap)) {
      if (value?.trim() !== "") {
        await writerRef.current.write(new TextEncoder().encode(`${value}\n`));
      }
    }
    return receivedData;
  };

  const disconnect = async () => {
    try {
      const currentPort = portRef.current;
      if (currentPort) {
        if (readerRef.current) {
          await readerRef.current.cancel();
          await readerRef.current.releaseLock();
          readerRef.current = null;
        }
        if (writerRef.current) {
          await writerRef.current.close();
          writerRef.current.releaseLock();
          writerRef.current = null;
        }
        await currentPort.close();
        portRef.current = null;
        setPort(null);
        alert("Đã đóng kết nối thành công.");
      }
    } catch (error) {
      console.error("Không thể đóng kết nối:", error);
      alert("Không thể đóng kết nối: " + error.message);
    }
  };

  return (
    <SerialContext.Provider
      value={{
        connectToSerial,
        sendData,
        disconnect,
        receivedData,
        output,
        port,
        setOutput,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};
