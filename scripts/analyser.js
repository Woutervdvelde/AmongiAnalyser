const analyseButton = document.getElementById("btn-analyse");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let amongyCollection;
let pixelMatrix;

const place = new Image();
place.src = base64Image;
// place.src = testImage;
// place.src = testImage2;

window.onload = async () => {
    ctx.drawImage(place, 0, 0);
}

const loadIcon = () => {
    let element = document.createElement("DIV");
    element.classList.add("load-icon");
    return element;
}

const checkImageForAmongy = () => {
    analyseButton.innerHTML = loadIcon().outerHTML;
    analyseButton.disabled = true;
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    //used this workaround to load local worker file (https://stackoverflow.com/a/33432215/9470981)
    let worker = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
    worker.postMessage([data, canvas.width, canvas.height]);

    worker.onmessage = (message) => {
        amongyCollection = message.data[0];

        initialiseCanvas()
        addDarkOverlay(.8);
        showAmongy();
        analyseButton.innerHTML = "Analyse";
        analyseButton.disabled = false;
        worker.terminate();
    }
}

const initialiseCanvas = () => {
    ctx.drawImage(place, 0, 0);
}

const addDarkOverlay = (percentage = .5) => {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgba(0,0,0,${percentage})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const showAmongy = () => {
    amongyCollection.forEach(a => {
        a.pixels.forEach(p => {
            let [r, g, b] = p.color.split(",");
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(p.x, p.y, 1, 1);
        })
    })
}