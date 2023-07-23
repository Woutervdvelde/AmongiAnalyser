const statsContainer = document.getElementById("stats-container");
const totalAmongiCount = document.getElementById("stats-count-total");

const createStatContainer = (name, count, amongi) => {
    const container = document.createElement("DIV");
    const display = document.createElement("CANVAS");
    const body = document.createElement("DIV");
    const title = document.createElement("H3");
    const text = document.createElement("P");
    container.setAttribute("onclick", `zoomToSpecific(${amongi.pixels[0].x}, ${amongi.pixels[0].y})`);

    container.classList.add("stat-container");
    display.classList.add("stat-display");
    body.classList.add("stat-body");

    display.width = display.height = 100;
    generateAmongiDisplay(display, amongi);
    title.innerText = name;
    text.innerText = `Found: ${count}`;

    body.appendChild(title);
    body.appendChild(text);
    container.appendChild(display);
    container.appendChild(body);

    return container;
}

const generateAmongiDisplay = (display, amongi) => {
    const ctx = display.getContext('2d');
    ctx.fillStyle = "rgb(191, 0, 54)";
    offsetX = 0;
    offsetY = 0;
    amongi.variant.cords.forEach(c => {
        if (c.x < offsetX) offsetX = c.x;
        if (c.y < offsetY) offsetY = c.y;
    });
    offsetX = Math.abs(offsetX);
    offsetY = Math.abs(offsetY);

    //5x5 grid
    w = display.width / 5;
    h = display.height / 5;
    amongi.variant.cords.forEach((c, i) => {
        ctx.fillStyle = `rgb(${amongi.pixels[i].color})`;
        let x = (c.x + offsetX) * w;
        let y = (c.y + offsetY) * h;
        ctx.fillRect(x, y, w, h);
    });
}

const showStatistics = (amongiCollection) => {
    statsContainer.innerHTML = null;
    let collection = filterCertaintyAmongi(amongiCollection);
    let variants = [...new Set(collection.map(a => a.variant))];
    let containers = {};
    for (let variant in variants) {
        variant = variants[variant];

        let variantCollection = collection.filter(a => a.variant == variant);
        let name = `${variant.type} ${variant.flipped ? "flipped" : ""}`;
        let count = variantCollection.length;
        let amongi = variantCollection[Math.floor(Math.random() * count)];
        let element = createStatContainer(name, count, amongi);

        while (containers[count]) count++;
        containers[count] = element;
    }

    totalAmongiCount.innerText = collection.length;
    Object.values(containers).reverse().forEach(e => statsContainer.appendChild(e));
}