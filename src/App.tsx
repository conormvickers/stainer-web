import { useEffect, useState } from "react";
import "./App.css";
import { setupSerialConnection } from "simple-web-serial";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
} from "@mui/material";

function App() {
  const bins = [
    { id: 1, name: "Bin 1" },
    { id: 2, name: "Bin 2" },
  ];
  const [connection, setConnection] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");
  async function connectSerial() {
    const connection = setupSerialConnection({});
    setConnection(connection);

    connection.on("event-from-arduino", function (data) {
      console.log('Received event "event-from-arduino" with parameter ' + data);
    });
  }
  useEffect(() => {
    connectSerial();
  }, []);

  return (
    <>
      <div>
        <Button
          variant={connectionStatus === "connected" ? "outlined" : "contained"}
          onClick={async () => {
            await connection.startConnection();
            console.log("Connected");
            setConnectionStatus(
              connection.ready() ? "connected" : "disconnected"
            );
          }}
        >
          Connect!
        </Button>
      </div>
      <div>{connectionStatus}</div>

      <div>
        <button onClick={() => connection.send("event-to-arduino", "y")}>
          Move Y
        </button>
      </div>
      <div>
        <button onClick={() => connection.send("event-to-arduino", ",n")}>
          Next Bin
        </button>
        <button onClick={() => connection.send("event-to-arduino", "x")}>
          Move X
        </button>
        <button onClick={() => connection.send("event-to-arduino", "h")}>
          Home X
        </button>
      </div>
      <button onClick={() => connection.send("event-to-arduino", "j")}>
        Home Y
      </button>
      <div style={{ display: "flex" }}>
        {bins.map((bin) => (
          <Card
            style={{
              padding: "10px",
              flexGrow: 1,
              margin: "10px",
              border: "1px solid black",
              maxWidth: "200px",
              height: "200px",
            }}
          >
            <CardHeader title={bin.name} />
            <CardActions>
              <Button>Dip Here Now</Button>
            </CardActions>
          </Card>
        ))}
      </div>
    </>
  );
}

export default App;
