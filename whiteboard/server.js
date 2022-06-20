const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);
const path = require('path');
let publiPath = path.join(__dirname, 'public');
app.use(express.static(publiPath))
let connections = new Set();
let imageData;
let port = process.env.PORT || 9999;
server.listen(port, (error) => {
    if(error) {
        console.error(error);
    } 
    else {
        console.log(`Server listening at port ${port}`);
    }
}) 
io.on("connection", (socket) => {
    console.log(`${socket.id} has connnected`);
    console.log(connections.size);
    socket.on("request-data", () => {
        console.log(`${socket.id} New connection`);
        console.log("Before:", connections.size);
        if (connections.size > 0) {
            console.log("Requesting drawing and code");
            let it = connections.values();
            let src = it.next();
            console.log(src.value);
            io.to(src.value).emit("get-data", socket.id);
        }
        connections.add(socket.id);
        console.log("After:", connections.size);
    });

    socket.on("receive-data", (data, dest, color, brushsize, erasing) => {
        console.log("Receive", dest);
        imageData = data;
        io.to(dest).emit(
            "new-connection",
            imageData,
            color,
            brushsize,
            erasing
        );
    });
    socket.on("draw", (data) => {
        socket.broadcast.emit(
            "onDraw",
            data.X,
            data.Y,
            data.colorVal,
            data.sizeVal
        );
    });
    socket.on("drawMode", () => {
        io.emit("onDrawMode");
    });
    socket.on("eraseMode", () => {
        io.emit("onEraseMode");
    });
    socket.on("clearScreen", () => {
        io.emit("onClearScreen");
    });
    socket.on("down", (data) => {
        io.emit("onDown", data.X, data.Y);
    });
    socket.on("up", () => {
        io.emit("onUp");
    });
    socket.on("linecolorchange", (data) => {
        socket.broadcast.emit("onlinecolorchange", data);
    });
    socket.on("brushSizechange", (data) => {
        socket.broadcast.emit("onbrushsizechange", data);
    });
    socket.on("disconnect", (reason) => {
        for (let sock of connections.values()) {
            if (sock == socket.id) {
                connections.delete(sock);
            }
        }
        console.log(`${socket.id} has disconnnected`);
    });
});
