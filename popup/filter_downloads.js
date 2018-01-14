
var downloadItemsFiltered = [];
var extensionTab = document.getElementById('download-entry');

/*
Callback from getFileIcon.
Initialize the displayed icon.
*/
function updateIconUrl(iconUrl) {
  let downloadIcon = document.createElement("img");
  downloadIcon.setAttribute("src", iconUrl);
  return downloadIcon;
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function reDownload() {
  downloadItemsFiltered.forEach(failedDownloadItem => {
    var fileName = getFileName(failedDownloadItem.filename);
    browser.downloads.download(
      {
        url: failedDownloadItem.url,
        filename: fileName
      }
    );
    browser.downloads.erase(
      {
        id: failedDownloadItem.id
      }
    );
  });
}

function clearDownloadItems() {
  downloadItemsFiltered.forEach(downloadItem => {
    browser.downloads.erase({
      id: downloadItem.id
    });
  });
  initializeLatestDownload(false);
}

function getFileName(path,filename) {
  var filenameArr;
  var gettingInfo = browser.runtime.getPlatformInfo();
  var platform;
  gettingInfo.then(info => { 
    console.log(info);
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
    console.log(filename);
  });
  return gettingInfo;
}
/*
If there was a download item,
- remember its ID as latestDownloadId
- initialize the displayed icon using getFileIcon
- initialize the displayed URL 
If there wasn't a download item, disable the "open" and "remove" buttons.
*/
function initializeLatestDownload(isFailed) {
  extensionTab.textContent = ""
  var i = 0;
  if (downloadItemsFiltered.length > 0) {
    for (let index = 0; index < downloadItemsFiltered.length; index++) {
      const downloadItem = downloadItemsFiltered[index];
      //Add icon
      var gettingIconUrl = browser.downloads.getFileIcon(downloadItem.id);
      var imgEl = gettingIconUrl.then(updateIconUrl, onError);
      ///////////////////////////////////////////////////////////////////////
      let downloadName = document.createElement("li");

      var fileName;
      var filenameProm = getFileName(downloadItem.filename, fileName);
      var updateView = Promise.resolve(function(){
        let content = document.createTextNode(fileName);
        //downloadName.appendChild(imgEl);
        downloadName.appendChild(content);
        extensionTab.appendChild(downloadName);
      });
      Promise.all([filenameProm,updateView]);
    }
    document.querySelector("#clear").classList.remove("disabled");
    if(isFailed){
      document.querySelector("#redownload").classList.remove("disabled");
    }
  } else {
    extensionTab.textContent = "No downloaded items found."
    document.querySelector("#clear").classList.add("disabled");
    document.querySelector("#redownload").classList.add("disabled");
  }
}

function getFailDownloadItems(){
  var searchingResult;
  searchingResult = browser.downloads.search({
    state: "interrupted"
  });
  searchingResult.then((result) => {
    downloadItemsFiltered = result;
    initializeLatestDownload(true);
  });
}

function getInProgressDownloadItems() {
  var searchingResult;
  searchingResult = browser.downloads.search({
    state: "in_progress"
  });
  searchingResult.then((result) => {
    downloadItemsFiltered = result;
    initializeLatestDownload(false);
  });
}

function getCompleteDownloadItems() {
  var searchingResult;
  searchingResult = browser.downloads.search({
    state: "complete"
  });
  searchingResult.then((result) => {
    downloadItemsFiltered = result;
    initializeLatestDownload(false);
  });
}

document.querySelector("#redownload").addEventListener("click", reDownload);
document.querySelector("#clear").addEventListener("click", clearDownloadItems);


document.querySelector("#downloadsFailed").addEventListener("click", getFailDownloadItems);
document.querySelector("#downloadsInprogress").addEventListener("click", getInProgressDownloadItems);
document.querySelector("#downloadsComplete").addEventListener("click", getCompleteDownloadItems);


// var buttonDownloadsFailed = document.getElementById('downloadsFailed');
// var buttonDownloadsInprogress = document.getElementById('downloadsInprogress');
// var buttonDownloadsComplete = document.getElementById('downloadsComplete');

// buttonDownloadsFailed.onclick = getDownloadItemsTest("failed");
// buttonDownloadsInprogress.onclick = getDownloadItemsTest("inprogress");
// buttonDownloadsComplete.onclick = getDownloadItemsTest("complete");