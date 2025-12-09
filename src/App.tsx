import { useEffect, useState, type JSX } from "react";
import "./App.css";
import { setupSerialConnection } from "simple-web-serial";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
} from "@mui/material";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";

const fullCommandNameMap: {
  [key: string]: string;
} = {
  x: "Move X+",
  y: "Move Y+",
  n: "Travel To Next Bin",
  h: "Home X",
  j: "Home Y ",
};

function App() {
  const [bins, setBins] = useState([
    { id: 1, name: "Alcohol 95%" },
    { id: 2, name: "Water" },
    { id: 3, name: "Bluing Agent" },
  ]);
  const [binElements, setBinElements] = useState<JSX.Element[]>([]);
  const [connection, setConnection] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");
  const [xpos, setXpos] = useState(0);
  const [ypos, setYpos] = useState(0);
  const [xmax, setXmax] = useState(1400);
  const [ymax, setYmax] = useState(600);
  const [currentBin, setCurrentBin] = useState(-1);
  const [traveling, setTraveling] = useState("stopped");
  const [commandQueue, setCommandQueue] = useState<string[]>(["n", "n"]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [commandsFinished, setCommandsFinished] = useState(false);
  async function connectSerial() {
    const connection = setupSerialConnection({});
    setConnection(connection);

    connection.on("event-from-arduino", handleData);
  }

  function handleData(data: any) {
    if (data && typeof data === "string") {
      if (data.startsWith("moving") || data.startsWith("done")) {
        const [t, x, y] = data.split(" ");
        setXpos(parseInt(x));
        setYpos(parseInt(y));
      }
      if (data.includes("done")) {
        setCommandsFinished(true);
      }
    }
  }

  useEffect(() => {
    if (!commandsFinished) {
      return;
    }
    console.log("===================", commandsFinished);
    setCommandsFinished(false);

    if (currentQueueIndex >= 0) {
      setCurrentQueueIndex(currentQueueIndex + 1);
    }
  }, [commandsFinished]);

  useEffect(() => {
    if (currentQueueIndex === -1) {
      return;
    }

    if (currentQueueIndex >= commandQueue.length) {
      console.log("Done with queue");

      setCurrentQueueIndex(-1);
    } else {
      const command = commandQueue[currentQueueIndex];
      setTraveling("moving");
      connection.send("event-to-arduino", command);
    }
  }, [currentQueueIndex]);

  useEffect(() => {
    connectSerial();
  }, []);

  useEffect(() => {
    const elementsToSet = [
      <div
        key={-1}
        style={{ width: "100px", height: "100%", justifyContent: "center" }}
      >
        &nbsp;
      </div>,
    ];
    for (let i = 0; i < bins.length; i++) {
      if (traveling === "forward" && i === currentBin) {
        elementsToSet.push(
          <div style={{ width: "100px", height: "50px" }}>
            <ArrowRight />
          </div>
        );
      }
      elementsToSet.push(
        <Card
          key={i}
          sx={{
            m: 2,
            backgroundColor: i === currentBin ? "lightblue" : "white",
          }}
        >
          <CardActionArea>
            <CardHeader title={bins[i].name} />
            <CardContent>Position: {i + 1}</CardContent>
          </CardActionArea>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                if (currentBin === i) {
                  if (ypos == 0) {
                    setCommandQueue(["j"]);
                  } else {
                    setCommandQueue([]);
                  }
                  return;
                }
                const newcommands = [];
                if (ypos > 0) {
                  newcommands.push("j");
                }

                if (currentBin < i) {
                  for (let j = currentBin; j < i; j++) {
                    newcommands.push("n");
                  }
                } else if (currentBin > i) {
                  for (let j = currentBin; j > i; j--) {
                    newcommands.push("p");
                  }
                }
                newcommands.push("y");
                setCommandQueue(newcommands);
              }}
            >
              Move to
            </Button>
          </CardActions>
        </Card>
      );
      if (traveling === "backward" && i === currentBin - 1) {
        elementsToSet.push(
          <div
            key={"asdf"}
            style={{ width: "100px", height: "100%", justifyContent: "center" }}
          >
            <ArrowLeft />
          </div>
        );
      } else {
        elementsToSet.push(
          <div
            key={"asdf" + i.toString()}
            style={{ width: "100px", height: "100%", justifyContent: "center" }}
          >
            &nbsp;
          </div>
        );
      }
    }
    setBinElements(elementsToSet);
  }, [traveling, currentBin]);

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
      <Card sx={{ m: 2, p: 2 }}>
        <CardHeader title="Controls" />
        <div>
          <button onClick={() => connection.send("event-to-arduino", "RESET")}>
            RESET
          </button>
        </div>
        <div>
          <button onClick={() => connection.send("event-to-arduino", "y")}>
            Move Y
          </button>
          <button onClick={() => connection.send("event-to-arduino", "j")}>
            Home Y
          </button>
        </div>
        <div>
          <button onClick={() => connection.send("event-to-arduino", "x")}>
            Move X
          </button>
          <button onClick={() => connection.send("event-to-arduino", "h")}>
            Home X
          </button>
        </div>
        <button
          onClick={() => {
            setTraveling("forward");
            connection.send("event-to-arduino", "n");
          }}
        >
          Next Bin
        </button>
        <button onClick={() => connection.send("event-to-arduino", "p")}>
          Previous Bin
        </button>
      </Card>
      <Card>
        <CardHeader title="Command Queue" />
        <CardContent>
          {commandQueue.map((c, i) => (
            <div
              style={{
                backgroundColor:
                  i === currentQueueIndex ? "lightblue" : "white",
              }}
              key={i}
            >
              {fullCommandNameMap[c]}
            </div>
          ))}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              setCurrentQueueIndex(0);
            }}
          >
            Execute
          </Button>
        </CardActions>
      </Card>
      <div>
        x: {xpos} y:{ypos}
      </div>
      <div
        style={{
          width: "100%",
          height: "100px",
          maxWidth: "1000px",
          // backgroundColor: "grey",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: "10px",
            border: "1px solid black",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{ width: "10px", height: (100 * ypos) / ymax + "%" }}
          ></div>
          <div
            style={{ width: "10px", height: "10px", backgroundColor: "black" }}
          ></div>
        </div>
        <div
          style={{
            width: (xpos / xmax) * 100 + "%",

            // backgroundColor: "green",
            transition: "width 0.5s ease-in-out",
          }}
        ></div>
      </div>
      <div
        style={{
          width: "100%",
          height: "10px",
          maxWidth: "1000px",
          backgroundColor: "grey",
          display: "flex",
          justifyContent: "flex-end",
        }}
      ></div>
      {currentQueueIndex}
      {traveling}
      <button onClick={() => setXpos(xpos + 10)}>change</button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {binElements}
      </div>
    </>
  );
}

export default App;
