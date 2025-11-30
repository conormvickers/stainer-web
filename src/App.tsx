import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const baudRate = 115200;
function App() {
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null);

  async function connectSerial() {
    await serialPort.open({ baudRate: baudRate });
  }

  async function sendSerial(data: string) {
    if (serialPort) {
      const writer = serialPort.writable.getWriter();
      const dataToSend = new TextEncoder().encode(data);
      await writer.write(dataToSend);
      writer.releaseLock();
    }
  }
  useEffect(() => {
    if (serialPort) {
      connectSerial();
    }
  }, [serialPort]);

  async function selectSerialPort() {
    if (!navigator.serial) {
      console.error("Serial API is not supported in this browser.");
      return null;
    }
    try {
      const port = await navigator.serial.requestPort();
      setSerialPort(port);
      // User selected a port, now you can open it and communicate
      console.log("Selected port:", port);
      return port;
    } catch (error) {
      console.error("Error selecting serial port:", error);
      return null;
    }
  }

  return (
    <>
      {serialPort && serialPort.connected ? "Connected" : "Disconnected"}

      <button onClick={selectSerialPort}>Select Serial Port</button>
      <button onClick={() => sendSerial("x")}>Move X</button>
      <button onClick={() => sendSerial("y")}>Move Y</button>

      <button onClick={() => sendSerial("h")}>Home X</button>
      <button onClick={() => sendSerial("j")}>Home Y</button>
      <div>
        <button onClick={() => sendSerial("n")}>Next Bin</button>
      </div>
    </>
  );
}

export default App;
