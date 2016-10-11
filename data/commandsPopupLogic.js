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
let progressCmd = document.getElementById("progress-cmd");
let progressLabel = document.getElementById("progress-info");
let progressContainer = document.getElementById("progress-container");
let dataContainer = document.getElementById("data-container");
let histContainer = document.getElementById("history-container");
let msgInfoContainer = document.getElementById("msgInfo-container");

let helpInjection = document.createElement("object");
helpInjection.data = "generated-docs.html";
helpInjection.height = "275";

//== CommandsPopup functions ===================================================
var showHelp = function (){
    removeChilds(dataContainer);
    dataContainer.appendChild(helpInjection);

    textInput.focus(); // Temp fix of periodical focus loose
    setTimeout(()=> fixPopupSize(), WAIT_RESIZE_TIMEOUT);
}

var removeChilds = function (node) {
    var last;
    while (last = node.lastChild) node.removeChild(last);
};

function fixPopupSize(){
    self.port.emit('resize',{width: document.documentElement.clientWidth, 
                    height: document.documentElement.clientHeight});
}

//== OnFirstRun callings =======================================================
showHelp();

//==============================================================================
let helpButton = document.getElementById("help-button");
helpButton.onclick = showHelp;


//== EventListeners ============================================================
textInput.addEventListener('keyup', function onkeyup(event) {
    if (event.keyCode == KEY_ENTER && textInput.value.length > 0) {
        text = textInput.value.replace(/(\r\n|\n|\r)/gm,"");
        self.port.emit("text-entered", text);
        textInput.value = '';
    }
}, false);


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

//== PortOn singal handlings ==================================================
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
    setTimeout(()=> fixPopupSize(), WAIT_RESIZE_TIMEOUT);
});

self.port.on("task-completed", function onTaskCompleted(){
    self.port.emit("can-be-hiden");
    removeChilds(dataContainer);
    textInput.value = '';
    dataContainer.setAttribute('tabindex','-1');
    fixPopupSize();
});

self.port.on("historyData-arrived", function onHistDataArrive(data){

    let list = document.getElementById("history-list");
    if (!list){
        list = document.createElement('ul');
        list.id = "history-list";
    }

    let listLen = list.childNodes.length;
    let dataLen = data.length;
    let diff = dataLen - listLen;
    // If actual commands hist is shorter, than displayed,
    // we probaly are in widow with another history, so
    // clear all previous data, and add all new data with help of diff modification
    if (diff < 0){
        removeChilds(list);
        diff = dataLen;
    }

    for (let i = dataLen - diff; i < dataLen; i++){
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
        list.insertBefore(item, list.firstChild);
    }
    histContainer.appendChild(list);

    fixPopupSize();
    textInput.focus(); // Temp fix of periodical focus loose
});

self.port.on("progressChange", function onProgressChanged(value, length, cmd){
    if (length > 1){
        if (progressContainer.style.display !== 'table'){
            progressContainer.style.display = 'table';
            progressCmd.textContent = "Exectuting command: " + cmd;
            fixPopupSize();
        }
        value += 1;
        progressLabel.textContent = value + " of " + length;
        progressBar.max = length;
        progressBar.value = value;
    }
    if (value === length){
        progressContainer.style.display = 'none';
        fixPopupSize();
    }
    self.port.emit("progressChanged");
});

// var observer = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     console.log("type:" + mutation.type);
//     console.log("attrName:" + mutation.attributeName);
//     console.log("oldValue:" + mutation.oldValue);
//     console.log("target:" + mutation.target);
//     console.log("NativeAcess.style.display:" + mutation.target.style.display);
//     console.log("NativeAcess.id:" + mutation.target.id);
//     console.log("documentElement:" + document.documentElement);
//     console.log("documentElement.id:" + document.documentElement.id);
// 
//     if (mutation.attributeName == 'style'){
//         self.port.emit('resize',{width: document.documentElement.clientWidth, 
//              height: document.documentElement.clientHeight});
//     }
//   });
// });    

// configuration of the observer:
// var config = { attributes: true, attributeOldValue: true };
 
// pass in the target node, as well as the observer options
// observer.observe(progressContainer, config);

// self.addEventListener("resize", function(event) {
//     console.log("-----self resize-----");
//     console.log("typeof self:" + typeof self);
//     console.log("event.type:" + event.type);
//     console.log("event.target:" + event.target);
//     console.log("Resize event called");
//     // self.port.emit('resize',{width: document.documentElement.clientWidth, 
//     //      height: document.documentElement.clientHeight});
// });

// addEventListener("resize", function(event) {
//     self.port.emit('resize',{width: document.documentElement.clientWidth, 
//          height: document.documentElement.clientHeight});
// });

