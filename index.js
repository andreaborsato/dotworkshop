// Import necessary modules
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const { join } = require("node:path");

// Name Clients to send them data

// Create an Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

// // Serve static files from the public directory
// app.use(express.static("public"));

// Serve static files from the 'public' folder
app.use(express.static(join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// Assuming 'clients' is an array that stores objects with 'customId' and 'clientId'
var clients = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  let customId = socket.handshake.query.customId;
  console.log("welcome: " + customId);
  clients[customId] = socket.id; // Store the custom ID and socket ID
  console.log(clients);

  socket.on("ruination", (data) => {
    console.log(data);
  });
  socket.on("transfer-num", (data) => {
    console.log(data);
  });

  //  let clientName = Object.keys(clients)[0] || Object.keys(clients)[0];
  //  // Access the value of the first key
  //  const firstItemValue = clients[clientName];
  //  //console.log(firstItemValue);

  //  if (clientName === "client_1") {
  //    io.to(firstItemValue).emit("send-my-audio-data", stringArray);
  //  }

  socket.on("disconnect", function () {
    // Remove the disconnected client from the clients object
    delete clients[customId];
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port http://0.0.0.0:${port}`);
});
