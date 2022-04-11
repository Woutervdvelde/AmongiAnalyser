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

        variant;
        pixels = [];
        context = [];
        primaryColor = "";

        constructor(variant, pixels, context) {
            this.variant = variant;
            this.pixels = pixels;
            this.context = context;
            this.primaryColor = this.#primaryColor;
            this.certainty = this.#calculateCertainty
        }

        get #primaryColor() {
            //TODO: this... does feel like a pretty ugly way to decide what the most occuring color is.
            let colors = this.pixels.map(p => p.color);
            let colorCount = {};
            for (let i = 0; i < colors.length; i++)
                colorCount[colors[i]] ? colorCount[colors[i]]++ : colorCount[colors[i]] = 1;
            let primaryColor = Object.keys(colorCount).find(key => colorCount[key] === Math.max(...Object.values(colorCount)));
            return primaryColor;
        }

        get #calculateCertainty() {
            let primaryOccurence = this.context[this.primaryColor] ?? 0;
            let totalPixelCount = Object.values(this.context).reduce((count, current) => count + current);
            let certainty = (totalPixelCount - primaryOccurence) / totalPixelCount;
            return certainty;
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
        context = [];

        constructor(type, flipped, cords) {
            this.type = type;
            this.flipped = flipped;
            this.cords = cords;
            this.context = this.#calculateContext(cords);
        }

        #calculateContext = (cords) => {
            let multiArray = [];
            // old surroundings did count the corners, removed for better results.
            // let surrounding = [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
            let surrounding = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
            for (let i = 0; i < cords.length; i++) {
                let cord = cords[i];
                surrounding.forEach(s => {
                    let x = s.x + cord.x;
                    let y = s.y + cord.y;
                    if (multiArray.filter(c => c.x == x && c.y == y).length) return;
                    if (cords.filter(c => c.x == x && c.y == y).length) return;
                    multiArray.push({ x: x, y: y });
                });
            }
            return multiArray;
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

                    let context = getContextPixels(data, variants[i], x, y);
                    addVariantToMatrix(pixels);
                    amongyCollection.push(new Amongy(variants[i], pixels, context));
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

            //preparing for color variants, system not in use yet, needs modification.
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

    const getContextPixels = (data, variant, startX, startY) => {
        let colors = {};
        for (let i = 0; i < variant.context.length; i++) {
            let x = startX + variant.context[i].x;
            let y = startY + variant.context[i].y;

            let color = getRGBFromCords(data, x, y);
            if (!colors[color])
                colors[color] = 1;
            else
                colors[color]++;
        }
        return colors;
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