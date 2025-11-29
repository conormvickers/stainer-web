import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null);

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
      <button onClick={selectSerialPort}>Select Serial Port</button>
    </>
  );
}

export default App;
