const createStatContainer = (name, count, amongy) => {
    const container = document.createElement("DIV");
    const display = document.createElement("CANVAS");
    const body = document.createElement("DIV");
    const title = document.createElement("H3");
    const text = document.createElement("P");

    container.classList.add("stat-container");
    display.classList.add("stat-display");
    body.classList.add("stat-body");

    display.width = display.height = 100;
    generateAmongyDisplay(display, amongy);
    title.innerText = name;
    text.innerText = `Found: ${count}`;

    body.appendChild(title);
    body.appendChild(text);
    container.appendChild(display);
    container.appendChild(body);

    return container;
}

const generateAmongyDisplay = (display, amongy) => {
    const ctx = display.getContext('2d');
    ctx.fillStyle = "rgb(191, 0, 54)";
    offsetX = 0;
    offsetY = 0;
    amongy.variant.cords.forEach(c => {
        if (c.x < offsetX) offsetX = c.x;
        if (c.y < offsetY) offsetY = c.y;
    });
    offsetX = Math.abs(offsetX);
    offsetY = Math.abs(offsetY);

    w = display.width / 5;
    h = display.height / 5;
    amongy.variant.cords.forEach((c, i) => {
        ctx.fillStyle = `rgb(${amongy.pixels[i].color})`;
        let x = (c.x + offsetX) * w;
        let y = (c.y + offsetY) * h;
        ctx.fillRect(x, y, w, h);
    });
}