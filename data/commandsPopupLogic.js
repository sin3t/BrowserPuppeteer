// When the user hits return, send the "text-entered"
// message to main.js.
// The message payload is the contents of the edit box.
const 
    EXEC_OK = "OK",
    EXEC_ERROR = "ERR",
    EXEC_PARTIALOK = "PARTIAL_OK",
        
    SHOW_NUM_RESULTS = 20,
    MAX_FIELD_LENGTH = 35,
    WAIT_RESIZE_TIMEOUT = 50,

    KEY_LEFT = 37,
    KET_RIGHT = 39,
    KEY_UP = 38,
    KEY_DOWN = 40,
    KEY_TAB = 9,
    KEY_ENTER = 13;

let textInput = document.getElementById("edit-box");
let progressBar = document.getElementById("progress-bar");
let progressLabel = document.getElementById("progress-info");
let progressContainer = document.getElementById("progress-container");
let dataContainer = document.getElementById("data-container");
let histContainer = document.getElementById("history-container");
let msgInfoContainer = document.getElementById("msgInfo-container");

textInput.addEventListener('keyup', function onkeyup(event) {
    if (event.keyCode == KEY_ENTER && textInput.value.length > 0) {
        text = textInput.value.replace(/(\r\n|\n|\r)/gm,"");
        self.port.emit("text-entered", text);
        textInput.value = '';
    }
}, false);

var removeChilds = function (node) {
    var last;
    while (last = node.lastChild) node.removeChild(last);
};

textInput.addEventListener('keyup', function keyPress(event){
    if (event.keyCode == KEY_UP){
        console.log("Up key was pressed");
    }
    if (event.keyCode == KEY_DOWN){
        console.log("Down key was pressed");
        // let list = histContainer.getElementsByTagName("li");
        // textInput.value = list[0].textContent;
        // list[0].className = "histCmdPartialOK";
        // console.log("listLength:" + list.length);
        // for (let value of list)
        //     console.log(value.textContent);
        //
    }
});

addEventListener('keyup', function keyPress(event){
    if (event.keyCode == KEY_TAB){
        console.log("Tab key pressed");
    }
}, false);

self.port.on("show", function onShow() {
    textInput.focus();
});

self.port.on("requestData-arrived", function onReqDataArrive(info){
    removeChilds(dataContainer);

    // TODO: Make items clickable
    let headers = info.headers;
    let data = info.dataArray;

    let table = document.createElement('table');

    let headersRow = document.createElement('tr');
    for (let value of Object.values(headers)){
        let header = document.createElement('th');
        header.textContent = value;
        headersRow.appendChild(header); 
    }
    table.appendChild(headersRow);

    for (let object of data){
        let row = document.createElement('tr');
        for (let key of Object.keys(object)){
            let value = object[key];
            let cell = document.createElement('td');

            if (key == "thumbnail"){
                let img = document.createElement('img');
                img.setAttribute('src', value);
                cell.appendChild(img);
            }else{
                cell.textContent = value.length > MAX_FIELD_LENGTH
                     ? value.substring(0, MAX_FIELD_LENGTH) + "..." : value;
                if (key == "title") cell.title = value;
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    dataContainer.appendChild(table);
    dataContainer.setAttribute('tabindex','2');
    setTimeout(()=>
        self.port.emit('resize',{width: document.documentElement.clientWidth, 
                        height: document.documentElement.clientHeight}), 
        WAIT_RESIZE_TIMEOUT);
});

self.port.on("task-completed", function onTaskCompleted(){
    self.port.emit("can-be-hiden");
    removeChilds(dataContainer);
    removeChilds(histContainer);
    textInput.value = '';
    dataContainer.setAttribute('tabindex','-1');
    self.port.emit('resize',{width: document.documentElement.clientWidth, 
                    height: document.documentElement.clientHeight});
});

self.port.on("historyData-arrived", function onHistDataArrive(data){
    removeChilds(histContainer);

    let label = document.createElement('label');
    label.innerHTML = "History: " 
        + "<div class='histCmdOK histCmd infoBar'>&nbsp</div> - OK, "
        + "<div class='histCmdERR histCmd infoBar'></div> - Error, " 
        + "<div class='histCmdPartialOK histCmd infoBar'></div> - partial OK";
    histContainer.appendChild(label);

    let list = document.createElement('ul');
    let dataLen = data.length;
    for (let i=dataLen-1; i>=0; i--){
        let item = document.createElement('li');
        let cmdResult = data[i];
        item.textContent = cmdResult.command;
        item.title = cmdResult.executionMsg;
        switch (cmdResult.executionState){
            case EXEC_OK        : item.className = "histCmdOK"; break;
            case EXEC_ERROR     : item.className = "histCmdERR"; break;
            case EXEC_PARTIALOK : item.className = "histCmdPartialOK"; break;
        }

        let msgAttr = document.createAttribute("message");
        msgAttr.value = cmdResult.executionMsg;
        item.setAttributeNode(msgAttr);
        list.appendChild(item);
    }
    histContainer.appendChild(list);

    self.port.emit('resize',{width: document.documentElement.clientWidth, 
         height: document.documentElement.clientHeight});
    textInput.focus(); // Temp fix of periodical focus loose
});

self.port.on("progressChange", function onProgressChanged(value, length){
    if (length > 1){
        if (progressContainer.style.display !== 'table')
            progressContainer.style.display = 'table';
        value += 1;
        progressLabel.textContent = value + " of " + length;
        progressBar.max = length;
        progressBar.value = value;
    }
    if (value === length)
        progressContainer.style.display = 'none';
    self.port.emit("progressChanged");
});

