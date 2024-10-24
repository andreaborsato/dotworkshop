let mic;

function preload() {
  myBodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function gotPoses(results) {
  poses = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  myBodyPose.detectStart(video, gotPoses);
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  image(video, 0, 0, 640, 480);
  drawKeypoints();
  peopleNum = poses.length;

  let volume = random(1);
  // let volume = mic.getLevel() * 1000;
  console.log(volume);
  noiseLev = volume * 100;

  console.log("volume: " + noiseLev);
  console.log("num people: " + peopleNum);
  degrad = noiseLev * peopleNum;
  console.log(degrad);

  socket.emit("transfer-audio", degrad);
}

function drawKeypoints() {
  if (poses.length > 0) {
    let pose = poses[0];
    let x = pose.nose.x;
    let y = pose.nose.y;
    fill(255, 0, 0);
    circle(x, y, 20);
    for (let i = 1; i < pose.keypoints.length; i++) {
      let keypoint = pose.keypoints[i];
      if (keypoint.confidence > 0.2) {
        fill(0, 0, 255);
        circle(keypoint.x, keypoint.y, 12);
      }
    }
  }
}
