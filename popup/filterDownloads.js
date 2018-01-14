var extensionTab = document.querySelector("#download-entry");
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

function getFileName(path,filename) {
    var filenameArr;
    var platform;
    var gettingInfo = browser.runtime.getPlatformInfo();
    gettingInfo.then(info => {
        platform = info.os
        switch (platform) {
            case "win":
                filenameArr = path.split('\\');
                break;
            default:
                filenameArr = path.split('/');
                break;
        }
        var len = filenameArr.length;
        filename = filenameArr[len - 1];
    });
    return gettingInfo;
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function clearPopup() {
    extensionTab.textContent = "";
}

function initializeDownloads(){
    if(downloadItems.length > 0){
        downloadItemsStruct = [];
        downloadItems.forEach(downloadItem => {
            var iconPromise = browser.downloads.getFileIcon(downloadItem.id);
            var filename;
            var fileNamePromise = getFileName(downloadItem.filename, filename);
            Promise.all([iconPromise,fileNamePromise]).then( values => {
                downloadItemsStruct.push(
                    { iconImgElem: values[0], fileName: filename }
                );
            });
            console.log(downloadItemsStruct);
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
    var downloadItemsPromise = getDownloadItems(downloadType);
    var initDownloadsPromise = Promise.resolve(initializeDownloads());
    Promise.all([downloadItemsPromise, initDownloadsPromise]);
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


// document.querySelector("#redownload").addEventListener("click", reDownloadItems);
document.querySelector("#clear").addEventListener("click", clearDownloadItems);


document.querySelector("#downloadsFailed").addEventListener("click", function () { showDownloads("interrupted"); }, false);
document.querySelector("#downloadsInprogress").addEventListener("click", function () { showDownloads("in_progress"); }, false);
document.querySelector("#downloadsComplete").addEventListener("click", function () { showDownloads("complete"); }, false);
