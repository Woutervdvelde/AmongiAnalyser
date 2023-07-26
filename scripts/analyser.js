const analyseButton = document.getElementById("btn-analyse");
let amongiCollection = [];

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
    //added multiple workers to speed up the process
    let maxWorkers = navigator.hardwareConcurrency || 4;
    let workersFinished = 0;

    function allWorkersFinished() {
        draw(amongiCollection);
        showStatistics(amongiCollection);
        analyseButton.innerHTML = "Analyse";
        analyseButton.disabled = false;
    }

    for (let i = 0; i < maxWorkers; i++) {
        let worker = new Worker(URL.createObjectURL(new Blob(["(" + worker_function.toString() + ")()"], { type: 'text/javascript' })));
        let offsetX = data.length / maxWorkers * i;
        let offsetY = data.length / maxWorkers * (i + 1);
        let workerData = data.slice(offsetX, offsetY);
        // let workerData = data.slice(i * data.length / maxWorkers, (i + 1) * data.length / maxWorkers);
        let workerWidth = canvas.width / maxWorkers;
        let workerHeight = canvas.height;
        worker.postMessage([workerData, workerWidth, workerHeight, offsetX, offsetY]);
        // worker.postMessage([data, canvas.width, canvas.height]);

        worker.onmessage = (message) => {
            console.log("worker done");
            workersFinished++;
            amongiCollection = amongiCollection.concat(message.data[0]);
            worker.terminate();

            if (workersFinished >= maxWorkers)
                allWorkersFinished();
        }
    }
}

const filterCertaintyAmongi = (amongiCollection) => {
    return amongiCollection.filter(a => a.certainty >= certaintyThreshold);
}