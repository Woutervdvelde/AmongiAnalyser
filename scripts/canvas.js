const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const camera = document.getElementById("camera");
const positionContainer = document.getElementById("position-container");
const zoomContainer = document.getElementById("zoom-container");

const overlayAlphaInput = document.getElementById("overlay-slider");
const certaintyThresholdInput = document.getElementById("certainty-slider");
overlayAlphaInput.onchange = (e) => setOverlayAlpha(e.target.value / 100);
certaintyThresholdInput.onchange = (e) => setCertaintyThreshold(e.target.value / 100);

document.querySelectorAll(".canvasControlInput").forEach(elem => {
    elem.oninput = (e) => {
        let target = document.getElementById(e.target.dataset.display);
        target.innerText = `${e.target.value}%`;
    }
});

const place = new Image();
place.src = base64Image;

let dragging = false;
let currentX = 0;
let currentY = 0;
let zoom = 1;
let lastTouchX = 0;
let lastTouchY = 0;
let lastTouchSecondX = 0;
let lastTouchSecondY = 0;

let overlayAlpha = .8;
let certaintyThreshold = .9;

const zoomMin = .1;
const zoomMax = 40;
const zoomStep = .1;

const setTouches = (e) => {
    if (e.touches.length > 0) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }

    if (e.touches.length > 1) {
        lastTouchSecondX = e.touches[1].clientX;
        lastTouchSecondY = e.touches[1].clientY;
    }
}

const calculateDistance = (touch1, touch2) => {
    //touch1 = [X,Y] | touch2 = [X,Y]
    let a = touch1[0] - touch2[0];
    let b = touch1[1] - touch2[1];
    let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    return c;
}

const touchMove = (e) => {
    distanceX = (lastTouchX - e.touches[0].clientX) * -1;
    distanceY = (lastTouchY - e.touches[0].clientY) * -1;
    currentX = currentX + (distanceX / zoom);
    currentY = currentY + (distanceY / zoom);
    setTransform(currentX, currentY);
    setTouches(e);
}

const touchZoom = (e) => {
    let touch1 = e.touches[0];
    let touch2 = e.touches[1];
    let distancePrevious = calculateDistance([lastTouchX, lastTouchY], [lastTouchSecondX, lastTouchSecondY]);
    let distanceNew = calculateDistance([touch1.clientX, touch1.clientY], [touch2.clientX, touch2.clientY]);

    zoom = zoom + ((distancePrevious - distanceNew) * -1) / 10 * (zoomStep * zoom);
    validateApplyZoom(zoom);
    setTouches(e);
}

camera.onwheel = (e) => {
    e.preventDefault(); //prevent page scrolling
    zoom = zoom + (e.deltaY * -1) / 100 * (zoomStep * zoom);
    validateApplyZoom(zoom);
}

const validateApplyZoom = (z) => {
    if (z > zoomMax) zoom = zoomMax;
    if (z < zoomMin) zoom = zoomMin;
    setZoom(zoom);
}

const stopDragging = () => dragging = false;
camera.onmousedown = () => dragging = true;
camera.onmouseup = stopDragging;
camera.onmouseleave = stopDragging;
camera.ontouchend = setTouches;

camera.ontouchstart = setTouches;
camera.ontouchmove = (e) => {
    if (e.target.closest(".camera-controls")) return;
    e.preventDefault(); //prevent page scrolling and zooming
    if (e.touches.length > 1) 
        touchZoom(e);
    else 
        touchMove(e);
}

positionContainer.onmousemove = (e) => {
    if (!dragging || e.target.closest(".camera-controls")) return;
    currentX = currentX + (e.movementX / zoom);
    currentY = currentY + (e.movementY / zoom);
    setTransform(currentX, currentY);
}

const setTransform = (x, y) => {
    positionContainer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    zoomContainer.style.transformOrigin = `${camera.clientWidth / 2 - x}px ${camera.clientHeight / 2 - y}px`;
}

const setZoom = (zoom) => {
    zoomContainer.style.transform = `scale(${zoom})`;
}

const reset = () => {
    zoom = 1;
    currentX = 0;
    currentY = 0;
    setTransform(currentX, currentY);
    setZoom(zoom);
}

const initialiseCanvas = () => {
    ctx.drawImage(place, 0, 0);
}

const addDarkOverlay = (percentage = .5) => {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgba(0,0,0,${percentage})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const showAmongy = (amongyCollection) => {
    let collection = filterCertaintyAmongy(amongyCollection);
    collection.forEach(a => {
        a.pixels.forEach(p => {
            let [r, g, b] = p.color.split(",");
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(p.x, p.y, 1, 1);
        });
    })
}

const draw = (amongyCollection = null) => {
    initialiseCanvas();
    if (!amongyCollection) return;

    addDarkOverlay(overlayAlpha);
    showAmongy(amongyCollection);
}

const setOverlayAlpha = (alpha) => {
    overlayAlpha = alpha;
    //have to pull the amongy collection from global params
    draw(amongyCollection);
}

const setCertaintyThreshold = (threshold) => {
    certaintyThreshold = threshold;
    draw(amongyCollection);
    showStatistics(amongyCollection);
}

window.addEventListener("load", e => {
    setTransform(0, 0);
    draw();
    overlayAlphaInput.value = overlayAlpha * 100;
    certaintyThresholdInput.value = certaintyThreshold * 100;
    overlayAlphaInput.nextElementSibling.innerText = `${overlayAlpha * 100}%`;
    certaintyThresholdInput.nextElementSibling.innerText = `${certaintyThreshold * 100}%`;
});