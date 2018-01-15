var extensionTab = document.querySelector("#download-entry");
var curPlatform = '';
var downloadItems = [];
var downloadItemsStruct = [];
/*
Callback from getFileIcon.
Initialize the displayed icon.
*/
function updateIconUrl(iconUrl) {
    let downloadIcon = document.createElement("img");
    downloadIcon.setAttribute("src", iconUrl);
    return downloadIcon;
}

function getCurrPlatform() {
    var gettingInfo = browser.runtime.getPlatformInfo();
    gettingInfo.then(info => {
        curPlatform = info.os;
    });
}

function getFileName(path) {
    var filename;
    var filenameArr;
    switch (curPlatform) {
        case "win":
            filenameArr = path.split('\\');
            break;
        default:
            filenameArr = path.split('/');
            break;
    }
    var len = filenameArr.length;
    filename = filenameArr[len - 1];
    return filename;
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function clearPopup() {
    extensionTab.textContent = "";
}

function initializeDownloads(downloadItems){
    console.log("init downloads");
    console.log(downloadItems);
    if(downloadItems.length > 0){
        downloadItemsStruct = [];
        downloadItems.forEach(downloadItem => {
            var iconPromise = browser.downloads.getFileIcon(downloadItem.id);
            var filename = getFileName(downloadItem.filename);
            Promise.all([iconPromise, filename]).then( values => {
                let downloadElementLi = document.createElement("li");
                let downloadElementDiv = document.createElement("div");
                let filenameNode = document.createTextNode(values[1]);//filename
                let fileIcon = updateIconUrl(values[0]);
                downloadElementDiv.appendChild(fileIcon);//img node
                downloadElementDiv.appendChild(filenameNode);
                downloadElementLi.appendChild(downloadElementDiv);
                extensionTab.appendChild(downloadElementLi);
                //console.log(values);
                // downloadItemsStruct.push(
                //     { iconImgElem: values[0], fileName: filename }
                // );
            });
        });
    }else{
        extensionTab.textContent = "No downloaded items found."
        document.querySelector("#clear").classList.add("disabled");
        document.querySelector("#redownload").classList.add("disabled");
    }
}

function clearDownloadItems() {
    var toDownload = [];
    downloadItems.forEach(downloadItem => {
        var erasePromise = browser.downloads.erase({
            id: downloadItem.id
        });
        toDownload.push(erasePromise);
    });
    Promise.all(toDownload);
}

function showDownloads(downloadType) {
    clearPopup();
    var initDownloadsPromise;
    var downloadItemsPromise = getDownloadItems(downloadType);
    downloadItemsPromise.then(downloadItems => {
        console.log("before init downloads");
        console.log(downloadItems);
        initializeDownloads(downloadItems);
    });
    // var initDownloadsPromise = Promise.resolve(initializeDownloads());
    // Promise.all([downloadItemsPromise, initDownloadsPromise]).then(
    //     values => {
    //         console.log(values);
    //     }
    // );
}

function getDownloadItems(downloadType) {
    var searchingResult;
    searchingResult = browser.downloads.search({
        state: downloadType
    });
    searchingResult.then((result) => {
        downloadItems = result;
    });
    return searchingResult;
}

getCurrPlatform();

// document.querySelector("#redownload").addEventListener("click", reDownloadItems);
document.querySelector("#clear").addEventListener("click", clearDownloadItems);


document.querySelector("#downloadsFailed").addEventListener("click", function () { showDownloads("interrupted"); }, false);
document.querySelector("#downloadsInprogress").addEventListener("click", function () { showDownloads("in_progress"); }, false);
document.querySelector("#downloadsComplete").addEventListener("click", function () { showDownloads("complete"); }, false);
