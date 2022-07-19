import { getActiveTabURL } from "./utils.js"

const sendCallback = () => {
  if (chrome.tabs.lastError) {
    console.error("could not send message to app")
  }
}

const _URL = window.URL || window.webkitURL

const fileSelector = document.getElementById('design-input')
const boinkButton = document.getElementById('boink-button')
const fileChosen = document.getElementById('file-chosen');

let file, width, height

fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files
  console.log(fileList)

  file = fileList[0]
  if (file) {
    fileChosen.textContent = file.name
    const img = new Image()
    const objectUrl = _URL.createObjectURL(file)
    img.onload = function () {
      console.log(this.width + " " + this.height)
      width = this.width
      height = this.height
      _URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  }
})

// main button
boinkButton.addEventListener('click', async () => {
  if (!file || !height || !width) return

  const activeTab = await getActiveTabURL()
  sendBlobToApp(file, activeTab.id)
  callResize()
})

const callResize = () => {
  chrome.windows.getCurrent(({ id }) => {
    const updateInfo = {
      width,
      height,
    };
    chrome.windows.update(id, updateInfo);
  });
}

function sendBlobToApp(blob, appId) {
  const fr = new FileReader()
  const CHUNK_SIZE = 256 * 1024
  const remainder = blob.size % CHUNK_SIZE

  let start = 0
  let stop = CHUNK_SIZE
  let chunks = Math.floor(blob.size / CHUNK_SIZE)
  let chunkIndex = 0
  if (remainder != 0) chunks = chunks + 1

  fr.onload = () => {
    const message = {
      type: 'BLOB',
      blobAsText: fr.result,
      mimeString: blob.type,
      width,
      height,
      chunks,
    }
    chrome.tabs.sendMessage(appId, message, sendCallback)

    // read the next chunk of bytes
    processChunk()
  }
  fr.onerror = () => console.error("An error ocurred while reading file")
  processChunk()

  function processChunk() {
    chunkIndex++

    // exit if there are no more chunks
    if (chunkIndex > chunks) {
      return
    }

    if (chunkIndex == chunks && remainder != 0) {
      stop = start + remainder
    }

    const blobChunk = blob.slice(start, stop)

    // prepare for next chunk
    start = stop
    stop = stop + CHUNK_SIZE

    // convert chunk as binary string
    fr.readAsBinaryString(blobChunk)
  }
}
