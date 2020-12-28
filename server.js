const app = require("./backend/app");
const http = require("http");
const debug = require("debug")("mean-stack");
const config = require("./backend/config/config");

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const port = normalizePort(process.env.PORT || config.port);
app.set("port", port);

const onError = (error) => {
  if (error.syscall !== "listener") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe" + port : "port" + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe" + addr : "port" + port;
  debug("Listening on " + bind);
};

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);
