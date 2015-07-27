
var fr = 15;
var canvasWidth = 700;
var canvasHeight = 350;

void setup() {
	frameRate(fr); // 15 frames per second or 0.15 seconds per frame
	size(canvasWidth, canvasHeight);
};

// global variables for number queue and in station

//TODO: cars should be random colors
//TODO: add road display

var lambda = 1; //Number of cars per second
var mu = .001; //Number of cars per second per station
var carInitPosition = 0;
var carWidth = 30;
var carHeight = 10;
var stationPosition = canvasWidth - 80;
var sizeOfQueue = 0;

(function ($) {
  $('.spinner.lambda .btn:first-of-type').on('click', function() {
    lambda = parseFloat($('.spinner.lambda input').val(), 10) + 0.25;
    $('.spinner.lambda input').val( lambda );
    console.log(lambda);
  });
  $('.spinner.lambda .btn:last-of-type').on('click', function() {
    lambda = parseFloat($('.spinner.lambda input').val(), 10) - 0.25;
    $('.spinner.lambda input').val( lambda );
    console.log(lambda);
  });
})(jQuery);

(function ($) {
  $('.spinner.mu .btn:first-of-type').on('click', function() {
    // math.round to 4 decimal places
    mu = Math.round(parseFloat($('.spinner.mu input').val(), 10) * 2 * 100000)/100000;
    $('.spinner.mu input').val( mu );
    console.log(mu);
  });
  $('.spinner.mu .btn:last-of-type').on('click', function() {
    mu = Math.round(parseFloat($('.spinner.mu input').val(), 10) / 2 * 10000)/10000;
    $('.spinner.mu input').val( mu );
    console.log(mu);
  });
})(jQuery);

var Car = function(someStation, someQueue) {
  this.position = new PVector(carInitPosition, canvasHeight/2);
  this.velocity = new PVector(20, 0);
  //RUNNING, IN_QUEUE, IN_STATION, DEAD
  this.state = "RUNNING";
  this.station = someStation;
  this.plugId;
  this.chargingTimer;
  this.queuePos;
};

var CarGenerator = function(someStation) {
  this.timer = Math.round(fr * (Math.log(1 - random(1))/(-lambda))) + 1;
  this.station = someStation;
}

CarGenerator.prototype.update = function() {
  if (this.timer > 0) {
    this.timer--;
  } else {
    this.timer = Math.round(fr * (Math.log(1 - random(1))/(-lambda))) + 1;   
    cars.push(new Car(this.station)); 
  }
}

Car.prototype.update = function() {
  switch(this.state) {
    case "RUNNING":
      if (this.position.x > stationPosition - this.station.dim.x - 1.2*sizeOfQueue*carWidth + 10) {
        if (sizeOfQueue === 0) {
          var plug = this.station.addToStation();
          this.plugId = plug;
          this.chargingTimer = Math.round(fr * (Math.log(1 - random(1)/(-mu)))) + 1;
          if (plug >= 0) {
            this.state = "IN_STATION";
          } else {
            this.state = "IN_QUEUE"
            this.position.x = stationPosition - this.station.dim.x - 1.2*sizeOfQueue*carWidth + 10;
            sizeOfQueue += 1;
            this.queuePos = sizeOfQueue;
            break;
          }
        } else {
          this.state = "IN_QUEUE";
          this.position.x = stationPosition - this.station.dim.x - 1.2*sizeOfQueue*carWidth + 10;
          sizeOfQueue += 1;
          this.queuePos = sizeOfQueue;
          break;
        }
      };
      this.position.add(this.velocity);
      break;
    case "IN_STATION":
      this.chargingTimer--;
      this.position = this.station.plugsPos[this.plugId];
      if (this.chargingTimer <= 0) {
        this.state = "DEAD";
      };
      break;
    case "IN_QUEUE":
      if (this.queuePos === 0) {
        this.position.x = stationPosition - this.station.dim.x - 1.2*this.queuePos*carWidth + 10;
        var plug = this.station.addToStation();
        this.plugId = plug;
        this.chargingTimer = Math.round(fr * (Math.log(1 - random(1)/(-mu)))) + 1;
        this.state = "IN_STATION";
      }
      break;
      //this.state = "RUNNING";
    default:
      ;
  }
}  


Car.prototype.display = function () {
    var angle = this.velocity.heading();
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

var Station = function() {
  this.position = new PVector(stationPosition, canvasHeight/2);
  this.dim = new PVector(canvasWidth/6.5, canvasHeight/1.5);
  this.plugsId = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.plugsPos = this.calcPlugsPos();
}

Station.prototype.calcPlugsPos = function() {
  
  stPlugsXPos = [-this.dim.x/4.0, this.dim.x/4.0];
  stPlugsYPos = [-this.dim.y/2.8, -this.dim.y/5.7, 0, this.dim.y/5.7, this.dim.y/2.8];
  plugsPos = [];

  for (yIdx in stPlugsYPos) {
    for (xIdx in stPlugsXPos) {
      plugsPos = append(plugsPos, new PVector(this.position.x + stPlugsXPos[xIdx], 
                                              this.position.y + stPlugsYPos[yIdx]));
    }
  }
  return plugsPos;
}

Station.prototype.drawStation = function() {
  pushMatrix();
  rectMode(CENTER);
  translate(this.position.x, this.position.y);
  fill(105, 105, 105);
- rect(0, 0, this.dim.x, this.dim.y);
  popMatrix();
  
  for (pIdx in this.plugsPos) {
    plugPos = this.plugsPos[pIdx];  
    pushMatrix();
    rectMode(CENTER);
    translate(plugPos.x, plugPos.y);
    fill(#000000);
    rect(0, 0, carWidth + 4, carHeight + 4);
    popMatrix();
  }
};

//var QueueEV = function() {
//  this.queueEV = new Queue();
//}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while(0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

Station.prototype.addToStation = function() {
  var arr = [];
  for(var i = 0; i < this.plugsId.length(); i++) {
    arr.push(i);
  }
  arr = shuffle(arr);
  for (idx in arr) {
    if (this.plugsId[arr[idx]] === 0) {
      this.plugsId[arr[idx]] = 1;
      return arr[idx];
    }
  }
  return -1;
}

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

var station = new Station();
var carGenerator = new CarGenerator(station);

void draw () {
  background(112, 128, 144);
  
  station.drawStation();
  
  //if (cars.length() <= 15)
  carGenerator.update();

  for(var i = 0; i < cars.length; i++) { 

    cars[i].update();
   	cars[i].display();

    if (cars[i].state === "DEAD") {
      plugId = cars[i].plugId;
      station.plugsId[plugId] = 0;
      cars.splice(i, 1);
      if (sizeOfQueue > 0) {
        for(var i = 0; i < cars.length; i++) {
          if (cars[i].queuePos > 0) {
            cars[i].queuePos--;            
            cars[i].position.x = stationPosition - cars[i].station.dim.x - 1.2*(cars[i].queuePos-1)*carWidth + 10;
          }
        }
        sizeOfQueue--;
      }
    }
  }

};

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

/*
textSize(20);
  text("Arrival Rate: " + lambda + " cars per second", 50, 250);
  textSize(20);
  text("Charging Rate: " + mu + " cars per second", 50, 270);
  textSize(20);
  text("Number of cars: " + cars.length, 50, 290);
*/

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

/*
    if(this.position.x === 411) {
      var u2 = random(1);
      var t2 = Math.log(1 - u2)/(-mu);
      this.counterStation = Math.round(fr*t2);
      this.position.x = 412;
    }
*/

/*
    if(this.position.x < 53 && this.counter > 0) {
      this.counter = this.counter - 1;
//      console.log(this.counter);
    } else if(this.position.x > 410 && this.counterStation > 0) {
      this.counterStation = this.counterStation - 1;
//      console.log(this.counterStation);
    } else {
      this.position.add(this.velocity);
    }
*/
    //if(this.position.x > stationPosition - 20) {
    //  this.state = "WAITING";
    //}


