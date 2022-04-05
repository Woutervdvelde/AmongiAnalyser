class Amongy {
    static Type = {
        SHORT: "short",
        TRADITIONAL: "traditional",
        SITTING: "sitting"
    }

    constructor(type) {
        this.type = type;
    }
}

class Pixel {
    x = 0;
    y = 0;
    color = [0, 0, 0] //RGB

    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

const testVariant = {
    cords: [
        { x: 1, y: 0, c: [1] },
        { x: 0, y: 1, c: [2] },
        { x: 1, y: 1, c: [0] },
    ]
}

const canvas = document.getElementById("canvas");
const canvasArray = [[]]
const place = new Image();
// place.src = base64Image;
place.src = testImage;

window.onload = async () => {
    let ctx = canvas.getContext('2d');
    ctx.drawImage(place, 0, 0);

    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    checkImageForAmongy(data);
}

const checkImageForAmongy = (data) => {
    for (let y = 0; y < canvas.width; y++)
        for (let x = 0; x < canvas.height; x++) {
            if (canvasArray[x] && canvasArray[x][y]) return;
            console.log(checkVariant(data, testVariant, x, y));
        }
}

const checkVariant = (data, variant, startX, startY) => {
    if (!checkCords(startX, startY)) return false;
    let colors = [getRGBFromCords(data, startX, startY)];
    
    for (let i = 0; i < variant.cords.length; i++) {
        let cord = variant.cords[i];
        let x = startX + cord.x;
        let y = startY + cord.y;
        if (!checkCords(x, y)) return false;
        
        let color = getRGBFromCords(data, x, y);
        for (let cv = 0; cv < cord.c.length; cv++) {
            if (!colors[cord.c[cv]])
                colors[cord.c[cv]] = color;
            else if (!colors[cord.c[cv]] == color)
                return false;
        }
    }
    return true;
}

const checkCords = (x, y) => {
    return !(x < 0 || x >= canvas.width || y < 0 || y >= canvas.height)
}

const getRGBFromCords = (data, x, y) => {
    const r = data[canvas.width * y * 4 + x * 4 + 0];
    const g = data[canvas.width * y * 4 + x * 4 + 1];
    const b = data[canvas.width * y * 4 + x * 4 + 2];
    return [r, g, b];
}