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
  pinMode(xdirection, OUTPUT);
  pinMode(xstep, OUTPUT);
  pinMode(ydirection, OUTPUT);
  pinMode(ystep, OUTPUT);
 
  pinMode(xstopneg, INPUT_PULLUP);
  pinMode(ystopneg, INPUT_PULLUP);
  pinMode(container, INPUT_PULLUP);

  counter = 0;
  
  Serial.begin(57600);
  
  WebSerial.on("event-to-arduino", eventCallback); 
  
  WebSerial.send("froma",  "Hello!");

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
  WebSerial.send("froma", "Finished command " + copy);
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
      WebSerial.send("froma", String(totalcounterx) + " " + String(totalcountery));
    }
  }



}
bool checkEndStop(int pin){
  if (pin == 0){
    return true;
  }else {
    return !digitalRead(pin);
  }
}


void jumpy (){
  
  WebSerial.send("froma", "starting");

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

  WebSerial.send("froma", "done");

}

void homey () {
  WebSerial.send("froma", "starting");

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
  WebSerial.send("froma", "done");


}

void jumpx (){
  WebSerial.send("froma", "starting");

  move(400, HIGH, 'x', 0);
  
  WebSerial.send("froma", "done");

}

void homex() {
  WebSerial.send("froma", "starting");

 
  counter = 0;
  digitalWrite(xdirection, LOW);
  while ( counter < totalcountery + 200 && !digitalRead(xstopneg)){
    digitalWrite(xstep, HIGH);
    delay(2);
    digitalWrite(xstep, LOW);
    delay(2);
    Serial.println(counter);
    counter = counter + 1;

  }
  totalcountery = 0;

  WebSerial.send("froma", "done");

}


void nextbin()  {
  WebSerial.send("froma", "starting");

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
    totalcountery = totalcountery + 1;
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
    totalcountery = totalcountery + 1;
  }

  WebSerial.send("froma", "done");

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

  

  if (!digitalRead(xstopneg)){
    WebSerial.send("froma", "x");
  }else if (!digitalRead(ystopneg)){
    WebSerial.send("froma", "y");
  }else if (!digitalRead(container)){
    WebSerial.send("froma", "container");
  }

}
