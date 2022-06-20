var client = io("http://localhost:9999");

var optionView = document.getElementById("view-selection");
var ideSelector = document.getElementById("ide-selector");
var canvasSelector = document.getElementById("canvas-selector");
var canvasContainer = document.getElementById("canvas-container");
var ideContainer = document.getElementById("ide-container");
var toolsContainer = document.getElementById("tools-section");
var colorPicker = document.getElementById("line-color");
var brushSizeOptionMenu = document.getElementById("brush-size");
var clearButton = document.getElementById("clear-canvas");
var drawBtn = document.getElementById("draw");
var eraseBtn = document.getElementById("erase");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
canvas.style.cursor = "crosshair";

let canvasEnabled = false;
var brushSize = brushSizeOptionMenu.value;
var lineColor = colorPicker.value;
var offset = canvas.getBoundingClientRect();
let diff = offset.top;
canvasContainer.style.display = "none";

canvas.width = Math.max(0.98 * window.innerWidth, canvas.width);
canvas.height = Math.max(window.innerHeight, canvas.height);

let XOFFSET = 0,
    YOFFSET = 0;
let x;
let y;
let mouseDown = false;
let erasing = false;
// Window properties
window.onresize = function () {
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = Math.max(window.innerWidth, canvas.width);
    canvas.height = Math.max(window.innerHeight, canvas.height);
    ctx.putImageData(data, 0, 0);
};
window.onscroll = function () {
    // console.log(window.scrollX);
    // console.log(window.scrollY);
    XOFFSET = window.scrollX;
    YOFFSET = window.scrollY;
};
window.onmousedown = function (e) {
    if (canvasEnabled) {
        console.log(typeof e);
        client.emit("down", {
            X: e.clientX + XOFFSET,
            Y: e.clientY + YOFFSET - diff,
        });
        ctx.beginPath();
        ctx.moveTo(e.clientX + XOFFSET, e.clientY + YOFFSET - diff);
        mouseDown = true;
    }
};
ideSelector.onclick = () => {
    canvasEnabled = false;
    ideContainer.style.display = "block";
    canvasContainer.style.display = "none";
};
canvasSelector.onclick = () => {
    canvasEnabled = true;
    ideContainer.style.display = "none";
    canvasContainer.style.display = "block";
};
client.on("onDown", (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
});
window.onmouseup = function (e) {
    mouseDown = false;
    ctx.closePath();
};
window.onmousemove = function (e) {
    x = XOFFSET + e.clientX;
    y = YOFFSET + e.clientY - diff;
    if (mouseDown) {
        client.emit("draw", {
            X: x,
            Y: y,
            colorVal: colorPicker.value,
            sizeVal: brushSize,
        });
        drawPixel(x, y, lineColor, brushSize);
    }
};
client.on("onDraw", (x, y, colorData, brushWidth) => {
    drawPixel(x, y, colorData, brushWidth);
});
// New Connection
client.on("connect", () => {
    console.log(`${client.id} connected`);
    client.emit("request-data");
});
client.on("get-data", (newSocketID) => {
    console.log("Get data");
    // let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(`Data requested from ${client.id}`);
    let dataUrl = canvas.toDataURL();
    client.emit(
        "receive-data",
        dataUrl,
        newSocketID,
        colorPicker.value,
        brushSizeOptionMenu.value,
        erasing
    );
});
client.on("new-connection", (imageData, color, brushsize, erasingNow) => {
    if (imageData != null) {
        // console.log(imageData);
        var img = new Image();
        img.onload = function () {
            ctx.drawImage(img, 0, 0); // Or at whatever offset you like
        };
        img.src = imageData;
    } else console.log("No data");
    colorPicker.value = color;
    lineColor = color;
    brushSizeOptionMenu.value = brushsize;
    brushSize = brushsize;
    if (!erasingNow) {
        erasing = false;
        ctx.globalCompositeOperation = "source-over";
    } else {
        erasing = true;
        ctx.globalCompositeOperation = "destination-out";
    }
});
clearButton.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    client.emit("clearScreen");
};
client.on("onClearScreen", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
client.on("onlinecolorchange", (data) => {
    client.emit("drawMode");
    colorPicker.value = data;
    lineColor = data;
});
client.on("onbrushsizechange", (data) => {
    brushSizeOptionMenu.value = data;
    brushSize = data;
});
drawBtn.onclick = () => {
    erasing = false;
    client.emit("drawMode");
};
eraseBtn.onclick = () => {
    erasing = true;
    client.emit("eraseMode");
};
client.on("onDrawMode", () => {
    erasing = false;
    ctx.globalCompositeOperation = "source-over";
});
client.on("onEraseMode", () => {
    erasing = true;
    ctx.globalCompositeOperation = "destination-out";
});
colorPicker.onchange = function (event) {
    lineColor = event.target.value;
    console.log("Line Property Change");
    client.emit("linecolorchange", lineColor);
};
brushSizeOptionMenu.onchange = function (event) {
    brushSize = event.target.value;
    console.log("Brush Property Change");
    client.emit("brushSizechange", brushSize);
};
function drawPixel(x, y, colorData, brushThickness) {
    console.log(lineColor);
    ctx.lineWidth = brushThickness;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = colorData;

    ctx.lineTo(x, y);
    ctx.stroke();
}
