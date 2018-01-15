var extensionTab = document.querySelector("#download-entry");
var curPlatform = '';
var downloadItems = [];
var filter = '';

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

function clearPopup() {
    extensionTab.textContent = "";
}

function initializeDownloads(downloadItems){
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
            });
        });
        document.querySelector("#clear").classList.remove("disabled");
        if (filter == "interrupted"){
            document.querySelector("#redownload").classList.remove("disabled");
        }
    }else{
        extensionTab.textContent = "No downloaded items found."
        document.querySelector("#clear").classList.add("disabled");
        document.querySelector("#redownload").classList.add("disabled");
    }
}


function clearDownloadItems() {
    var toClear = [];
    downloadItems.forEach(downloadItem => {
        var erasePromise = browser.downloads.erase({
            id: downloadItem.id,
            url: downloadItem.url,
            filename: downloadItem.filename,
            state: downloadItem.state
        });
        toClear.push(erasePromise);
    });
    Promise.all(toClear).then(values => {
        clearPopup();
    });
}

function reDownloadFailedItems() {
    var toDownload = [];
    downloadItems.forEach(downloadItem => {
        if (downloadItem.state == 'interrupted') {
            var fileName = getFileName(downloadItem.filename);
            var downloadPromise = browser.downloads.download({
                url: downloadItem.url,
                filename: fileName
            });
            toDownload.push(downloadPromise);
        }
    });
    Promise.all(toDownload).then(values => {
        clearDownloadItems();
    });
}

function showDownloads(downloadType) {
    clearPopup();
    var initDownloadsPromise;
    var downloadItemsPromise = getDownloadItems(downloadType);
    downloadItemsPromise.then(downloadItems => {
        initializeDownloads(downloadItems);
    });
}

function getDownloadItems(downloadType) {
    var searchingResult;
    searchingResult = browser.downloads.search({
        state: downloadType
    });
    searchingResult.then((result) => {
        downloadItems = result;
        filter = downloadType;
    });
    return searchingResult;
}

getCurrPlatform();

document.querySelector("#redownload").addEventListener("click", reDownloadFailedItems);
document.querySelector("#clear").addEventListener("click", clearDownloadItems);


document.querySelector("#downloadsFailed").addEventListener("click", function () { showDownloads("interrupted"); }, false);
document.querySelector("#downloadsInprogress").addEventListener("click", function () { showDownloads("in_progress"); }, false);
document.querySelector("#downloadsComplete").addEventListener("click", function () { showDownloads("complete"); }, false);
