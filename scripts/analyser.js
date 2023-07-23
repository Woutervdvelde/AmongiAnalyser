const analyseButton = document.getElementById("btn-analyse");
let amongiCollection;

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
        amongiCollection = message.data[0];
        
        draw(amongiCollection);
        showStatistics(amongiCollection);
        analyseButton.innerHTML = "Analyse";
        analyseButton.disabled = false;
        worker.terminate();
    }
}

const filterCertaintyAmongi = (amongiCollection) => {
    return amongiCollection.filter(a => a.certainty >= certaintyThreshold);
}