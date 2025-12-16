import { useEffect, useState, type JSX } from "react";
import "./App.css";
import { setupSerialConnection } from "simple-web-serial";
import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ConnectWithoutContact,
  East,
  LinkOff,
  Lock,
  LockOpen,
} from "@mui/icons-material";

const fullCommandNameMap: {
  [key: string]: string;
} = {
  x: "Move X+",
  y: "Move Y+",
  n: "Travel To Next Bin",
  p: "Travel To Previous Bin",
  h: "Home X",
  j: "Home Y ",
  wait: "Wait for X seconds",
};

function App() {
  const [bins, setBins] = useState([
    { position: 0, name: "Waiting Bin" },
    { position: 1, name: "Methanol Alcohol" },
    { position: 2, name: "Tap Water" },
    { position: 3, name: "Hematoxylin" },
    { position: 4, name: "Bluing Solution" },
    { position: 5, name: "95% Alcohol" },
    { position: 6, name: "Eosin" },
    { position: 7, name: "100% Alcohol" },
    { position: 8, name: "Xylene" },
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
  const [commandQueue, setCommandQueue] = useState<string[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [commandsFinished, setCommandsFinished] = useState(false);
  const [stainingPlan, setStainingPlan] = useState<
    { step: number; bin: string; time: number }[]
  >([
    { step: 1, bin: "Methanol Alcohol", time: 1 },
    { step: 2, bin: "Tap Water", time: 1 },
    { step: 3, bin: "Hematoxylin", time: 1 },
    { step: 4, bin: "Tap Water", time: 1 },
    { step: 5, bin: "Bluing Solution", time: 1 },
    { step: 6, bin: "Tap Water", time: 1 },
    { step: 7, bin: "95% Alcohol", time: 1 },
    { step: 8, bin: "Eosin", time: 1 },
    { step: 9, bin: "95% Alcohol", time: 1 },
    { step: 10, bin: "100% Alcohol", time: 1 },
    { step: 11, bin: "Xylene", time: 1 },
  ]);
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
      if (command.startsWith("wait")) {
        setTraveling("waiting");
        const [_, time] = command.split(" ");
        setTimeout(() => {
          setCurrentQueueIndex(currentQueueIndex + 1);
        }, parseInt(time) * 1000);
      } else {
        setTraveling("moving");
        connection.send("event-to-arduino", command);
      }
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
            <CardContent>Position: {bins[i].position}</CardContent>
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
    }
    setBinElements(elementsToSet);
  }, [traveling, currentBin]);

  const [stainingPlanElements, setStainingPlanElements] = useState<
    JSX.Element[]
  >([]);
  useEffect(() => {
    let pretendCurrentBin = -1;
    const queueToSet = ["j", "h"];
    const elementsToSet = [
      <Card key={-1}>
        <CardHeader title="Start" />
      </Card>,
      <East key={-11234}></East>,
    ];
    for (let i = 0; i < stainingPlan.length; i++) {
      const targetBinIndex = bins.findIndex(
        (b) => b.name === stainingPlan[i].bin
      );
      if (targetBinIndex === -1) {
        throw new Error("Could not find bin " + stainingPlan[i].bin);
      }
      const targetBin = bins[targetBinIndex];
      const binsAway = targetBin.position - pretendCurrentBin;

      queueToSet.push("j");

      if (binsAway > 0) {
        for (let j = 0; j < binsAway; j++) {
          queueToSet.push("n");
        }
      } else if (binsAway < 0) {
        for (let j = 0; j < -binsAway; j++) {
          queueToSet.push("p");
        }
      }

      queueToSet.push("y");

      queueToSet.push("wait " + stainingPlan[i].time.toString());
      pretendCurrentBin = targetBin.position;

      elementsToSet.push(
        <Card
          key={i}
          sx={{
            m: 2,
          }}
        >
          <CardActionArea>
            <CardHeader title={stainingPlan[i].bin} />
            <CardContent>
              <Typography variant="body2">
                Step: {stainingPlan[i].step}
              </Typography>
              <Typography variant="body2">
                Time: {stainingPlan[i].time} seconds
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      );
      elementsToSet.push(<East key={i.toString() + "asaselkfjloij"}></East>);
    }
    elementsToSet.push(
      <Card key={"end"}>
        <CardHeader title="Finish" />
      </Card>
    );

    queueToSet.push("j");
    queueToSet.push("h");
    pretendCurrentBin = -1;

    //send to drying / waiting bin
    const targetBinIndex = bins.findIndex((b) => b.name === "Waiting Bin");
    if (targetBinIndex === -1) {
      throw new Error("Could not find bin " + "Waiting Bin");
    }
    const targetBin = bins[targetBinIndex];
    const binsAway = targetBin.position - pretendCurrentBin;

    queueToSet.push("j");

    if (binsAway > 0) {
      for (let j = 0; j < binsAway; j++) {
        queueToSet.push("n");
      }
    } else if (binsAway < 0) {
      for (let j = 0; j < -binsAway; j++) {
        queueToSet.push("p");
      }
    }

    setStainingPlanElements(elementsToSet);
    setCommandQueue(queueToSet);
  }, [stainingPlan]);

  const [wakeLock, setWakeLock] = useState<any>(null);
  return (
    <div style={{}}>
      <AppBar>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "10px",
            width: "100%",
          }}
        >
          <Typography variant="h6">Stainer Control</Typography>
          <div>
            <IconButton
              onClick={async () => {
                await connection.startConnection();
                console.log("Connected");
                setConnectionStatus(
                  connection.ready() ? "connected" : "disconnected"
                );
              }}
            >
              {connection && connection.ready() ? (
                <CheckCircle style={{ color: "white" }} />
              ) : (
                <LinkOff style={{ color: "red" }} />
              )}
            </IconButton>
            <IconButton
              onClick={async () => {
                try {
                  // Request a screen wake lock of type 'screen'
                  let wakeLock = await navigator.wakeLock.request("screen");
                  console.log("Screen Wake Lock is active!");
                  setWakeLock("ON");
                  // Add an event listener to be notified if the lock is released by the system
                  wakeLock.addEventListener("release", () => {
                    console.log(
                      "Screen Wake Lock released by system:",
                      wakeLock.released
                    );
                    setWakeLock("OFF"); // Release the wake lock
                  });
                } catch (err: any) {
                  // Handle the failure case
                  console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
                }
              }}
            >
              {wakeLock ? (
                <Lock style={{ color: "white" }} />
              ) : (
                <LockOpen style={{ color: "red" }} />
              )}
            </IconButton>
          </div>
        </div>
      </AppBar>

      <div style={{ height: "100px" }}></div>
      <div style={{ display: "flex" }}>
        <Button
          size="large"
          color="primary"
          variant="outlined"
          onClick={() => {
            setCurrentQueueIndex(0);
          }}
        >
          Execute
        </Button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
        <Card sx={{ m: 2, p: 2, maxWidth: "300px" }}>
          <CardHeader title="Controls" />
          <div>
            <button
              onClick={() => connection.send("event-to-arduino", "RESET")}
            >
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
        <Card sx={{ m: 2, p: 2, maxWidth: "300px", maxHeight: "300px" }}>
          <CardHeader title="Command Queue" />
          <CardContent>
            <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
              {commandQueue.map((c, i) => (
                <div
                  style={{
                    backgroundColor:
                      i === currentQueueIndex ? "lightblue" : "white",
                  }}
                  key={i}
                >
                  {c.startsWith("wait")
                    ? "Wait " + c.slice(5) + " seconds"
                    : fullCommandNameMap[c]}
                </div>
              ))}
            </div>
          </CardContent>
          <CardActions></CardActions>
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {stainingPlanElements}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {binElements}
      </div>
    </div>
  );
}

export default App;
