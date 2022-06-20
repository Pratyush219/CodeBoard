const server = require("./server").server;
// console.log(server);
const socketIO = require("socket.io");

let io = socketIO(server);
let connectionsBoard = [];
let imageData;
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
            io.to(src.value).emit("get-code", socket.id);
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
        socket.broadcast.emit("onClearScreen");
    });
    socket.on("down", (data) => {
        socket.broadcast.emit("onDown", data.X, data.Y);
    });
    socket.on("lineEnd", () => {
        io.emit("onLineEnd");
    });
    socket.on("propertyChange", () => {
        io.emit("onPropertyChange");
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
