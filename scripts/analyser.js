const analyseButton = document.getElementById("btn-analyse");
let amongyCollection;
let pixelMatrix;

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

        draw(amongyCollection);
        analyseButton.innerHTML = "Analyse";
        analyseButton.disabled = false;
        worker.terminate();
    }
}