
var fr = 15;

void setup() {
	frameRate(fr); // 10 frames per second or 0.1 seconds per frame
	size(600, 300);
};

// global variables for number queue and in station

var lambda = .1;
var mu = .1;
var carInitPosition = 0;
var stationPosition = width - 40;

var Car = function() {
  this.position = new PVector(carInitPosition, height/2);
  this.velocity = new PVector(5, 0);
  this.r = 16;
  this.state = "RUNNING";
  this.counter = 0;
  this.counterStation = 0;
  this.inQueue = false;
};

var CarGenerator = function() {
  //this.position = new PVector(carInitPosition, height/2);
  this.timer = Math.round(fr * (Math.log(1 - random(1))/(-lambda)));
}

CarGenerator.prototype.update = function() {
  if (this.timer > 0) {
    this.timer--;
  } else {
    this.timer = Math.round(fr * (Math.log(1 - random(1))/(-lambda)));   
    cars.push(new Car()); 
  }
}

Car.prototype.update = function() {

    if(this.position.x === 411) {
    	var u2 = random(1);
    	var t2 = Math.log(1 - u2)/(-mu);
    	this.counterStation = Math.round(fr*t2);
    	this.position.x = 412;
    }

    //console.log(this.position.x);
    //console.log(this.position.y);
	 
    if(this.position.x < 53 && this.counter > 0) {
      this.counter = this.counter - 1;
//      console.log(this.counter);
    } else if(this.position.x > 410 && this.counterStation > 0) {
      this.counterStation = this.counterStation - 1;
//      console.log(this.counterStation);
    } else {
      this.position.add(this.velocity);
    }

    if(this.position.x > width - 10) {
      this.state = "DEAD";
    }
    
};

/*
function sleep(miliseconds) {
	var currentTime = new Date().getTime();
  while (currentTime + miliseconds >= new Date().getTime()) {
  }
}
*/

Car.prototype.display = function () {
    // Step 3:
    var angle = this.velocity.heading();
    var carWidth = 30;
    var carHeight = 10;
    var wheelWidth = 5;
    var wheelHeight = 3;

    stroke(0, 0, 0);
    strokeWeight(2);
    fill(127, 127, 127);
    pushMatrix();
    rectMode(CENTER);
    translate(this.position.x, this.position.y);
    // Step 3:
    rotate(angle);
    // draw the car
    fill(255, 0, 0);
    rect(0, 0, carWidth, carHeight);
    rect(0, 0, carWidth-20, carHeight);
    fill(79, 79, 79);
    ellipse(-carWidth + 20, -carHeight + 3.5, wheelWidth, wheelHeight);
    ellipse(-carWidth + 20, carHeight - 3.5, wheelWidth, wheelHeight);
    ellipse(carWidth - 20, carHeight - 3.5, wheelWidth, wheelHeight);
    ellipse(carWidth - 20, -carHeight + 3.5, wheelWidth, wheelHeight);
    //rect(21, 0, 11, 26);
    popMatrix();
};

/*
Car.prototype.checkEdges = function () {
    if (this.position.x > width) {
        this.position.x = 50;
    } else if (this.position.x < 0) {
        this.position.x = width;
    }
    
    if (this.position.y > height) {
        this.position.y = 0;
    } else if (this.position.y < 0) {
        this.position.y = height;
    }
};
*/

void mousePressed() {
  if(mouseX < 200 && mouseY < 150) {
    lambda = lambda + .1;
  } else if(mouseX < 200 && mouseY >= 150) {
    lambda = lambda - .1;
  } else if(mouseX >= 200 && mouseX < 400 && mouseY < 150) {
    mu = mu + .1;
  } else if(mouseX >= 200 && mouseX < 400 && mouseY >= 150) {
    mu = mu - .1;
  } else {
    var car = new Car();
    car.position.y = car.position.y + random(40) - 20;
    cars.push(car);
  }
}

var cars = [];

// TODO: add some jitter to the car

var carGenerator = new CarGenerator();

//var fillStationBarX = 0;
//var fillQueueBarX = 0;
void draw () {
  background(112, 128, 144);
  // TODO: add labels for the bars
  //fill(255, 255, 255);
  //rect(411, 220, 100, 10); // a bar to show how many cars in station
  //fill(255, 255, 255);
  //rect(211, 220, 200, 10); // a bar to show the queue

  textSize(20);
  text("Arrival Rate: " + lambda + " cars per second", 50, 250);
  textSize(20);
  text("Charging Rate: " + mu + " cars per second", 50, 270);
  textSize(20);
  text("Number of cars: " + cars.length, 50, 290);

  carGenerator.update();
  //console.log(cars);

  for(var i = 0; i < cars.length; i++) { 
    textSize(20);
    text("Station", 380, 20);
    textSize(15);
    text("Cars In System", 360, 205);

    textSize(20);
    text("Arrival Rate: " + lambda + " cars per second", 50, 250);
    textSize(20);
    text("Charging Rate: " + mu + " cars per second", 50, 270);
    textSize(20);
    text("Number of cars: " + cars.length, 50, 290);

    /*
    if(cars[i].position.x === 411) {
      fillStationBarX = fillStationBarX + 10;
    }
    if(cars[i].position.x === 432) {
      fillStationBarX = fillStationBarX - 10;
    }

    fill(255, 255, 0);
    rect(411, 220, fillStationBarX, 10); // station bar
    fill(255, 0, 0);
    rect(211, 220, fillQueueBarX, 10);

    if(fillStationBarX >= 100 && !cars[i].inQueue & cars[i].position.x === 50) {
      fillQueueBarX = fillQueueBarX + 10;
      cars[i].inQueue = true;
      //cars[i].position.x = 211;
      //console.log(cars[i].position.x);
      continue;
    } else if(fillStationBarX < 100 && cars[i].inQueue) {
      fillQueueBarX = fillQueueBarX - 10;
      cars[i].inQueue = false;
    } else if(cars[i].inQueue) {
      continue;
    }
  */

    cars[i].update();
   	//cars[i].checkEdges();
   	cars[i].display();
  
    if (cars[i].state === "DEAD") {
      cars.splice(i, 1);
    }
  }


    
};


