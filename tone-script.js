// Variable to control which melody to play
let emotionMelody;
let synthType;
let maxDuration = 20; // Maximum recording length in seconds

// Variable to get the bpm rate
let myBpm;
let previousVal = 0;
let delta;

let recorder;
let part;

// Organize the jsonDataArray and push just the relevant info in a new array
const groupedInfo = jsonDataArray.reduce((acc, obj, index) => {
  // Extract tempos.bpm
  const bpm = obj.header.tempos[0]?.bpm;
  acc[index] = acc[index] || []; // Initialize the array for this index if it doesn't exist
  acc[index].push({ bpm });

  // Extract notes from each track
  obj.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      acc[index].push({
        trackName: track.name,
        noteName: note.name,
        duration: note.duration,
        durationTicks: note.durationTicks,
        midi: note.midi,
        ticks: note.ticks,
        time: note.time,
        velocity: note.velocity,
      });
    });
  });

  return acc;
}, {});

console.log(groupedInfo);

//Change melody according to key pressed
document.addEventListener("keydown", (e) => {
  console.log(e.key);
  let myKey = parseInt(e.key);
  if (myKey == 0 || myKey == 1 || myKey == 2) {
    Tone.Transport.stop(); // Stop the transport
    switch (myKey) {
      case 0:
        emotionMelody = 0;
        Tone.start();
        break;
      case 1:
        emotionMelody = 1;
        Tone.start();
        break;
      case 2:
        emotionMelody = 2;
        Tone.start();
        break;
      default:
        console.log("default");
    }
    console.log(emotionMelody);

    playNotesAtSameTime(emotionMelody);
  }
  // Change oscillator type
  else if (e.key === "z" || e.key === "x" || e.key === "c" || e.key === "v") {
    switch (e.key) {
      case "z":
        synth.oscillator.type = "sine";
        break;
      case "x":
        synth.oscillator.type = "square";
        break;
      case "c":
        synth.oscillator.type = "triangle";
        break;
      case "v":
        synth.oscillator.type = "sawtooth";
        break;
      default:
        console.log("default");
    }
  }
});

// Initialize the recorder
recorder = new Tone.Recorder();

let pitchVal = 0;

let pitchShift = new Tone.PitchShift(pitchVal).toDestination();

// Create the synth
//  let synth = new Tone.Synth({}).toDestination();
let synth = new Tone.Synth({
  oscillator: {
    type: "sine",
  },
});
synth.connect(pitchShift);

// synth.toDestination();

//synth.chain(recorder);

synth.chain(pitchShift, Tone.Destination, recorder);

function playNotesAtSameTime(number) {
  if (myBpm === undefined) {
    console.log("The variable is undefined");
    myBpm = groupedInfo[number][0].bpm;
  }
  // Stop the current transport if it's playing
  if (Tone.Transport.state === "started") {
    Tone.Transport.stop();
  }

  // Stop the current Part if it exists
  if (part) {
    part.dispose();
  }

  // Initialize variables
  if (myBpm === undefined) {
    console.log("The variable is undefined");
    myBpm = groupedInfo[number][0].bpm;
  }

  // Create a new Part
  part = new Tone.Part(function (time, note) {
    synth.triggerAttackRelease(note.noteName, note.duration, time);
  }, groupedInfo[number]).start();

  // Set the loop property
  part.loop = true;

  // Start the transport
  Tone.Transport.start();
}

document.getElementById("bpmSlider").addEventListener("input", function () {
  const bpmValue = parseInt(this.value);
  console.log("bpmValue: " + bpmValue);
  console.log("previousVal: " + previousVal);
  console.log("delta: " + delta);
  delta = bpmValue - previousVal;
  previousVal = bpmValue;
  myBpm += delta;
  Tone.getTransport().bpm.rampTo(myBpm, 0.2);

  console.log(myBpm);
});

document.getElementById("pitchSlider").addEventListener("input", function () {
  console.log(this.value);
  pitchVal = parseInt(this.value);
  pitchShift.pitch = pitchVal;
});

// Add an event listener for the key that stops the loop
document.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    // Assuming 'w' is the key to stop the loop
    console.log("stopped");
    Tone.Transport.stop(); // Stop the transport
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "q") {
    console.log('The "q" key is being pressed!');
    const startTime = Tone.now() + 0.01; // Add a small delay to ensure the start time is greater
    // Start recording
    recorder.start();
    // Set a timeout to stop and restart recording after maxDuration seconds
    setTimeout(() => {
      recorder.stop().then((recording) => {
        // Convert the recording to a Blob
        const blob = new Blob([recording], { type: "audio/webm" });
        // Convert the Blob to an ArrayBuffer
        blob.arrayBuffer().then((arrayBuffer) => {
          // Send the ArrayBuffer to the server
          socket.emit("audioData", arrayBuffer);
        });
      });
      // Immediately restart recording
      recorder.start();
    }, maxDuration * 1000); // Convert seconds to milliseconds
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "e" || event.key === "E") {
    console.log('The "e" key is being pressed!');
    // Stop recording
    recorder.stop().then((recording) => {
      // Convert the recording to a Blob
      const blob = new Blob([recording], { type: "audio/webm" });
      // Convert the Blob to an ArrayBuffer
      blob.arrayBuffer().then((arrayBuffer) => {
        // Send the ArrayBuffer to the server
        socket.emit("audioData", arrayBuffer);
        console.log(arrayBuffer);
      });
    });
  }
});
