const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 9999;

app.use(express.static("public"));
server.listen(port, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server listening at port ${port}`);
    }
});

let connections = [];
io.on("connect", (socket) => {
    console.log(`${socket.id} connected`);
    connections.push(socket.id);
    socket.on("requestData", () => {
        io.to(connections[0]).emit("get-data", socket.id);
    });
    socket.on("receiveData", (data, socketID) => {
        io.to(socketID).emit("new-connection", data);
    });
    socket.on('draw', (x, y, color, size) => {
        io.emit('onDraw', x, y, color, size);
    })
    socket.on('clear', () => {
        io.emit('onClear');
    })
    socket.on('drawMode', () => {
        io.emit('onDrawMode');
    })
    socket.on("eraseMode", () => {
        io.emit("onEraseMode");
    });
});
