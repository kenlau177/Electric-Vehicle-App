
var fr = 30;
var canvasWidth = 700;
var canvasHeight = 340;

void setup() {
	frameRate(fr); // 15 frames per second or 0.15 seconds per frame
	size(canvasWidth, canvasHeight);
};

// global variables for number queue and in station

//TODO: cars should be random colors

lambda = Number($('.spinner.lambda input').val()); //Number of cars per second
mu = Number($('.spinner.mu input').val()); //Number of cars per second per station
var carInitPosition = 0;
var carWidth = 30;
var carHeight = 10;
var stationPosition = canvasWidth - 80;
var sizeOfQueue = 0;
var speedFrac = 3600/300;
font = loadFont("meta-bold.ttf");
colors = [#e41a1c, #3232ff, #4daf4a, #984ea3, #ff7f00, #ffff33, #a65628, #f781bf];

$('#speed_up_label').text("This simulation is sped up by " + 3600*(1/speedFrac) + " times to account for the hour denom.");

function factorial(num)
{
  if (num < 0) {
      return -1;
  }
  else if (num == 0) {
      return 1;
  }
  var tmp = num;
  while (num-- > 2) {
      tmp *= num;
  }
  return tmp;
}

// s: number of stations
function compute_wait_time(lambda, mu, s) {
  var rho = lambda/mu;
  var numer1 = 1/(mu*(s-rho));
  var numer2 = Math.pow(rho,s)/factorial(s);
  var numer3 = s/(s-rho);
  var numer = numer1*numer2*numer3;

  var denom = 0;
  for (i = 0; i < s; i++) {
    denom = denom + Math.pow(rho,i)/factorial(i);
  }
  denom = denom + (s*Math.pow(rho,s))/((factorial(s)*(s-rho)));

  if (!isFinite(numer) || !isFinite(denom)) {
    return(Infinity);
  }

  return(numer/denom);
}

(function ($) {
  $('.spinner.lambda .btn:first-of-type').on('click', function() {
    lambda = parseFloat($('.spinner.lambda input').val(), 10) + 1;
    $('.spinner.lambda input').val( lambda );
    var wait_time = compute_wait_time(lambda, mu, station.plugsId.length).toFixed(2);
    $('#wait_time_label').text("Average wait time: " + wait_time + " hour(s)");
  });
  $('.spinner.lambda .btn:last-of-type').on('click', function() {
    lambda = parseFloat($('.spinner.lambda input').val(), 10) - 1;
    $('.spinner.lambda input').val( lambda );
    var wait_time = compute_wait_time(lambda, mu, station.plugsId.length).toFixed(2);
    $('#wait_time_label').text("Average wait time: " + wait_time + " hour(s)");
  });
})(jQuery);

(function ($) {
  $('.spinner.mu .btn:first-of-type').on('click', function() {
    mu = parseFloat($('.spinner.mu input').val(), 10) + .25;
    $('.spinner.mu input').val( mu );
    var wait_time = compute_wait_time(lambda, mu, station.plugsId.length).toFixed(2);
    $('#wait_time_label').text("Average wait time: " + wait_time + " hour(s)");
  });
  $('.spinner.mu .btn:last-of-type').on('click', function() {
    mu = parseFloat($('.spinner.mu input').val(), 10) - .25;
    $('.spinner.mu input').val( mu );
    var wait_time = compute_wait_time(lambda, mu, station.plugsId.length).toFixed(2);
    $('#wait_time_label').text("Average wait time: " + wait_time + " hour(s)");
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
  this.car_color = colors[Math.floor(Math.random() * (colors.length-1 - 0 + 1)) + 0];
};

var CarGenerator = function(someStation) {
  this.timer = Math.round(fr * speedFrac * (Math.log(1 - random(1))/(-lambda))) + 1;
  this.station = someStation;
}

CarGenerator.prototype.update = function() {
  if (this.timer > 0) {
    this.timer--;
  } else {
    this.timer = Math.round(fr * speedFrac * (Math.log(1 - random(1))/(-lambda))) + 1;   
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
          this.chargingTimer = Math.round(fr * speedFrac * (Math.log(1 - random(1))/(-mu))) + 1;
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
        this.chargingTimer = Math.round(fr * speedFrac * (Math.log(1 - random(1))/(-mu))) + 1;
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
    fill(this.car_color);
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
  rect(0, 0, this.dim.x, this.dim.y);
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

  // text station label
  textFont(font, 22);
  text("Station", canvasWidth - 115, 40);

};

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

var cars = [];

// TODO: add some jitter to the car

station = new Station();
var carGenerator = new CarGenerator(station);

var wait_time = compute_wait_time(lambda, mu, station.plugsId.length).toFixed(2);
$('#wait_time_label').text("Average wait time: " + wait_time + " hour(s)");

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

  textFont(font, 22);
  text("Number of cars in queue: " + sizeOfQueue, 200, canvasHeight - 50);

};

