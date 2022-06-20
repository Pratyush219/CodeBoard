const client = io.connect("http://localhost:9999");
const canvasContainer = document.getElementById("canvas-container");
const tools = document.getElementById("tools-section");
const canvas = document.getElementById("canvas");
const colorPicker = document.getElementById("line-color");
const brushSizePicker = document.getElementById("brush-size");
const drawBtn = document.getElementById("draw");
const eraseBtn = document.getElementById("erase");
const clearBtn = document.getElementById("clear");

const offset = canvas.getBoundingClientRect();
const diff = offset.top;
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseDown = false;
let brushSize = brushSizePicker.value;
let lineColor = colorPicker.value;
let XOFFSET = 0,
    YOFFSET = 0;
let x, y;
let erasing = false;
window.onscroll = () => {
    XOFFSET = window.scrollX;
    YOFFSET = window.scrollY;
    console.log(XOFFSET, YOFFSET);
};
window.onmousedown = (e) => {
    x = XOFFSET + e.clientX;
    y = YOFFSET + e.clientY - diff;
    client.emit("down", { X: x, Y: y });
};
window.onmousemove = (e) => {
    if (mouseDown) {
        x = XOFFSET + e.clientX;
        y = YOFFSET + e.clientY - diff;
        client.emit("draw", {
            X: x,
            Y: y,
            colorVal: lineColor,
            sizeVal: brushSize,
        });
        if (mouseDown) {
            drawPixel(x, y, lineColor, brushSize);
        }
    }
};
window.onmouseup = () => {
    client.emit("up");
};
drawBtn.onclick = () => {
    client.emit("drawMode");
};
eraseBtn.onclick = () => {
    client.emit("eraseMode");
};
clearBtn.onclick = () => {
    client.emit("clearScreen");
};
colorPicker.onchange = function (event) {
    lineColor = event.target.value;
    console.log("Line Property Change");
    client.emit("linecolorchange", lineColor);
};
brushSizePicker.onchange = function (event) {
    brushSize = event.target.value;
    console.log("Brush Property Change");
    client.emit("brushSizechange", brushSize);
};
client.on("onUp", () => {
    // ctx.closePath();
    mouseDown = false;
});
client.on("onDown", (x, y) => {
    if (erasing) {
        erasing = true;
        eraseBtn.style.border = "medium solid black";
        drawBtn.style.border = "thin solid black";
        ctx.globalCompositeOperation = "destination-out";
    } else {
        erasing = false;
        drawBtn.style.border = "medium solid black";
        eraseBtn.style.border = "thin solid black";
        ctx.globalCompositeOperation = "source-over";
    }
    ctx.beginPath();
    mouseDown = true;
    ctx.moveTo(x, y);
});
client.on("connect", () => {
    client.emit("request-data");
});
client.on("get-data", (socketID) => {
    console.log("Get data");
    // let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(`Data requested from ${client.id}`);
    let dataUrl = canvas.toDataURL();
    client.emit(
        "receive-data",
        dataUrl,
        socketID,
        colorPicker.value,
        brushSizePicker.value,
        erasing
    );
});
client.on("new-connection", (imageDataUrl, color, brushwidth, erasingNow) => {
    if (imageDataUrl != null) {
        let img = new Image();
        console.log(imageDataUrl);
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = imageDataUrl;
    } else {
        console.log("No data");
    }
    colorPicker.value = color;
    brushSizePicker.value = brushwidth
    brushSize = brushwidth;
    lineColor = color;
    erasing = erasingNow;
    if (erasing) {
        erasing = true;
        eraseBtn.style.border = "medium solid black";
        drawBtn.style.border = "thin solid black";
    } else {
        erasing = false;
        drawBtn.style.border = "medium solid black";
        eraseBtn.style.border = "thin solid black";
    }
});

client.on("onDraw", (x, y, colorVal, sizeVal) => {
    drawPixel(x, y, colorVal, sizeVal);
});
client.on("onDrawMode", () => {
    erasing = false;
    drawBtn.style.border = "medium solid black";
    eraseBtn.style.border = "thin solid black";
});
client.on("onEraseMode", () => {
    erasing = true;
    eraseBtn.style.border = "medium solid black";
    drawBtn.style.border = "thin solid black";
});
client.on("onClearScreen", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
client.on("onlinecolorchange", (data) => {
    client.emit("drawMode");
    colorPicker.value = data;
    lineColor = data;
});
client.on("onbrushsizechange", (data) => {
    brushSizePicker.value = data;
    brushSize = data;
});

function drawPixel(x, y, colorData, brushThickness) {
    console.log(lineColor);
    ctx.lineWidth = brushThickness;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = colorData;

    ctx.lineTo(x, y);
    ctx.stroke();
}
