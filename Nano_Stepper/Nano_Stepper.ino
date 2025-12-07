#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;


const int xdirection = 7;
const int xstep = 4;

const int ydirection = 6;
const int ystep = 3;

const int xstopneg = 9;
const int ystopneg = 10;
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

void eventCallback(JSONVar data) {
 
  String copy = data;
  

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
  } else if (copy == "s") {
    sequence();
  } else {
    
  }
  WebSerial.send("event-from-arduino", "Finished command " + copy);
};

void move( int steps, int direction, char axis, int endstoppin) {
  counter = 0;
  
  if (axis == 'x') {
    digitalWrite(xdirection, direction);
  }else if (axis == 'y') {
    digitalWrite(ydirection, direction);
  }

  while ( counter < steps && checkEndStop(endstoppin) ){
    digitalWrite(ystep, HIGH);
    delay(2);
    digitalWrite(ystep, LOW);
    delay(2);
    Serial.println(counter);

    counter = counter + 1;
    if (axis == 'x'){
      totalcounterx = totalcounterx + 2 * direction - 1;
    }else if (axis == 'y'){
      totalcountery = totalcountery +  2 * direction - 1;
    }

    if (counter % 100 == 0){
      WebSerial.send("event-from-arduino", String(totalcounterx) + " " + String(totalcountery));
    }
  }



}
void checkEndStop(int pin){
  if (pin == 0){
    return true;
  }else {
    return !digitalRead(pin);
  }
}

void test() {
 
  digitalWrite(ydirection, LOW);
  counter = 0;
  while ( counter < 20 && !digitalRead(xstopneg)){
    digitalWrite(ystep, HIGH);
    delay(2);
    digitalWrite(ystep, LOW);
    delay(2);
      Serial.println(counter);

  counter = counter + 1;

  }
}

void jumpy (){
  
  WebSerial.send("event-from-arduino", "starting");

  counter = 0;
  digitalWrite(ydirection, HIGH);

  while ( counter < 500 ){
    digitalWrite(ystep, HIGH);
    delay(2);
    digitalWrite(ystep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;
  }

  WebSerial.send("event-from-arduino", "done");

}

void homey () {
  WebSerial.send("event-from-arduino", "starting");

  counter = 0;
  digitalWrite(ydirection, LOW);

  while ( counter < 500 && !digitalRead(ystopneg)){
    digitalWrite(ystep, HIGH);
    delay(2);
    digitalWrite(ystep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;
  }
  WebSerial.send("event-from-arduino", "done");


}

void jumpx (){
  WebSerial.send("event-from-arduino", "starting");

  counter = 0;
  digitalWrite(xdirection, HIGH);

  while ( counter < 400 )
  {
    digitalWrite(xstep, HIGH);
    delay(2);
    digitalWrite(xstep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;
    totalcounter = totalcounter + 1;
  }

  WebSerial.send("event-from-arduino", "done");

}

void homex() {
  WebSerial.send("event-from-arduino", "starting");

 
  counter = 0;
  digitalWrite(xdirection, LOW);
  while ( counter < totalcounter + 200 && !digitalRead(xstopneg)){
    digitalWrite(xstep, HIGH);
    delay(2);
    digitalWrite(xstep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;

  }
  totalcounter = 0;

  WebSerial.send("event-from-arduino", "done");

}


void nextbin()  {
  WebSerial.send("event-from-arduino", "starting");

  counter = 0;
  digitalWrite(xdirection, HIGH);
  while ( counter < 200  )
  {
    digitalWrite(xstep, HIGH);
    delay(2);
    digitalWrite(xstep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;
    totalcounter = totalcounter + 1;
  }
 

   counter = 0;

  while ( counter < 800 && !digitalRead(container) )
  {
    digitalWrite(xstep, HIGH);
    delay(2);
    digitalWrite(xstep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;
    totalcounter = totalcounter + 1;
  }

  WebSerial.send("event-from-arduino", "done");

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
//   Serial.println("x");
// }else if (digitalRead(ystopneg)){
//   Serial.println("y");
// }else if (digitalRead(container)){
//   Serial.println("container");
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
