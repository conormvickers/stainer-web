import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { setupSerialConnection } from "simple-web-serial";

const baudRate = 115200;
function App() {
  const [connection, setConnection] = useState<any | null>(null);
  async function connectSerial() {
    const connection = setupSerialConnection({
      requestAccessOnPageLoad: true,
      requestElement: "serial-request",
    });
    setConnection(connection);
    connection.on("event-from-arduino", function (data) {
      console.log('Received event "event-from-arduino" with parameter ' + data);
    });
  }

  async function sendSerial(data: string) {}
  useEffect(() => {
    connectSerial();
  }, []);

  async function selectSerialPort() {}

  return (
    <>
      {connection ? "Connected" : "Disconnected"}
      <div id="serial-request">fes</div>

      <button onClick={selectSerialPort}>Select Serial Port</button>
      <button onClick={() => connection.send("event-to-arduino", "x")}>
        test
      </button>

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
