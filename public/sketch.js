// image degradation variables
let cellSize = 12;
let video;
let slider;
let val;
let rows;
let cols;
let pixelCoord = [];
let pixelsoff;

// people detection variables
let peopleNum;
let poses = [];
let myBodyPose;
let degrad = 0;

let connections;
let COLORS = [];
let showSkeleton = false;

// canvas/image size
let myWidth = 1024 / 1.5;
let myHeight = 768 / 1.5;

function preload() {
  myBodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function setup() {
  createCanvas(myWidth, myHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.size(myWidth, myHeight);
  video.hide();

  myBodyPose.detectStart(video, gotPoses);
  connections = myBodyPose.getSkeleton();
  console.log(connections);

  slider = createSlider(0, 255, 0);
  slider.position(0, 10);
  slider.size(80);

  // define the rows an columns
  rows = myWidth / cellSize;
  cols = myHeight / cellSize;

  // get each cell position

  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      //rect(i * cellSize, j * cellSize, cellSize);
      let pixel = {
        px: i * cellSize,
        py: j * cellSize,
      };
      pixelCoord.push(pixel);
    }
  }
  // Draw initial grid
  drawGrid();

  // create an array of RGB colors
  rgbArray();

  setInterval(sendServer, 1000);
}

function draw() {
  // Clear the background
  val = slider.value();
  // val = degrad * 3;
  pixelsoff = Math.floor(map(val, 0, 255, 0, rows * cols));

  image(video, 0, 0, myWidth, myHeight);
  // Redraw the grid
  drawKeypoints();
  drawGrid(pixelsoff);
  peopleNum = poses.length;
  degrad = peopleNum;
  console.log(degrad);
}

function drawGrid(pixelsoff) {
  //image(video, 0, 0, myWidth, myHeight);

  console.log("pixels off: " + pixelsoff);
  for (let a = 0; a < pixelsoff; a++) {
    let pix = random(pixelCoord);
    noStroke();
    fill(0, 0, 0);
    rect(pix.px, pix.py, cellSize);
  }
}

function gotPoses(results) {
  poses = results;
}

function drawKeypoints() {
  if (poses.length > 0) {
    for (let a = 0; a < poses.length; a++) {
      let pose = poses[a];

      // each pose (person detected )should be represneted with a different color
      let R = COLORS[a].r;
      let G = COLORS[a].g;
      let B = COLORS[a].b;

      // draw sigle keypoints
      // for (let i = 0; i < pose.keypoints.length; i++) {
      //   let keypoint = pose.keypoints[i];
      //   if (keypoint.confidence > 0.2) {
      //     fill(r, g, b);
      //     circle(keypoint.x, keypoint.y, 12);
      //   }
      // }

      if (showSkeleton) {
        // draw connections between keypoints
        for (let c = 0; c < connections.length; c++) {
          let connection = connections[c];
          let a = connection[0];
          let b = connection[1];

          let keyPointA = pose.keypoints[a];
          let keyPointB = pose.keypoints[b];

          if (keyPointA.confidence > 0.2 && keyPointB.confidence > 0.2) {
            stroke(R, G, B);
            strokeWeight(8);
            line(keyPointA.x, keyPointA.y, keyPointB.x, keyPointB.y);
          }
        }
      }
    }
  }
}

function rgbArray() {
  while (COLORS.length < 100) {
    let color = {
      r: rand(0, 255),
      g: rand(0, 255),
      b: rand(0, 255),
    };
    COLORS.push(color);
  }

  // random number generator
  function rand(frm, to) {
    return ~~(Math.random() * (to - frm)) + frm;
  }
}

function sendServer() {
  console.log("sending to server");
  socket.emit("ruination", degrad);
}

function keyPressed() {
  if (key === "h") {
    showSkeleton = !showSkeleton;
    console.log(showSkeleton);
  }
}
