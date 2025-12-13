#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;


const int xdirection = 7;
const int xstep = 4;

const int ydirection = 6;
const int ystep = 3;

const int xstopneg = 9;
const int ystopneg = 10;
const int ystoppos = 13;
const int container = 11;

int counter;
int totalcounterx;
int totalcountery;
bool testvar  = false;


void setup() {
  // put your setup code here, to run once:
  pinMode(xdirection, OUTPUT);
  pinMode(xstep, OUTPUT);
  pinMode(ydirection, OUTPUT);
  pinMode(ystep, OUTPUT);
  // pinMode(xenable, OUTPUT);
  // pinMode(yenable, OUTPUT);

  // digitalWrite(xenable, HIGH);
  // digitalWrite(yenable, HIGH);
  
  pinMode(xstopneg, INPUT);
  pinMode(ystopneg, INPUT);
  pinMode(ystoppos, INPUT);
  pinMode(container, INPUT);



  counter = 0;
  // Serial.begin(115200);


  Serial.begin(57600);
  
  // Define events to listen to and their callback
  WebSerial.on("event-to-arduino", eventCallback); 
  
  // Send named events to browser with a number, string, array or json object
  WebSerial.send("event-from-arduino",  "Hello!");



  Serial.println("Good to go!");

}

void(* resetFunc) (void) = 0; // declare reset function at address 0


void eventCallback(JSONVar data) {
 
  String copy = data;
  
  // if (copy.startsWith("move")) {

  //   int steps; 
  //   int direction; 
  //   char axis; 
  //   int endstoppin; 
    
  //   char delimiter = ' ';
  //   String token;

  //   int start = 0;
  //   int end = copy.indexOf(delimiter);
  //   int parseposition = 0;

  //   while (end >= 0) {
  //     token = copy.substring(start, end);

  //     if (parseposition = 1){
  //       steps = token.toInt();
  //     }else if (parseposition = 2){
  //       direction = token.toInt();
  //     }else if (parseposition = 3){
  //       axis = token.charAt(0);
  //     }else if (parseposition = 4){
  //       token.toInt();
  //     }
  //     start = end + 1;
  //     end = copy.indexOf(delimiter, start);
  //     parseposition = parseposition + 1;
  //   }

  //   if (start < copy.length()) {
  //     token = copy.substring(start, copy.length());
  //   }


  //   move(steps, direction, axis, endstoppin);
  // }


  if (copy == "x") {
    jumpx();
  } else if (copy == "n") {
    nextbin();
  } else if (copy == "h") {
    homex();
  } else if (copy == "y") {
    jumpy();
  } else if (copy == "j") {
    homey();
  } else if (copy == "p") {
    prevbin();
  } else if (copy == "s") {
    sequence();
  }else if (copy == "RESET"){
    resetFunc();
  } else {
    
  }
  // WebSerial.send("event-from-arduino", "Finished command " + copy);
};

void move( int steps, int direction, char axis, int endstoppin) {
  counter = 0;
  int steppin;
  
  if (axis == 'x') {
    digitalWrite(xdirection, direction);
    steppin = xstep;
  }else if (axis == 'y') {
    digitalWrite(ydirection, direction);
    steppin = ystep;
  }

  while ( counter < steps && checkEndStop(endstoppin) ){
    digitalWrite(steppin, HIGH);
    delay(2);
    digitalWrite(steppin, LOW);
    delay(2);
    Serial.println(counter);

    counter = counter + 1;
    if (axis == 'x'){
      totalcounterx = totalcounterx + 2 * direction - 1;
    }else if (axis == 'y'){
      totalcountery = totalcountery +  2 * direction - 1;
    }

    if (counter % 100 == 0){
      WebSerial.send("event-from-arduino", "moving " + String(totalcounterx) + " " + String(totalcountery));
    }
  }



}
bool checkEndStop(int pin){
  if (pin == 0){
    return true;
  }else {
    if (digitalRead(xstopneg)){
      return false;
    }
    return !digitalRead(pin);
  }
}


void jumpy (){
  
  WebSerial.send("event-from-arduino", "starting");

  move(780, HIGH, 'y', ystoppos);

  WebSerial.send("event-from-arduino", "done " + String(totalcounterx) + " " + String(totalcountery));

}

void homey () {
  WebSerial.send("event-from-arduino", "starting");

  move(800, LOW, 'y', ystopneg);
  totalcountery = 0;
  WebSerial.send("event-from-arduino", "done " + String(totalcounterx) + " " + String(totalcountery));


}

void jumpx (){
  WebSerial.send("event-from-arduino", "starting");

  move(400, HIGH, 'x', 0);
  

  WebSerial.send("event-from-arduino", "done " + String(totalcounterx) + " " + String(totalcountery));

}

void homex() {
  WebSerial.send("event-from-arduino", "starting");

  move(5000, LOW, 'x', xstopneg);
 
  totalcounterx = 0;
  WebSerial.send("event-from-arduino", "done " + String(totalcounterx) + " " + String(totalcountery));

}


void nextbin()  {
  WebSerial.send("event-from-arduino", "starting");

  move(200, HIGH, 'x', 0);

  move(1000, HIGH, 'x', container);

  WebSerial.send("event-from-arduino", "done " + String(totalcounterx) + " " + String(totalcountery));

}
void prevbin()  {
  WebSerial.send("event-from-arduino", "starting");

  move(200, LOW, 'x', xstopneg);

  move(1000, LOW, 'x', container);
  move(200, LOW, 'x', xstopneg);
  move(400, HIGH, 'x', container);

  WebSerial.send("event-from-arduino", "done " + String(totalcounterx) + " " + String(totalcountery));

}


void sequence() {
  nextbin();
  jumpy();
  delay(1000);
  homey();
  homex();
  
}

void loop() {

  WebSerial.check();
  delay(5);

  

// if (digitalRead(xstopneg)){
//     WebSerial.send("event-from-arduino", "x-");

// }else if (digitalRead(ystopneg)){
//     WebSerial.send("event-from-arduino", "y-");

//   }else if (digitalRead(ystoppos)){
//     WebSerial.send("event-from-arduino", "y+");

// }else if (digitalRead(container)){
//     WebSerial.send("event-from-arduino", "container");

// }

  //  if (Serial.available() > 0) {
  //   char command = Serial.read(); // Read the incoming character

  //   if (command == 'x') {
  //     jumpx();
  //      } else if (command == 'n') {
  //       nextbin();
  //   } else if (command == 'h') {
  //     homex();
  //     } else if (command == 'y') {
  //       jumpy();
  //       } else if (command == 'j') {
  //         homey();
  //         } else if (command == 's') {
  //           sequence();
  //   } else {
      
  //   }
  // }
}
