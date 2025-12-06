
const int xdirection = 7;
const int xstep = 4;

const int ydirection = 6;
const int ystep = 3;

const int xstopneg = 9;
const int ystopneg = 10;
const int container = 11;

int counter;
int totalcounter;
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
  Serial.begin(115200);




  Serial.println("Good to go!");

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

}

void homey () {
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

}

void jumpx (){
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
}

void homex() {
 
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
}


void nextbin()  {

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
}


void sequence() {
  nextbin();
  jumpy();
  delay(1000);
  homey();
  homex();
  
}

void loop() {
if (digitalRead(xstopneg)){
  Serial.println("x");
}else if (digitalRead(ystopneg)){
  Serial.println("y");
}else if (digitalRead(container)){
  Serial.println("container");
}

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
