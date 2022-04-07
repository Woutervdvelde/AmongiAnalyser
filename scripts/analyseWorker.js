const worker_function = () => {
    onmessage = (message) => {
        canvasWidth = message.data[1];
        canvasHeight = message.data[2];
        checkImageForAmongy(message.data[0]);
    }

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


    let canvasWidth;
    let canvasHeight;
    const amongyCollection = [];
    const pixelMatrix = [[]];


    const checkImageForAmongy = (data) => {
        for (let y = 0; y < canvasWidth; y++)
            for (let x = 0; x < canvasHeight; x++) {
                if (pixelMatrix[x] && pixelMatrix[x][y]) continue;

                for (let i = 0; i < variants.length; i++) {
                    let pixels = checkVariant(data, variants[i], x, y);
                    if (!pixels) continue;
                    addVariantToMatrix(pixels);
                    amongyCollection.push(new Amongy(variants[i].type, pixels));
                    break;
                }
            }

        postMessage([amongyCollection])
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
            if (pixelMatrix[x] && pixelMatrix[x][y]) return false;

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
        return !(x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight)
    }

    const getRGBFromCords = (data, x, y) => {
        const r = data[canvasWidth * y * 4 + x * 4 + 0];
        const g = data[canvasWidth * y * 4 + x * 4 + 1];
        const b = data[canvasWidth * y * 4 + x * 4 + 2];
        return `${r},${g},${b}`;
    }
}