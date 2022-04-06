class Amongy {
    static Type = {
        SHORT: "short",
        TRADITIONAL: "traditional",
        SITTING: "sitting",
        NONE: "none"
    }

    type = Amongy.Type.NONE;
    pixels = [];

    constructor(type, pixels) {
        this.type = type;
        this.pixels = pixels;
    }
}

class Pixel {
    x = 0;
    y = 0;
    color = "" //RGB

    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

const flip = (variant) => {
    let cords = [];
    oldX = Math.max(...variant.cords.filter(v => v.y == 0).map(v => v.x));
    variant.cords.forEach(cord => {
        cords.push({ x: Math.abs(cord.x - oldX), y: cord.y, c: cord.c });
    });

    return new Variant(variant.type, true, cords);
}

class Variant {
    type = Amongy.Type.NONE;
    flipped = false;
    cords = [];

    constructor(type, flipped, cords) {
        this.type = type;
        this.flipped = flipped;
        this.cords = cords;
    }
}

const traditionalboy = new Variant(
    Amongy.Type.TRADITIONAL,
    false,
    [
        { x: 0, y: 0, c: [0] },
        { x: 1, y: 0, c: [0] },
        { x: 2, y: 0, c: [0] },
        { x: -1, y: 1, c: [0] },
        { x: 0, y: 1, c: [0] },
        { x: 1, y: 1, c: [3] },
        { x: 2, y: 1, c: [3] },
        { x: -1, y: 2, c: [0] },
        { x: 0, y: 2, c: [0] },
        { x: 1, y: 2, c: [0] },
        { x: 2, y: 2, c: [0] },
        { x: 0, y: 3, c: [0] },
        { x: 1, y: 3, c: [0] },
        { x: 2, y: 3, c: [0] },
        { x: 0, y: 4, c: [0] },
        { x: 2, y: 4, c: [0] },
    ]
);

const shortboy = new Variant(
    Amongy.Type.SHORT,
    false,
    [
        { x: 0, y: 0, c: [0] },
        { x: 1, y: 0, c: [0] },
        { x: 2, y: 0, c: [0] },
        { x: -1, y: 1, c: [0] },
        { x: 0, y: 1, c: [0] },
        { x: 1, y: 1, c: [3] },
        { x: 2, y: 1, c: [3] },
        { x: -1, y: 2, c: [0] },
        { x: 0, y: 2, c: [0] },
        { x: 1, y: 2, c: [0] },
        { x: 2, y: 2, c: [0] },
        { x: 0, y: 3, c: [0] },
        { x: 2, y: 3, c: [0] },
    ]
);

//Order is very important here, check for bigger variants first because it will (almost) always find the smaller variant in the bigger variant.
const variants = [traditionalboy, flip(traditionalboy), shortboy, flip(shortboy)];

const canvas = document.getElementById("canvas");
const amongyCollection = [];
const pixelMatrix = [[]]
const place = new Image();
place.src = base64Image;
// place.src = testImage;
// place.src = testImage2;

window.onload = async () => {
    let ctx = canvas.getContext('2d');
    ctx.drawImage(place, 0, 0);

    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    checkImageForAmongy(data);
}

const checkImageForAmongy = (data) => {
    for (let y = 0; y < canvas.width; y++)
        for (let x = 0; x < canvas.height; x++) {
            if (pixelMatrix[x] && pixelMatrix[x][y]) continue;

            for (let i = 0; i < variants.length; i++) {
                pixels = checkVariant(data, variants[i], x, y);
                if (!pixels) continue;
                addVariantToMatrix(pixels);
                amongyCollection.push(new Amongy(variants[i].type, pixels));
                break;
            }
        }


}

const checkVariant = (data, variant, startX, startY) => {
    if (!checkCords(startX, startY)) return false;
    let colors = [];
    let response = [];

    for (let i = 0; i < variant.cords.length; i++) {
        let cord = variant.cords[i];
        let x = startX + cord.x;
        let y = startY + cord.y;
        if (!checkCords(x, y)) return false;

        let color = getRGBFromCords(data, x, y);

        correct = false;
        for (let cv = 0; cv < cord.c.length; cv++) {
            if (!colors[cord.c[cv]] && !colors.includes(color))
                colors[cord.c[cv]] = color;

            if (colors[cord.c[cv]] == color) {
                correct = true;
                break;
            }
        }
        if (correct) response.push(new Pixel(x, y, color));
        else return false;
    }
    return response;
}

const addVariantToMatrix = (pixels) => {
    for (let i = 0; i < pixels.length; i++) {
        if (!pixelMatrix[pixels[i].x])
            pixelMatrix[pixels[i].x] = [];
        pixelMatrix[pixels[i].x][pixels[i].y] = pixels[i].color;
    }
}

const checkCords = (x, y) => {
    return !(x < 0 || x >= canvas.width || y < 0 || y >= canvas.height)
}

const getRGBFromCords = (data, x, y) => {
    const r = data[canvas.width * y * 4 + x * 4 + 0];
    const g = data[canvas.width * y * 4 + x * 4 + 1];
    const b = data[canvas.width * y * 4 + x * 4 + 2];
    return `${r},${g},${b}`;
}

const addDarkOverlay = (percentage = .5) => {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgba(0,0,0,${percentage})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const showAmongy = () => {
    let ctx = canvas.getContext('2d');
    amongyCollection.forEach(a => {
        a.pixels.forEach(p => {
            let [r, g, b] = p.color.split(",");
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(p.x, p.y, 1, 1);
        })
    })
}