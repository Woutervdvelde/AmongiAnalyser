const analyseButton = document.getElementById("btn-analyse");
let amongyCollection;

/**
 * 
 * @returns 
 */
const loadIcon = () => {
    let element = document.createElement("DIV");
    element.classList.add("load-icon");
    return element;
}

const checkImageForAmongi = () => {
    analyseButton.innerHTML = loadIcon().outerHTML;
    analyseButton.disabled = true;
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    //used this workaround to load local worker file (https://stackoverflow.com/a/33432215/9470981)
    let worker = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
    worker.postMessage([data, canvas.width, canvas.height]);

    worker.onmessage = (message) => {
        amongyCollection = message.data[0];
        
        draw(amongyCollection);
        showStatistics(amongyCollection);
        analyseButton.innerHTML = "Analyse";
        analyseButton.disabled = false;
        worker.terminate();
    }
}

const filterCertaintyAmongy = (amongyCollection) => {
    return amongyCollection.filter(a => a.certainty >= certaintyThreshold);
}