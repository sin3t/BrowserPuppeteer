const XULNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

const 
    BROWSER = 'navigator:browser',
    NEWTAB_URL = 'about:home',
    NEWTAB_BLANK_URL = 'about:blank',

    TABINDEX_ANONID = 'tabindex',
    TABINDEX_LAYER_ANONID = 'tabindex-layer',

    SCROLL_STEP = 50,
    TABVIEW_POLLING_TIME = 1000,
    TOOLBARBTN_STYLE_BADGECOLOR = '#CC0000',

    DELIM_SEVERVALS = ',',
    DELIM_RANGE = '-',
    DELIM_PATH = '/',
    DELIM_HOST = '"',
    DELIM_EXCLUDING = '!',
    DELIM_TITLE_LEFT = '<',
    DELIM_TITLE_RIGHT = '>',
    DELIM_LIMIT_LEFT = '[',
    DELIM_LIMIT_RIGHT = ']',
    DELIM_AND_CONDITION = '&',
    DELIM_PLACE_AFTER = 'a',
    DELIM_PLACE_BEFORE = 'b',
    DELIM_PLACE_AT = '@',
    DELIM_PLACE_GROUP = 'g',
    DELIM_PLACE_WINDOW = 'w',

    T_NUMBER = "0",
    T_GROUP = "g",
    T_WINDOW = "w",
    T_PREVIOUS = ".",

    EXEC_OK = "OK",
    EXEC_ERROR = "ERR",
    EXEC_PARTIALOK = "PARTIAL_OK",

    ACTION_CLOSE = "x",
    ACTION_CREATE = "c",
    ACTION_GOTO_G = "g",
    ACTION_GOTO_T = "",
    ACTION_GOTO_W = "w",
    ACTION_DUMP = "d",
    ACTION_MOVE = "m",
    ACTION_ALIAS = "a",
    ACTION_OPEND = "o",
    ACTION_SEARCH = "?",
    ACTION_BOOKMARK = "b",
    ACTION_UNLOAD_T = "u",
    ACTION_RELOAD_T = "r",
    ACTION_LIST_INFO = "l",
    ACTION_STOPLOAD_T = "s",
    ACTION_TOOGLE_PINNING = "p",
    ACTION_TREESTYLETAB_CONTROL = "t",

    COMMANDSPOPUP_POSITION = 40,
    COMMANDSPOPUP_HEIGHT = 50,

    TABLABEL_POSITION = '950',
    TABLABEL_ALIGN = 'center',
    TABLABEL_STYLE_COLOR = '#FFFFFF',
    TABLABEL_STYLE_FONTSIZE = '11px',
    TABLABEL_STYLE_MINWIDTH = '14px',
    TABLABEL_STYLE_MINHEIGHT = '14px',
    TABLABEL_STYLE_TEXTALIGN = 'center',
    TABLABEL_STYLE_ANIMATION = 'none',
    TABLABEL_STYLE_FONTWEIGHT = 'bold',
    TABLABEL_STYLE_BORDERRADIUS = '2px',
    TABLABEL_STYLE_BACKGROUNDCOLOR = '#CC0000',

    PINNED_TABLABEL_STYLE_MINWIDTH = '9px',
    PINNED_TABLABEL_STYLE_MINHEIGHT = '9px',
    PINNED_TABLABEL_STYLE_FONTSIZE = '7pt',

    PINNED_TABLABEL_LAYER_STYLE_MARGINBOTTOM = '2px',
    PINNED_TABLABEL_LAYER_PACK = 'end',
    PINNED_TABLABEL_LAYER_ALIGN = 'end';


const { Cc, Ci, Cm, Cu, Cr, components } = require("chrome");
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

//== SDK components ===========================================================
var { modelFor } = require('sdk/model/core');
var { viewFor } = require("sdk/view/core");

var buttons = require('sdk/ui/button/action');
var tabs_utils = require('sdk/tabs/utils');


//== Pure ns* low-level components ============================================
var historyService = Cc["@mozilla.org/browser/nav-history-service;1"]
                    .getService(Ci.nsINavHistoryService);
var bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
                    .getService(Ci.nsINavBookmarksService);
var IOService = Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService);


//== Add group/window informational buttons ===================================
var windowStateBtn =  buttons.ActionButton({
    id: "window-button",
    label: "Window button",
    icon: "./window.png",
    badge: "",
    badgeColor: TOOLBARBTN_STYLE_BADGECOLOR,
    onClick: function(){
        if (commandsPopup.isShowing)
            commandsPopup.hide();
        else{
            commandsPopup.show();
            requestWindowData();
        }
    }
});

var groupStateBtn =  buttons.ActionButton({
    id: "group-button",
    label: "Group button",
    icon: "./tabgroups.png",
    badge: "",
    badgeColor: TOOLBARBTN_STYLE_BADGECOLOR,
    onClick: function(){
        if (commandsPopup.isShowing)
            commandsPopup.hide();
        else{
            commandsPopup.show();
            requestGroupData();
        }
    }
});

// Setup default button style
viewFor(windowStateBtn).style.fontWeight = "bold";
viewFor(groupStateBtn).style.fontWeight = "bold";
viewFor(groupStateBtn).style.display = "none";

function setBtnBadgeValue(btn, window, value){
    btn.state(window, {
        "badge" : value 
    });
}
//=============================================================================

var data = require("sdk/self").data;
var commandsPopup = require("sdk/panel").Panel({
    position: { 
        top: COMMANDSPOPUP_POSITION, 
    },
    height: COMMANDSPOPUP_HEIGHT,
    contentURL: data.url("commandsPopup.html"),
    contentScriptFile: data.url("commandsPopupLogic.js"),
    contentScript: "self.port.emit('resize', " +
                   "{width: document.documentElement.clientWidth, " +
                   "height: document.documentElement.clientHeight});",
});

// Add tooltip element to Panel item (it not exists in default Panel state)
let { getActiveView }=require("sdk/view/core");
getActiveView(commandsPopup).querySelector("iframe").setAttribute("tooltip", "aHTMLTooltip");

function currentManager(){
    return WindowsManager.windowToManagerMap.get(WindowsManager.actions.getCurrentWindow());
}

function requestWindowData(){
    commandsPopup.port.emit("requestData-arrived", WindowsManager.getCompleteInfoTable());
}

function requestGroupData(){
    commandsPopup.port.emit("requestData-arrived", currentManager().TabsManager.getCompleteInfoTable());
}

commandsPopup.on("show", function() {
    commandsPopup.port.emit("show");
    commandsPopup.port.emit("historyData-arrived", currentManager().TabsManager.commandsHistory);
});
commandsPopup.on("hide", function() {
    WindowsManager.actions.getCurrentWindow().gBrowser.selectedBrowser.focus();
});
//=============================================================================

commandsPopup.port.on("resize", function({width, height})
{
    commandsPopup.resize(width, height);
});

commandsPopup.port.on("text-entered", function (cmd) {
    currentManager().TabsManager.dataParser.parseAndExecute(cmd); 
});

commandsPopup.port.on("can-be-hiden", function (){
    commandsPopup.hide();
});

//=============================================================================
var WindowsManager = {
    windowEnum : Services.wm.getEnumerator(BROWSER),
    init : function() {
        while(this.windowEnum.hasMoreElements()){
            let window = this.windowEnum.getNext();
            let windowId = window.QueryInterface(Ci.nsIInterfaceRequestor).
                getInterface(Ci.nsIDOMWindowUtils).outerWindowID;

            var manager = new TM();
            manager.TabsManager.ownerWindow = window;
            manager.TabsManager.events.subscribeTabEvents();
            manager.TabsManager.updateLabelsData();
            this.windowToManagerMap.set(window, manager);

            this.idToWindowMap.set(windowId, window);
        }
        this.updateLabelsData();
    },

    uninit : function() {
        for (let window of this.windowToManagerMap.keys()){
            let manager = this.windowToManagerMap.get(window);
            manager.TabsManager.events.unsubscribeTabEvents();
            manager.TabsManager.UIchanger.removeAllLabels();
            this.windowToManagerMap.delete(window);
        }
    },

    windowToManagerMap : new Map(),
    idToWindowMap : new Map(),
    tabsManagers : [],
    indexToIdMap : {},
    idToIndexMap : {},

    get handlingTabsManagers() {
        return this.windowToManagerMap.values();
    },
    
    get handlingWindows() {
        return this.windowToManagerMap.keys();
    },

    get countOfWindows() {
        return this.windowToManagerMap.size;  
    },

    updateLabelsData : function(){
        this.doIndexIdRemaping();
        this.UIChanger.paintWindowLabels();
    },

    doIndexIdRemaping : function(){
        let index = 1;
        this.indexToIdMap = {};
        this.idToIndexMap = {};
        for(let id of this.idToWindowMap.keys()){
            this.indexToIdMap[index] = id;
            this.idToIndexMap[id] = index;
            index++;
        }
    },

    // TODO: Display count of current grouptabs/ all group tabs count
    getCompleteInfoTable : function() {
        let dataArray = [];
        let headers = {windowH:"ID", countOfTabsH:"Tabs Σ", titleH:"Window title", thumbH:"Thumb"};
        for (let window of this.windowToManagerMap.keys()){
            dataArray.push({windowId : T_WINDOW + this.actions.getWindowIndex(window),
                    countOfTabs : window.gBrowser.visibleTabs.length,
                    title : window.document.title,
                    thumbnail : this.actions.getThumbnailURIForWindow(window)});
        }
        return {headers, dataArray};
    },

    actions : {
        openWindow : function(target, aParams ){
            let parentWindow = aParams.callerWindow;
            parentWindow.openNewWindowWith(NEWTAB_URL); 
        },

        closeWindow : function(window){
            window.close(); 
        },

        closeWindowAt : function(index){
            let window = this.getWindowAt(index);
            this.closeWindow(window)
        },

        switchToWindow : function(window){
            window.focus();     
        },

        switchToWindowAt : function(index){
            let window = this.getWindowAt(parseInt(index));
            this.switchToWindow(window);    
        },

        focusNextWindow : function(){
             
        },

        getThumbnailCanvasForWindow : function(window) {
            // Code from https://github.com/mozilla/addon-sdk/blob/master/lib/sdk/content/thumbnail.js
            let aspectRatio = 0.5625; // 16:9
            const NS = 'http://www.w3.org/1999/xhtml';
            const COLOR = 'rgb(255,255,255)';

            let thumbnail = Services.appShell.hiddenDOMWindow.document
                            .createElementNS(NS, 'canvas');
            thumbnail.mozOpaque = true;
            thumbnail.width = Math.ceil(window.screen.availWidth / 5.75);
            thumbnail.height = Math.round(thumbnail.width * aspectRatio);
            let ctx = thumbnail.getContext('2d');
            let snippetWidth = window.innerWidth * .6;
            let scale = thumbnail.width / snippetWidth;
            ctx.scale(scale, scale);
            ctx.drawWindow(window, window.scrollX, window.scrollY, snippetWidth,
                            snippetWidth * aspectRatio, COLOR);
            return thumbnail;
        },

        getThumbnailURIForWindow : function(window){
            // BLANK = 'data:image/png;base64,' +
            //       'iVBORw0KGgoAAAANSUhEUgAAAFAAAAAtCAYAAAA5reyyAAAAJElEQVRoge3BAQ'+
            //     'EAAACCIP+vbkhAAQAAAAAAAAAAAAAAAADXBjhtAAGQ0AF/AAAAAElFTkSuQmCC';
            return this.getThumbnailCanvasForWindow(window).toDataURL();
        },

        getCurrentWindow : function(){
            return Services.wm.getMostRecentWindow(BROWSER);
        },

        getWindowId : function(window){
            let windowId = window.QueryInterface(Ci.nsIInterfaceRequestor).
                getInterface(Ci.nsIDOMWindowUtils).outerWindowID;
            return windowId;
        },

        getWindowAt : function(index) {
            let id = this.getWindowIdAt(index);
            let window = WindowsManager.idToWindowMap.get(id);
            return window;
        },

        getWindowIdAt : function(index) {
            return WindowsManager.indexToIdMap[index];
        },  

        getWindowIndex : function(window){
            let wid = this.getWindowId(window);
            let index = WindowsManager.idToIndexMap[wid];
            return index;
        },

        getCurrentWindowIndex : function() {
            return this.getWindowIndex(this.getCurrentWindow());
        }
    },

    UIChanger : {
        paintWindowLabels : function(){
            // const toWidgetId = id =>
            //               ('action-button--browser-puppeteer-' + id);
            // const buttonView = require('sdk/ui/button/view');
            for (let window of WindowsManager.handlingWindows){
                setBtnBadgeValue(windowStateBtn, window, T_WINDOW + WindowsManager.actions.getWindowIndex(window));
                // buttonView.nodeFor(toWidgetId(groupStateBtn.id), window).style.display = 'none';
                viewFor(windowStateBtn).style.fontWeight = "bold";
                viewFor(groupStateBtn).style.fontWeight = "bold";
                viewFor(groupStateBtn).style.display = "none";
            }
        }
    },

    events : {
        mustUpdateIndexes : true,
        disallowUpdatingLabelsData : function(){
            mustUpdateIndexes = false;
        },

        allowUpdatingLablesData : function(){
            mustUpdateIndexes = true;
        },

        windowListener : {
            onOpenWindow : function (xulWindow) {
                var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIDOMWindow);
                 function onWindowLoad() {
                    window.removeEventListener("load",onWindowLoad);
                    if (window.document.documentElement
                            .getAttribute("windowtype") == BROWSER){
                        var manager = new TM();
                        manager.TabsManager.ownerWindow = window;
                        manager.TabsManager.events.subscribeTabEvents();
                        manager.TabsManager.updateLabelsData();
                        WindowsManager.windowToManagerMap.set(window, manager);

                        WindowsManager.idToWindowMap.set(WindowsManager.actions.getWindowId(window), window);
                        // =================================
                        if (mustUpdateIndexes)
                            WindowsManager.updateLabelsData();
                    }
                }
                window.addEventListener("load",onWindowLoad);
            },

            onCloseWindow : function (xulWindow) {
                // Temp bug fix: hide popup before closing to avoid its destruction
                commandsPopup.hide();
                var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIDOMWindow);
                // window.removeEventListener("load",onWindowLoad);
                let manager = WindowsManager.windowToManagerMap.get(window);
                manager.TabsManager.events.unsubscribeTabEvents();
                WindowsManager.windowToManagerMap.delete(window);

                let idToDelete = WindowsManager.actions.getWindowId(window);
                WindowsManager.idToWindowMap.delete(idToDelete);

                if (mustUpdateIndexes)
                    WindowsManager.updateLabelsData();
            },

            onWindowTitleChange : function (aWindow, aTitle) {
            }
        }
    }
}

function TM() {
this.TabsManager = {
    _ownerWindow : null,
    groupsMaps : new Map(),
    commandsHistory : [],
    lastActiveGroupItem : null,
    tabViewPollingFinished : false,

    get ownerWindow(){
        return this._ownerWindow;
    },

    set ownerWindow(window){
        this._ownerWindow = window;
    },

    get gBrowser () {
        return this.ownerWindow.gBrowser;
    },

    get groupItems () {
        return this.ownerWindow.TabView._window.GroupItems;
    },

    getDefaultGroup : function () {
        let wId = WindowsManager.actions.getWindowId(this.ownerWindow);
        let saultedWId = wId + "default";
        if(!this.groupsMaps.has(saultedWId)){
            this.groupsMaps.set(saultedWId, {
                indexToIdMap : {},
                idToIndexMap : {},
                tabsHolder : this.ownerWindow.gBrowser,
                get tabs () { return this.tabsHolder.visibleTabs },
                id : saultedWId 
            });
        }
        return  this.groupsMaps.get(saultedWId);    
    },

    getSpecificGroup : function(lowLevelGroup = this.groupItems.getActiveGroupItem()){
        let currentGroup = lowLevelGroup;
        // console.log("getSpecificGroup: setting saultedGid");
        // console.log("getSpecificGroup: currentGroup,id:" + currentGroup.id);

        let gId = currentGroup.id;
        let saultedGId = gId + "group";
        // let saultedGId = gId.toString();
        let self = this;
        if(!this.groupsMaps.has(saultedGId)){
            this.groupsMaps.set(saultedGId, {
                indexToIdMap : {},
                idToIndexMap : {},
                tabsHolder : currentGroup.children,
                get tabs  () { 
                    if (lowLevelGroup === self.lastActiveGroupItem){
                        return self.gBrowser.visibleTabs;
                    }

                    // Works with tabs, that will be visible after group switching
                    let tabsArr = [];
                    for (let children of this.tabsHolder){    
                        tabsArr.push(children.tab);
                    }
                    // this.tabsHolder ignores pinned tabs, so we must add them before sorting
                    tabsArr.push(...self.gBrowser.visibleTabs.slice(0, self.gBrowser._numPinnedTabs));
                    function sortByPosition(tab1, tab2){
                        return tab1._tPos - tab2._tPos;
                    }
                    tabsArr.sort(sortByPosition);
                    return tabsArr;
                },
                id : saultedGId
            });
        }
        return  this.groupsMaps.get(saultedGId);
    },

    get currentGroup () {
        if (this.ownerWindow.TabView == null || this.ownerWindow.TabView._window == null) {
            return this.getDefaultGroup();
        }else{
            return this.getSpecificGroup();
        }
    },

    get activeIndexToIdMap () {
        return this.groupsMaps.get(this.currentGroup.id).indexToIdMap;
    },
    
    get activeIdToIndexMap () {
        return this.groupsMaps.get(this.currentGroup.id).idToIndexMap;
    },
    
    get visibleTabs() {
        return this.gBrowser.visibleTabs;
    },
    
    get countOfTabs() {
        return this.visibleTabs.length;
    },

    _initData : function() {
        this.currentGroup.indexToIdMap = {};
        this.currentGroup.idToIndexMap = {};
    },

    getCompleteInfoTable : function() {
        let dataArray = [];
        let headers = {groupIdH:"ID", countOfTabsH:"Tabs Σ", groupH:"Group title", thumbH:"Thumb"};
        for (let groupItem of this.groupItems){
            dataArray.push({groupId : T_GROUP + groupItem.id,
                    countOfTabs : groupItem.children.length,
                    title       : groupItem.defaultName,//});
                    thumbnail   : groupItem.canvas.toDataURL()});
        }
        return {headers, dataArray};
    },

    // TODO: Dont add group buttons in windows without tabs
    // TODO: Set button style after every value change (because of own button restyling)
    // TODO: Test solution with MutationOservers
    pollForTabView : function(){
        this.ownerWindow.setTimeout(() => {
            if (this.ownerWindow.TabView._window){
                if (this.lastActiveGroupItem !== this.groupItems.getActiveGroupItem())
                    this.lastActiveGroupItem = this.groupItems.getActiveGroupItem();
                 
                setBtnBadgeValue(groupStateBtn, this.ownerWindow, T_GROUP + this.lastActiveGroupItem.id);
                viewFor(groupStateBtn).style.display = "initial";

                this.updateLabelsData();
                this.tabViewPollingFinished = true;
                return;
            }
            this.pollForTabView()
        }, TABVIEW_POLLING_TIME);
    },

    doIndexIdRemaping : function(currentGroup = this.currentGroup){
        // Dirrect access to map because of read/write ability
        // Completely clean maps to avoid storing old values
        // FIX: Need to delete/add items correctly
        this._initData();

        var visibleTabs = currentGroup.tabs;
        var visibleLength = visibleTabs.length;
        
        var currentIndexToIdMap = currentGroup.indexToIdMap;
        var currentIdToIndexMap = currentGroup.idToIndexMap;

        for (index=1; index<=visibleLength; index++){
            let id=visibleTabs[index-1].linkedPanel;
            currentIndexToIdMap[index]=id; 
            currentIdToIndexMap[id]=index;
        }
    },

    removeTabFromMapsAt : function (tabIndex) {
        let currentIndexToIdMap = this.groupsMaps.get(this.currentGroup.id).indexToIdMap;
        let currentIdToIndexMap = this.groupsMaps.get(this.currentGroup.id).idToIndexMap;
        let idToDelete = currentIndexToIdMap[index];
        delete currentIndexToIdMap[index];
        delete currentIdToIndexMap[idToDelete];
    },
    
    removeTabFromMaps : function (tab) {
        let index = this.getTabIndex(tab);
        this.removeTabFromMapsAt(index);
    },

    addTabToMaps : function (tab) {
        let currentIndexToIdMap = this.groupsMaps.get(this.currentGroup.id).indexToIdMap;
        let currentIdToIndexMap = this.groupsMaps.get(this.currentGroup.id).idToIndexMap;
        let id = tab.linkedPanel;
        let index = this.gBrowser.visibleTabs.length;
        currentIndexToIdMap[index]=id; 
        currentIdToIndexMap[id]=index;
    },

    getTabAt : function(index, indexToIdMap = this.activeIndexToIdMap) {
        let id = indexToIdMap[index];
        let tab = tabs_utils.getTabForId(correctId(id));
        return tab;
    },
    
    getTabIndex : function(tab) {
        //TODO: Add exception if there is no tabLabel
        //      Do something with situattion, when label indexes became not up-to-date
        let tabLabel = tab.ownerDocument
            .getAnonymousElementByAttribute(tab,'anonid', TABINDEX_ANONID);
        if(!tabLabel)
            throw "Specified tab has no indexes";
        let index = tabLabel.getAttribute('value');
        return index;
    },

    getCurrentTab : function() {
        return this.gBrowser.selectedTab;
    },

    getCurrentTabIndex : function(){
        let currentTab = this.gBrowser.selectedTab;
        let index = this.activeIdToIndexMap[currentTab.linkedPanel];
        let strIndex = index.toString();
        return strIndex;
    },

    getCurrentGroupIndex : function(){
        return this.groupItems.getActiveGroupItem().id;
    },

    isLastTab : function(tab){
        // Gecko solution
        //  var isLastTab = (this.tabs.length - this._removingTabs.length == 1);
        let tabs = this.gBrowser.visibleTabs;
        let lastTab = tabs[tabs.length-1];
        return (lastTab === tab);
    },

    // Wrong naming, for nonevent situations "is" should be -> "isLastTab"
    wasLastTab : function(tab){
        // This way is event depndent -> tab should to fully created
        return (tab.getAttribute('last-tab') == "true");
    },

    isCurrentTab : function(){

    },
    
    goNextGroup : function(){
    //TODO: Try to initFrame with tabView on firstCall
        let gri = this.groupItems;
        if (gri){
            this.gBrowser.selectedTab = gri.getNextGroupItemTab(true).tab;
        }
    },

    trackGroupChange : function (event) {
        let tab = event.target;
         if (tab._tabViewTabItem) {
            if (!this.lastActiveGroupItem) {
                this.lastActiveGroupItem = this.ownerWindow.TabView._window.GroupItems.getActiveGroupItem();
            }
            if (this.lastActiveGroupItem != null 
                && tab._tabViewTabItem.parent != this.lastActiveGroupItem){

                let group = this.getSpecificGroup(tab._tabViewTabItem.parent);
                this.doIndexIdRemaping(group);
                this.UIchanger.paintTabLabels(group.tabs, group);
                this.lastActiveGroupItem = tab._tabViewTabItem.parent;
                //----------------------------------------------------------------------------
                setBtnBadgeValue(groupStateBtn, this.ownerWindow, T_GROUP + group.id.charAt(0));
            }
        }
    },

    updateLabelsData : function () {
        // console.log("caller is " + arguments.callee.caller.toString());
        this.doIndexIdRemaping();
        this.UIchanger.paintTabLabels();
    },
    
    doOptimizedUpdateForClose : function(event){
        let tab = event.target;
        if (this.wasLastTab(tab)){
            this.removeTabFromMaps(tab);
        }else{
            this.updateLabelsData();
        }
    },
    
    doOptimizedUpdateForOpen : function(event){
        let tab = event.target;
        if (this.isLastTab(tab)){
            this.addTabToMaps(tab);
            this.UIchanger.addLabel(tab);
        }else{
            this.updateLabelsData();
        }
    },

    doOptimizedUpdateForMove : function(event){
        
    },
    
    actions : {
        fixPinnedTabs : function(){
            this.parent.gBrowser.tabContainer._positionPinnedTabs();
        },

        openTab : function(tabIndex, aParams){
            let url = NEWTAB_URL;
            // TODO: Stop TST service, move tab, enable TST service
            if ('TreeStyleTabService' in this.parent.ownerWindow)
                  this.parent.ownerWindow.TreeStyleTabService.readyToOpenChildTab(this.parent.gBrowser.selectedTab);
            let newTab = this.parent.gBrowser.addTab(url, {skipAnimation:true});
            // if ('TreeStyleTabService' in this.parent.ownerWindow)
            //     this.parent.ownerWindow.gBrowser.treeStyleTab.moveTabs([newTab], this.parent.getCurrentTab());
            this.parent.gBrowser.moveTabTo(newTab, --tabIndex);
            this.parent.gBrowser.selectedTab = newTab;
        },

        closeTab : function(tabIndex, aParams){
            let tab = this.parent.getTabAt(tabIndex, aParams.mapCopy);
            this.parent.gBrowser.removeTab(tab, {animate:false});
        },

        reloadTab : function(tabIndex, aParams){
            let tab = this.parent.getTabAt(tabIndex);
            this.parent.gBrowser.reloadTab(tab);
        },

        stopLoadingTab : function(tabIndex, aParams){
            let tab = this.parent.getTabAt(tabIndex);
            this.parent.gBrowser.getBrowserForTab(tab).stop();
        },

        getRootURI : function(tab){
            let tabURI = tab.linkedBrowser.currentURI;
            if (tabURI.asciiHost == "")
                return tabURI.asciiSpec;
            else
                return tabURI.host; 
        },

        //TODO: fix tab reordering on move - each tab tries to be near the targetIndex
        moveTab : function(tabIndex, aParams){
            let indexIdMap = aParams.mapCopy;
            let behavior = aParams.placing.behavior;
            let placeIndex = aParams.placing.placeIndex;

            let idToMove = indexIdMap[tabIndex];
            let tabToMove = tabs_utils.getTabForId(correctId(idToMove));

            // Tab specific placement
            if ([DELIM_PLACE_AT, DELIM_PLACE_BEFORE, DELIM_PLACE_AFTER].includes(behavior)){
                let idOfPlace = indexIdMap[placeIndex];
                let tabOfPlace = tabs_utils.getTabForId(correctId(idOfPlace));
                let ffIndex = tabOfPlace._tPos;
                switch (behavior) {
                    case DELIM_PLACE_AT     : break;
                    case DELIM_PLACE_AFTER  : ffIndex += 1; break;
                    case DELIM_PLACE_BEFORE : ffIndex -= 1; break;
                }
                this.parent.gBrowser.moveTabTo(tabToMove, ffIndex);
                return;
            }

            // Window/group specific placement
            // TODO: Try to use gBrowser.adopt tab functionality
            // https://dxr.mozilla.org/mozilla-central/source/browser/base/content/tabbrowser.xml#3179
            switch (behavior) {
                case DELIM_PLACE_GROUP :
                    this.parent.groupItems.moveTabToGroupItem(tabToMove, parseInt(placeIndex)); 
                    break;
                case DELIM_PLACE_WINDOW : 
                    // this.parent.gBrowser.replaceTabWithWindow(tabToMove); 
                    let window = WindowsManager.actions.getWindowAt(placeIndex);
                    let newTab = window.gBrowser.addTab(NEWTAB_BLANK_URL);
                    newTab.linkedBrowser.webNavigation.stop(Ci.nsIWebNavigation.STOP_ALL);
                    window.gBrowser.swapBrowsersAndCloseOther(newTab, tabToMove);
                    window.gBrowser.selectedTab = newTab;
                    break;
            }
        },

        switchToTab : function(tabIndex, aParams){
            let tab = this.parent.getTabAt(tabIndex);
            let window = tabs_utils.getOwnerWindow(tab);
            tabs_utils.activateTab(tab, window);
        },

        tooglePinning : function(tabIndex, aParams){
            let tab = this.parent.getTabAt(tabIndex, aParams.mapCopy);
            if (!tab.pinned)
                this.parent.gBrowser.pinTab(tab);
            else
                this.parent.gBrowser.unpinTab(tab);
        },

        bookmarkTab : function(tabIndex, aParams){
            function searchFolder(title, parentFolder = bookmarksService.unfiledBookmarksFolder){
                let options = historyService.getNewQueryOptions();
                let query = historyService.getNewQuery();

                query.setFolders([parentFolder],1);
                options.excludeItems = true;

                let result = historyService.executeQuery(query, options);
                let rootNode = result.root;
                rootNode.containerOpen = true;

                for (let i = 0; i < rootNode.childCount; i ++) {
                    let node = rootNode.getChild(i);
                
                    if (node.title === title){
                        rootNode.containerOpen = false; 
                        return node.itemId;
                    }
                }
                rootNode.containerOpen = false; 
                return null;
            }
            function createFolder(title, parentFolder = bookmarksService.unfiledBookmarksFolder){
                let folderId = bookmarksService.createFolder(
                    parentFolder, 
                    title,       
                    bookmarksService.DEFAULT_INDEX);    
                return folderId;
            }

            aParams.path = aParams.path || {valueArray: []};
            let folderTitles = aParams.path.valueArray.slice();

            let title = folderTitles.shift();
            let parentFolder = bookmarksService.unfiledBookmarksFolder;
            
            // Should be len + 1 because of shifted first value
            let length  = folderTitles.length + 1;

            // Search for last existing folder and get its id
            for (let i=1; i <= length; i++){ 
                let folderId = searchFolder(title, parentFolder);
                if (folderId == null)
                    break;
                parentFolder = folderId;
                title = folderTitles.shift();
            }

            let pasteFolder;
            if (title == undefined) // if all needed folders exists
                pasteFolder = parentFolder; 
            else
                pasteFolder = createFolder(title, parentFolder); // create folder for shifted title

            length = folderTitles.length;
            
            // Create all non existing folders with last existing folder as parent
            for (let i=1; i <= length; i++){ 
                pasteFolder = createFolder(folderTitles.shift(), pasteFolder);
            }

            let indexIdMap = aParams.mapCopy;
            let id = indexIdMap[tabIndex];
            let tab = tabs_utils.getTabForId(correctId(id));
            let tTitle = tabs_utils.getTabTitle(tab);
            let tURL = tabs_utils.getTabURL(tab);

            // Create tab bookmark
            var bookmarkURI = IOService.newURI(tURL, null, null);
            var bookmarkId = bookmarksService.insertBookmark(
                pasteFolder,
                bookmarkURI,             
                bookmarksService.DEFAULT_INDEX, 
                tTitle);    

            // Working solution, but SDK does not allow to add bookmarks to nondefault folders 
            //
            // let groupTitles = aParams.path.valueArray.slice();
            // let topGroup = Group({title: groupTitles.shift()});
            // 
            // let length = groupTitles.length;
            // for (let i=1; i <= length; i++){ // From the end
            //     topGroup = Group({title:groupTitles.shift(), group:topGroup});
            // }
            // let indexIdMap = aParams.mapCopy;
            // let id = indexIdMap[tabIndex];
            // let tab = tabs_utils.getTabForId(correctId(id));
            // let tTitle = tabs_utils.getTabTitle(tab);
            // let tURL = tabs_utils.getTabURL(tab);
            // let bookmark = Bookmark({ title: tTitle, url: tURL, group:topGroup });
            // let emitter = save(bookmark);
            // 
            // emitter.on("data", function (saved, inputItem) {
            //   console.log(saved.title === inputItem.title); // true
            //   console.log(saved !== inputItem); // true
            //   console.log(inputItem === bookmark); // true
            // }).on("end", function (savedItems, inputItems) {
            // });
        },

        changeGroupAt : function(id){
            //  if(!Tabs.hasHidden()) { return; }
            let numberId = parseInt(id);
            this.parent.ownerWindow.TabView._window.UI.goToTab(
                this.parent.groupItems._items.get(numberId)
                .getActiveTab().tab);   
            // ========
            // this.parent.ownerWindow.TabView._window.UI.setActive(this.parent.groupItems._items.get(numberId));
            // this.parent.ownerWindow.gBrowser.selectedTab = this.parent.groupItems._items.get(numberId)
            //     .getActiveTab().tab;
            // let tab = this.parent.groupItems._items.get(numberId).getActiveTab().tab;
            // this.parent.groupItems.updateActiveGroupItemAndTabBar(tab);
            // this.parent.groupItems._items.get(numberId).zoomIn();
            //
            //     switchGroup: function(aPrevious) {
            //     if(!Tabs.hasHidden()) { return; }
            // 
            //     this._initFrame(() => {
            //         let groupItems = this._window[objName].GroupItems;
            //         let tabItem = groupItems.getNextGroupItemTab(aPrevious);
            //         if(!tabItem) { return; }
            // 
            //         let isVisible = this.isVisible();
            //         if(Tabs.selected.pinned || isVisible) {
            //             groupItems.updateActiveGroupItemAndTabBar(tabItem, { dontSetActiveTabInGroup: !isVisible });
            //         } else {
            //             Tabs.selected = tabItem.tab;
            //         }
            //     });
            // },
            // let ui = this.parent.ownerWindow.TabView._window.UI;
            // let gi = this.parent.groupItems._items.get(numberId);
            // ui.setActive(gi);
            // let tab = gi.getActiveTab().tab;
            // ui.goToTab(tab);
            
        },
        
        changeGroupByName : function(name){
            
        },

        createGroup : function(name){
            let groupItem = this.parent.groupItems.newGroup();
            // groupItem.setTitle("G" + groupItem.id + " : " + name);
            groupItem.newTab(NEWTAB_URL);
        },
        
        closeGroup : function(id){
            let numberId = parseInt(id);
            let groupToClose = this.parent.groupItems._items.get(numberId);

            // If need to close current group, then try to switch nearest left one
            if (numberId == this.parent.getCurrentGroupIndex()) {
                let inReverseOrder = true;
                let nextGroupItemTab = this.parent.groupItems.getNextGroupItemTab(inReverseOrder);
                this.parent.ownerWindow.TabView._window.UI.goToTab(nextGroupItemTab);
                this.parent.groupItems.updateActiveGroupItemAndTabBar(nextGroupItemTab);
            } 

            groupToClose.tryToClose();
            // TODO: Remove current group from map 
            // TODO: Add tab remove group closing listeners
        },
    },

    events : {
        isSubscripted : false,
        examinedEvents : ["TabSelect",
                            "TabMove",
                            "TabPinned",
                            "TabUnpinned",
                            "TabClose",
                            "TabOpen"],
        handleEvent : function(event){
                // TODO: OnMove update just indexes between currentTabIndex
                //          to the futureTabIndex
                // TODO: Add data removal from maps on TabClose
            switch (event.type){
                case "TabSelect" :
                    this.parent.trackGroupChange(event);
                    break;
                case "TabMove" :
                case "TabPinned" :
                case "TabUnpinned" :
                    this.parent.updateLabelsData(); 
                    break;
                case "TabClose" :
                    this.parent.doOptimizedUpdateForClose(event);
                    break;
                case "TabOpen" :
                    this.parent.doOptimizedUpdateForOpen(event);
                    break;
            }
        },
        subscribeTabEvents : function(){
            if (!this.parent.tabViewPollingFinished)
                this.parent.pollForTabView();
            if (!this.isSubscripted){
                this.examinedEvents.forEach(event => {
                        this.parent.ownerWindow.gBrowser.tabContainer.addEventListener(
                                event,
                                this,
                                false);
                });
                this.isSubscripted = true;
            }
        },
        
        unsubscribeTabEvents : function(){
            if (this.isSubscripted){
                this.examinedEvents.forEach(event => {
                        this.parent.ownerWindow.gBrowser.tabContainer.removeEventListener(
                                event,
                                this,
                                false);
                });
                this.isSubscripted = false;
            }
        }   
    },

    dataParser : {
        parseAndExecute : function(cmd){
            let doAction = {};
            let oneStepCommand = true;

            let action = this.isNumber(cmd.charAt(0)) ? ACTION_GOTO_T : cmd.charAt(0);
            let target = cmd.slice(1,cmd.length);
            let winActs = WindowsManager.actions;
            let tabActs = this.parent.actions;

            switch(action) {
                case ACTION_CREATE:
                        doAction.forTab = tabActs.openTab.bind(tabActs);
                        doAction.forGroup = tabActs.createGroup.bind(tabActs);
                        doAction.forWindow = winActs.openWindow.bind(winActs);
                        break;
                case ACTION_CLOSE:
                        doAction.forTab = tabActs.closeTab.bind(tabActs);
                        doAction.forGroup = tabActs.closeGroup.bind(tabActs);
                        doAction.forWindow = winActs.closeWindowAt.bind(winActs);
                        break;
                case ACTION_GOTO_T: 
                case ACTION_GOTO_G:
                case ACTION_GOTO_W:
                        if(this.getArgumentType(cmd) != null){
                            target = cmd;
                            doAction.forTab = tabActs.switchToTab.bind(tabActs);
                            doAction.forGroup = tabActs.changeGroupAt.bind(tabActs);
                            doAction.forWindow = winActs.switchToWindowAt.bind(winActs);
                        }
                        break;
                case ACTION_BOOKMARK:
                        doAction.forTab = tabActs.bookmarkTab.bind(tabActs);
                        break;
                case ACTION_TOOGLE_PINNING:
                        doAction.forTab = tabActs.tooglePinning.bind(tabActs);
                        break;
                case ACTION_MOVE:
                        doAction.forTab = tabActs.moveTab.bind(tabActs);
                        break;
                case ACTION_RELOAD_T:
                        doAction.forTab = tabActs.reloadTab.bind(tabActs);
                        break;
                case ACTION_STOPLOAD_T:
                        doAction.forTab = tabActs.stopLoadingTab.bind(tabActs);
                        break;
                case ACTION_ALIAS:
                        break;
                // case ACTION_SEARCH:
                //         doAction.forTab = tabActs.searchTabByTitle.bind(tabActs);
                        // doAction.forGroup = tabActs.searchGroupByTitle.bind(tabActs);
                        // doAction.forWindow = winActs.searchWindowByTitle.bind(tabActs);
                        break;
                case ACTION_TREESTYLETAB_CONTROL:
                        this.parent.updateLabelsData();
                        break;
                case ACTION_UNLOAD_T:
                        break;
                case ACTION_LIST_INFO:
                        doAction.forGroup = requestGroupData;
                        doAction.forWindow = requestWindowData;
                        oneStepCommand = false;
                        break;
            }

            let aParams = {};

            // Find and extract third and additional sections
            let path = this.hasPath(target);
            if (path){
                target = target.replace(path.rawData, '');
                // console.log("PATH.array:" + path.pathArray);
                // console.log("TARGET:" + target);
            }
            let excluding = this.hasExcludeList(target);
            if (excluding){
                target = target.slice(0, target.indexOf(DELIM_EXCLUDING + excluding.rawData)); // We extracted "!" before
            }
            let placing = this.hasPlacing(target);      // m25a5 -> a5 is placing
            if (placing && action == ACTION_MOVE){
                target = target.slice(0, target.indexOf(placing.rawData));
            }

            // Setup current item in unspecified target 
            if (target.length == 0){
                target = this.parent.getCurrentTabIndex();
            }else if (target == T_WINDOW){
                target += WindowsManager.actions.getCurrentWindowIndex();
            }else if (target == T_GROUP){
                target += this.parent.getCurrentGroupIndex();
            } 

            aParams.mapCopy = Object.assign({}, this.parent.activeIndexToIdMap);
            aParams.action = doAction;
            aParams.target = target;
            aParams.placing = placing;
            aParams.excluding = excluding;
            aParams.path = path;
            aParams.callerWindow = this.parent.ownerWindow;
            aParams.valueArray = [];
            aParams.valueArrayWithExcludings = this.getSimplifiedArray(target);

            // Remove duplicates
            aParams.valueArrayWithExcludings = [...new Set(aParams.valueArrayWithExcludings)];

            // Setup act array with respect of excluding values
            for (let index of aParams.valueArrayWithExcludings){
                if (aParams.excluding && aParams.excluding.valueArray.includes(index))
                    continue;
                aParams.valueArray.push(index);
            }
            
            // Find nearest non-actioned -> TODO: move to own function
            if (action === ACTION_CLOSE 
                && aParams.valueArray.length > 1
                && aParams.valueArray.includes(this.parent.getCurrentTabIndex())){
                let currIndex = parseInt(this.parent.getCurrentTabIndex());
                let indexArr = Object.keys(this.parent.activeIndexToIdMap);

                let actionlessValues = indexArr.filter(el => {
                    return !aParams.valueArray.includes(el);
                });

                if (actionlessValues.length > 0){
                    let step = 0;
                    let probeIndex;
                    do { // 0 ; +1; -1; +2; -2 ...
                        step = step > 0 ? -1*step : Math.abs(step) + 1; 
                        probeIndex = step + currIndex;
                    } while(!actionlessValues.includes(probeIndex.toString()));
                    this.parent.actions.switchToTab(probeIndex);
                }
            }

            let hasManyTargets = aParams.valueArray.length > 1;
            if (hasManyTargets){
                this.parent.events.unsubscribeTabEvents();
                WindowsManager.events.disallowUpdatingLabelsData();
            }

            let execState = EXEC_OK;
            let execMsg = "";
            const runLoop = (aParams, i=0) => {
                if (i == aParams.valueArray.length) return;
            
                let value = aParams.valueArray[i];
                // console.log("Value to act is :" + value);
                let valueType = this.getArgumentType(value);
                try{
                    switch(valueType){
                        case T_NUMBER   : doAction.forTab(value, aParams); break;
                        case T_GROUP    : doAction.forGroup(value.replace("g",''), aParams); break;
                        case T_WINDOW   : doAction.forWindow(value.replace("w",''), aParams); break;
                        default: execMsg = "Unknown target error: " + value; execState = EXEC_ERROR;
                    }
                }catch (err) {
                     execMsg = "Inner action execution error:\n" + err;
                     execState = EXEC_ERROR;
                }
                commandsPopup.port.once("progressChanged", runLoop.bind(null, aParams, i+1));
                commandsPopup.port.emit("progressChange", i, aParams.valueArray.length, cmd);
                if (i == aParams.valueArray.length - 1){
                    // Its senseless to update data on simple tab change
                    if (action !== ACTION_GOTO_T){
                        // TODO: w2 ; xw2-w4 -> firefox NS_ERROR_NOT_INTIALIZED after closing last window
                        this.parent.events.subscribeTabEvents();
                        WindowsManager.events.allowUpdatingLablesData();
                        WindowsManager.updateLabelsData();
                        this.parent.updateLabelsData();
                    }
                    this.parent.commandsHistory.push({command:cmd, 
                                                        executionState:execState, 
                                                        executionMsg:execMsg}); 
                    if (oneStepCommand && execState === EXEC_OK)
                        commandsPopup.port.emit("task-completed");
                    else
                        commandsPopup.port.emit("historyData-arrived", this.parent.commandsHistory);
                }
            };
            runLoop(aParams);
            // Fast running, with packetized actions, but doesnt allow to see progress
            //
            // for (let value of aParams.valueArray){
            //     console.log("Value to act is :" + value);
            // 
            //     let valueType = this.getArgumentType(value);
            //     try{
            //         switch(valueType){
            //             case T_NUMBER  : doAction.forTab(value, aParams); break;
            //             case T_GROUP   : doAction.forGroup(value.replace("g",''), aParams); break;
            //             case T_WINDOW  : doAction.forWindow(value.replace("w",''), aParams); break;
            //             default: execMsg = "Unknown target error: " + value; execState = EXEC_ERROR;
            //         }
            //     }catch (err){
            //         execMsg = "Inner action execution error:\n" + err;
            //         execState = EXEC_ERROR;
            //     }
            // }
            // 
            // if (hasManyTargets){
            //     this.parent.events.subscribeTabEvents();
            //     this.parent.updateLabelsData();
            // }
            // 
            // this.parent.commandsHistory.push({command:cmd, 
            //                                     executionState:execState, 
            //                                     executionMsg:execMsg});  
            // if (oneStepCommand && execState === EXEC_OK)
            //     commandsPopup.port.emit("task-completed");
            // else
            //     commandsPopup.port.emit("historyData-arrived", this.parent.commandsHistory);
        },

        getArgumentType : function(arg){
            if (this.isNumber(arg)) return T_NUMBER;
            if (arg.charAt(0) == "g") return T_GROUP;
            if (arg.charAt(0) == "w") return T_WINDOW;
            return null;
        },

        //== Multiple targets functions =================================
        extractRangeValues : function(range){
            const rBegin = 0;
            const rEnd = 1;
            let valueArr = [];
            let prefix = "";
            let startValue,
                endValue;
            // console.log("In ProccedRange func");
            
            if (range[rBegin].charAt(0) == T_GROUP && range[rEnd].charAt(0) == T_GROUP){
                // Extract T_GROUP classifier
                range[rBegin] = range[rBegin].replace(T_GROUP, "");
                range[rEnd] = range[rEnd].replace(T_GROUP, "");
                prefix = T_GROUP;
            }

            if (range[rBegin].charAt(0) == T_WINDOW && range[rEnd].charAt(0) == T_WINDOW){
                // Extract T_WINDOW classifier
                range[rBegin] = range[rBegin].replace(T_WINDOW, "");
                range[rEnd] = range[rEnd].replace(T_WINDOW, "");
                prefix = T_WINDOW;
            }

            // TODO: Add support for "w" and "g" -> xw-w5, xw5-w, x-w5 ?
            switch (prefix) {
                case T_GROUP:
                    startValue = this.parent.getCurrentGroupIndex();
                    // endValue = ;
                    break;
                case T_WINDOW:
                    startValue = WindowsManager.actions.getCurrentWindowIndex();
                    endValue = WindowsManager.countOfWindows;
                    break;
                default:
                    startValue = this.parent.getCurrentTabIndex();
                    endValue = this.parent.countOfTabs;
            }
            
            // Provide "e"nd functionality
            // x-e -> close tabs from current to the end; xe- -> the same
            if (range[rBegin] == "e")
                range[rBegin] = endValue;
            if (range[rEnd] == "e")
                range[rEnd] = endValue; 

            // Provide currentTab ranges; 
            //  x-15 -> close from current to 15th tab, x5- -> close from 5th to current etc
            if (range[rBegin] == "" || range[rEnd] == ""){
                // let index = this.parent.getCurrentTabIndex();
                let index = startValue; 
                if(range[rBegin] == "" )
                    range[rBegin] = index;
                else
                    range[rEnd] = index;    
                // console.log("Extend empty range with index:" + index);
            }

            // Provide reverse ranges 150-12, e-15 etc
            if (Number(range[rBegin]) > Number(range[rEnd])){
                [ range[rBegin], range[rEnd] ] = [ range[rEnd], range[rBegin] ]; 
            }
            // console.log("so range[B]=" + range[rBegin] + " and range[E]=" + range[rEnd]);
            // TODO: Fix group numeration bug: we work with native groups ID, 
            //          so definately there will be
            //      id skipping -> 3,4,5,7. In such case we cannt simply inc 
            //          counter, need to iterate through
            // TODO: Add panel groupView update on group clossing?
            // Number-Number - is temp fix, need to do some with chars/numbers scenarios
            for (let targetIndex = range[rBegin]; Number(targetIndex) <= Number(range[rEnd]); targetIndex++){
                // console.log("In changed range loop, range part id :" + targetIndex); 
                valueArr.push(prefix + targetIndex.toString());
            }
            return valueArr;
        },


        extractHostValues : function(str){
            // console.log("=======================");
            // console.log("Argumebbt str:" + str + " and str.length:" + str.length);
            let hostToAct = (str == "") ? this.parent.actions.getRootURI(this.parent.getCurrentTab()) : str;
            // console.log("   after repair, hostToAct:" + hostToAct);

            let tabs = this.parent.visibleTabs;
            let indexesToAct = [];
            for (let tab of tabs){
                tabAddr = this.parent.actions.getRootURI(tab);
                if (tabAddr == hostToAct){
                    let id = tab.linkedPanel;
                    indexesToAct.push(this.parent.activeIdToIndexMap[id].toString());
                }
            }
            return indexesToAct;
        },

        extractTitleValues : function(arg){
            let lookingWords = arg.valueArray;
            let _returnArr = [];

            for (let tab of this.parent.gBrowser.visibleTabs){
                let wasInterrupted = false;
                let length = lookingWords.length;
                while (length-- && !wasInterrupted){
                    let word  = lookingWords[length];
                    if (tab.label.indexOf(word) == -1)
                        wasInterrupted = true; 
                }
                if (!wasInterrupted){
                    _returnArr.push(this.parent.activeIdToIndexMap[tab.linkedPanel]);
                }
            }
            console.log(_returnArr.toSource());
            return _returnArr;
        },


        //=== has[a] ============================================================
        hasSeveralValues : function(arg){
            let splited = arg.split(DELIM_SEVERVALS);
            return splited.length > 1 ? splited : null; 
        },

        // "b123,24,53/someDir/subdir/level3dir/dir with space/ ==== dir name ===/'wrongData'123,145"
        hasPath : function(arg){
            let pBegin = arg.indexOf(DELIM_PATH);
            let pEnd = arg.lastIndexOf(DELIM_PATH);
            if (pBegin != -1 && pEnd != -1 && pBegin != pEnd){
                let _rawData = arg.slice(pBegin, pEnd+1);
                let _pathArray = arg.slice(pBegin + 1, pEnd).split(DELIM_PATH);
                return { rawData : _rawData
                        ,valueArray : _pathArray};
            }
            return null;
        },

        // FIX: mg5w3 - will not work in parser.Anyway, there is no such func event in TabGroups
        hasPlacing : function(arg){
            // Extract all host data like "example.com", "" to avoid conflicts with a,b,g places
            let quotationSplitting = arg.split(/"((?:\\.|[^"\\])*)"/);
            let possiblePlacing = quotationSplitting[quotationSplitting.length-1];
            
            if  (possiblePlacing.split(/[@abgw]/).length > 1){
                let len = possiblePlacing.length;
                let placementAt = possiblePlacing.indexOf(DELIM_PLACE_AT);
                let placementAfter = possiblePlacing.indexOf(DELIM_PLACE_AFTER);
                let placementBefore = possiblePlacing.indexOf(DELIM_PLACE_BEFORE);
                let placementInGroup = possiblePlacing.indexOf(DELIM_PLACE_GROUP);
                let placementInWindow = possiblePlacing.indexOf(DELIM_PLACE_WINDOW);

                let _rawData;
                if (placementAt != -1) _rawData = possiblePlacing.slice(placementAt, len);
                if (placementAfter != -1) _rawData = possiblePlacing.slice(placementAfter, len);
                if (placementBefore != -1) _rawData = possiblePlacing.slice(placementBefore, len);
                if (placementInGroup != -1) _rawData = possiblePlacing.slice(placementInGroup, len);
                if (placementInWindow != -1) _rawData = possiblePlacing.slice(placementInWindow, len);
            
                let _behavior = _rawData.charAt(0);
                let _placeIndex = _rawData.slice(1, _rawData.length);
                if (_placeIndex == "e")
                    _placeIndex = this.parent.countOfTabs;
                // console.log("In hasPlacing, placing:" + _rawData);
                // console.log("   placeIndex:" + _placeIndex);
                // console.log("   tabToPlace:" + _placeIndex);
                return { rawData : _rawData
                        ,behavior : _behavior 
                        ,placeIndex : _placeIndex}; 
            }
            return null;
        },

        // Should be recursive?
        getSimplifiedArray : function(value){
            let _target = value;
            let _valueArr = [];
            let sv = this.hasSeveralValues(_target);
            let rg = this.isRange(_target);
            let hd = this.hasHostData(_target);
            let td = this.hasTitleData(_target);
            if (sv){
                for (let value of sv){
                    let rg = this.isRange(value);
                    let hd = this.hasHostData(value);
                    let td = this.hasTitleData(value);
                    if(rg){
                        _valueArr.push(...this.extractRangeValues(rg));
                    }else if (hd != null && (hd == "" || hd.length > 0)){
                        _valueArr.push(...this.extractHostValues(hd));
                    }else if (td){
                        _valueArr.push(...this.extractTitleValues(td));
                    }else{ 
                        _valueArr.push(value);  
                    }
                }
            }else if (rg) {
                _valueArr.push(...this.extractRangeValues(rg));
            }else if (hd != null && (hd == "" || hd.length > 0)){
                _valueArr.push(...this.extractHostValues(hd));
            }else if (td) {
                _valueArr.push(...this.extractTitleValues(td));
            }else{
                if (_target == "")
                    _target = this.parent.getCurrentTabIndex();
                if (_target == "w")
                    _target = T_WINDOW + WindowsManager.actions.getCurrentWindowIndex();
                if (_target == "g")
                    _target = T_GROUP + this.parent.getCurrentGroupIndex();
                _valueArr.push(_target);
            }
            return _valueArr;
        },

        hasExcludeList : function(arg){
            // console.log("In hasExclude list");
            let _arr;
            let splitResult = arg.split(DELIM_EXCLUDING);
            if (splitResult.length > 1){
                let _target = splitResult[1];
                _arr = this.getSimplifiedArray(_target);
                // console.log("   and wanna return _arr:" + _arr);
                return { rawData : _target 
                        ,valueArray : _arr};
            }else{
                return null;
            }
        },

        hasHostData : function(arg){
            // console.log("In hasHostData, arg is :" + arg);
            let results = arg.split('"');
            // console.log("In is hasHostData " + results);
            // console.log("   and results.length=" + results.length);
            if (results.length > 2){
                let possibleHost = results[1];
                let possibleIndexOfHost = (results[0] == "") ? results[2] : results[0]; //9"" or ""9
                if (possibleHost == "" 
                    && possibleIndexOfHost != "" 
                    && this.isNumber(possibleIndexOfHost)){
                        let tab = this.parent.getTabAt(possibleIndexOfHost);
                        return this.parent.actions.getRootURI(tab);
                }
                return possibleHost;
            }
            return null;
        },

        hasTitleData : function(arg){
            // console.log("In hasTitleWord, arg is:" + arg);
            
            let tBegin = arg.indexOf(DELIM_TITLE_LEFT);
            let tEnd = arg.indexOf(DELIM_TITLE_RIGHT);
            if (tBegin != -1 && tEnd != -1 && tBegin != tEnd){
                let _rawData = arg.slice(tBegin, tEnd+1);
                let _pathArray = arg.slice(tBegin + 1, tEnd).split(DELIM_AND_CONDITION);
                return { rawData : _rawData
                        ,valueArray : _pathArray};
            }
            return null;
        },

        //=== is[a] ===
        isRange : function(arg){
            let range = arg.split(DELIM_RANGE);
            // console.log("In is IsRange " + range);
            // console.log("RANGE: All tabs map:" + this.parent.activeIndexToIdMap);
            return range.length > 1 ? range : null;
        },

        isNumber : function(num){
        //  return !Number.isNaN(num) && Number.isFinite(num)
            return !isNaN(num);
        }
    },

    UIchanger : {
        paintTabLabels : function(tabs = this.parent.gBrowser.visibleTabs
                                    ,group = this.parent.currentGroup) {
            for (let tab of tabs)
                this.addLabel(tab, group);
        },

        removeTabLabels : function() {
            let tabs = this.parent.visibleTabs;
            for (let tab of tabs)
                this.removeLabel(tab);
        },

        addLabel : function(tab, group = this.parent.currentGroup) {
            let tabLabel = tab.ownerDocument.getAnonymousElementByAttribute(tab,'anonid', TABINDEX_ANONID);
            let tabLabelLayer = tab.ownerDocument.getAnonymousElementByAttribute(tab,'anonid', TABINDEX_LAYER_ANONID);
            let chromeDocument = tab.ownerDocument;

            if (!tabLabel){
                tabLabel = chromeDocument.createElementNS(XULNS, 'label');
                tabLabel.setAttribute('anonid',TABINDEX_ANONID);
                tabLabel.setAttribute('align', TABLABEL_ALIGN);
                tabLabel.setAttribute('ordinal', TABLABEL_POSITION);
                tabLabel.className = 'tab-text';
                tabLabel.style.color = TABLABEL_STYLE_COLOR;
                tabLabel.style.backgroundColor = TABLABEL_STYLE_BACKGROUNDCOLOR;
                tabLabel.style.animation = TABLABEL_STYLE_ANIMATION;
                tabLabel.style.borderBottomLeftRadius =
                             tabLabel.style.borderBottomRightRadius =
                             tabLabel.style.borderTopLeftRadius =
                             tabLabel.style.borderTopRightRadius = TABLABEL_STYLE_BORDERRADIUS;
                tabLabel.style.textAlign = TABLABEL_STYLE_TEXTALIGN;
                tabLabel.style.fontWeight = TABLABEL_STYLE_FONTWEIGHT;

                // Perform pinning check before connecting with parent, because there can be 2 possible parents:
                // 'tab-content' for simple tab with label index
                // special layer with 'tab-stack' as parent, for pinned tab
                if (!tab.pinned){
                    chromeDocument.getAnonymousElementByAttribute(tab, 'class', 'tab-content').appendChild(tabLabel);
                }
            }

            let index = group.idToIndexMap[tab.linkedPanel];
            tabLabel.setAttribute('value', index);

            if (tab.pinned){
                this.parent.actions.fixPinnedTabs();
                tabLabel.style.fontSize = PINNED_TABLABEL_STYLE_FONTSIZE;
                tabLabel.style.minWidth = PINNED_TABLABEL_STYLE_MINWIDTH;   
                tabLabel.style.minHeight = PINNED_TABLABEL_STYLE_MINHEIGHT;

                if (!tabLabelLayer){
                    tabLabelLayer = chromeDocument.createElementNS(XULNS, 'xul:hbox');
                    tabLabelLayer.setAttribute('anonid', TABINDEX_LAYER_ANONID);
                    tabLabelLayer.setAttribute('class', 'tab-content');
                    tabLabelLayer.setAttribute('pack', PINNED_TABLABEL_LAYER_PACK);
                    tabLabelLayer.setAttribute('align', PINNED_TABLABEL_LAYER_ALIGN);
                    tabLabelLayer.style.marginBottom = PINNED_TABLABEL_LAYER_STYLE_MARGINBOTTOM;

                    tabLabelLayer.appendChild(tabLabel);
                    chromeDocument.getAnonymousElementByAttribute(tab, 'class', 'tab-stack').appendChild(tabLabelLayer);
                }
            }else{
                tabLabel.style.fontSize = TABLABEL_STYLE_FONTSIZE;
                tabLabel.style.minWidth = TABLABEL_STYLE_MINWIDTH;
                tabLabel.style.minHeight = TABLABEL_STYLE_MINHEIGHT;

                // If tab isn't pinned, but layers still exists - means, that it was pinned
                // so we must change parent from layer to tab-content and remove layer itself
                if (tabLabelLayer){
                    chromeDocument.getAnonymousElementByAttribute(tab, 'class', 'tab-content').appendChild(tabLabel);
                    tabLabelLayer.remove();
                }
            }
            // tabLabel.style.minWidth = tabLabel.clientHeight + 'px';
        },

        removeLabel : function(tab) {
            let tabLabel = tab.ownerDocument.getAnonymousElementByAttribute(tab,'anonid', TABINDEX_ANONID);
            if (tabLabel){
                let labelParent = tabLabel.parentNode;
                labelParent.removeChild(tabLabel);
                if (tab.pinned) // Layer is, remove it
                    labelParent.parentNode.removeChild(labelParent);
            }
        },

        removeAllLabels : function() {
            let tabs = this.parent.gBrowser.tabs;
            for (let tab of tabs)
                this.removeLabel(tab);
        }
    },  


    init : function() {
        this.events.parent = this;
        this.actions.parent = this;
        this.dataParser.parent = this;
        this.UIchanger.parent = this;
        delete this.init;
        return this;
    }
}.init();
}


//function count() {
//  try { window.clearTimeout(count.timeout) } catch(e) {};
//  count.timeout = window.setTimeout(()=> {
//     var all = gBrowser.tabs.length, visible = gBrowser.visibleTabs.length; 
//  console.log("All tabs count :" + all + " visible count:" + visible);
//    // tabCounter.label = (all > visible ? visible + '/' : '') + all;
//  }, 350);
//};

//== TabActions =============================================================

//function getTabForId(id) {
//  return getTabs().find(tab => getTabId(tab) === id) || null;
//}

//function getTabs(window) {
//  if (arguments.length === 0) {
//    return getWindows().
//               filter(isBrowser).
//               reduce((tabs, window) => tabs.concat(getTabs(window)), []);
//  }
//
//  // firefox - default
//  return Array.filter(getTabContainer(window).children, t => !t.closing);
//}

//== Hotkeys bindings =========================================================
var { Hotkey } = require("sdk/hotkeys");

var showHotkey = Hotkey({
    combo: "shift-return",
    onPress: function() {
        if (commandsPopup.isShowing)
            commandsPopup.hide();
        else
            commandsPopup.show();
  }
});

var scrollUpHotkey = Hotkey({
    combo: "shift-pageup",
    onPress: function() {
        handleScrollEvent(-SCROLL_STEP);
    }
});

var scrollDownHotkey = Hotkey({
    combo: "shift-pagedown",
    onPress: function() {
        handleScrollEvent(SCROLL_STEP);
    }
});

function correctId(tabId){
    return tabId.substring('panel'.length);
}

//=============================================================================
function handleScrollEvent(px) {
    var window = WindowsManager.actions.getCurrentWindow();
    var tabBrowser = window.document.getElementById('tabbrowser-tabs');
    var tabScrollBox = window.document.getAnonymousElementByAttribute(tabBrowser,
                                        "class", 
                                        "tabbrowser-arrowscrollbox");
    // Scrolling ways
    // scrollPosition=POS <- scroll directly to specific pos
    // scrollWidth <- maxixmum scroll width
    // scrollByPixels(50,0) <- scroll relative to current position
    // tabScrollBox.scrollByPixels(-50,0);
    tabScrollBox.scrollByPixels(px,3*px);
}
//== WindowsManager initialization ============================================

WindowsManager.init();
Services.wm.addListener(WindowsManager.events.windowListener);

//== Extension unload handling ================================================

// https://developer.mozilla.org/en-US/docs/Extensions/Common_causes_of_memory_leaks_in_extensions
exports.onUnload = function (reason) {
    Services.wm.removeListener(WindowsManager.events.windowListener);
    WindowsManager.uninit();
};


