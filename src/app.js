import express from "express";
import cors from "cors";
import passport from "passport";
import initializePassport from "./config/passport-config.js";
import sessionRouter from "./routes/session.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/carts.js";
import paymentsRouter from "./routes/payments.js";
import cookieParser from "cookie-parser";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import { messageService } from "./services/services.js";
import { createLogger } from "./logger.js";

const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const logger = createLogger();

let whitlist = [
  "https://bbff-2800-810-410-db-b013-86ca-a6b6-53f2.ngrok-free.app/api/carts/notificationOrder",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000",
];

const io = new Server(server, {
  cors: {
    origin: whitlist,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: whitlist }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser()); 
initializePassport();
app.use(passport.initialize());

app.use("/api/session", sessionRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/api/payments", paymentsRouter);

let connectedSockets = {};
io.on("connection", async (socket) => {
  console.log("client connected");
  if (socket.handshake.query.name) {
    if (
      Object.values(connectedSockets).some(
        (user) => user.id === socket.handshake.query.id
      )
    ) {
      Object.keys(connectedSockets).forEach((idSocket) => {
        if (connectedSockets[idSocket].id === socket.handshake.query.id) {
          delete connectedSockets[idSocket];
          connectedSockets[socket.id] = {
            name: socket.handshake.query.name,
            id: socket.handshake.query.id,
            thumbnail: socket.handshake.query.thumbnail,
          };
        }
      });
    } else {
      connectedSockets[socket.id] = {
        name: socket.handshake.query.name,
        id: socket.handshake.query.id,
        thumbnail: socket.handshake.query.thumbnail,
      };
    }
  }
  io.emit("users", connectedSockets);
  let logs = await messageService.getAllAndPopulate();
  io.emit("logs", logs);

  socket.on("disconnect", (reason) => {
    delete connectedSockets[socket.id];
  });
  socket.on("message", async (data) => {
    if (Object.keys(connectedSockets).includes(socket.id)) {
      await messageService.save({
        author: connectedSockets[socket.id].id,
        content: data,
      });
      let logs = await messageService.getAllAndPopulate();
      io.emit("logs", logs);
    }
  });
});

//Render Views
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
  res.render("logout");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.use("/*", (req, res) =>
  res.send({
    error: -2,
    description: `Path ${req.originalUrl} and method ${req.method} aren't implemented`,
  })
);
