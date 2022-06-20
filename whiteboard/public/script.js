const client = io.connect('http://localhost:9999')
const canvasContainer = document.getElementById("canvas-container");
const tools = document.getElementById("tools-section");
const canvas = document.getElementById("canvas");
const colorPicker = document.getElementById("brush-color");
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
let brushSize = brushSizePicker.value
let lineColor = colorPicker.value;
let XOFFSET = 0, YOFFSET = 0;
let x, y;
let erasing = false;
window.onscroll = () => {
    XOFFSET = window.scrollX;
    YOFFSET = window.scrollY;
    console.log(XOFFSET, YOFFSET);
};
window.onmousedown = (e) => {
    if(erasing) {
        ctx.globalCompositeOperation = 'destination-out'
    } else {
        ctx.globalCompositeOperation = "source-over";
    }
    ctx.beginPath();
    x = XOFFSET + e.clientX;
    y = YOFFSET + e.clientY - diff;
    mouseDown = true;
    ctx.moveTo(x, y);
};
window.onmousemove = (e) => {
    x = XOFFSET + e.clientX;
    y = YOFFSET + e.clientY - diff;
    if (mouseDown) {
        drawPixel(x, y, lineColor, brushSize)
    }
};
window.onmouseup = () => {
    ctx.closePath();
    mouseDown = false;
};
drawBtn.onclick = () => {
    erasing = false;
    drawBtn.style.border = 'medium solid black';
    eraseBtn.style.border = 'thin solid black';
}
eraseBtn.onclick = () => {
    erasing = true;
    eraseBtn.style.border = "medium solid black";
    drawBtn.style.border = "thin solid black";
}
clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
colorPicker.onchange = () => {
    lineColor = colorPicker.value;
}
brushSizePicker.onchange = () => {
    brushSize = brushSizePicker.value;
}

function drawPixel(x, y, colorData, brushThickness) {
    console.log(lineColor);
    ctx.lineWidth = brushThickness;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = colorData;

    ctx.lineTo(x, y);
    ctx.stroke();
}
