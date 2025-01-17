// ======== Server
// import all modules
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const socketIo = require("socket.io");
const helmet = require("helmet");
const path = require("path");

// setup dotenv
dotenv.config();

const { PORT } = process.env;

// init app
const app = express();

// setup module
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());

// setup cors
const client = ["http://localhost:3000", "http://127.0.1:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (client.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by cors"));
    }
  },
};
app.use(cors(corsOptions));

// setup socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: client.map((origin) => ({ origin })),
});

io.on("connection", () => {
  console.log("a user connected");
});
app.use(require("./src/middlewares/socket")(io));

// setup static file
app.use(express.static(path.join(__dirname, "./public")));

// setup bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", require("./src/routes/auth"));
app.use("/api", require("./src/routes/user"));
app.use("/api", require("./src/routes/transaction"));
app.use("/api", require("./src/routes/redirect"));
app.use("/api", require("./src/routes/chart"));

app.listen(PORT, () => {
  console.log(`Apps running on port ${PORT}`);
});
