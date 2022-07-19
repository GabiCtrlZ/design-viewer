const OVERLAY_ID = 'design-viewer-overlay-element'
let isDesignerView = false
let isOpacityLow = false

const createNewBackgroundOverlay = (objectUrl, height) => {
  const backgroundImageUrl = `url(${objectUrl})`
  const existingOverlay = document.getElementById(OVERLAY_ID)
  if (existingOverlay) {
    existingOverlay.style.backgroundImage = backgroundImageUrl
    return
  }

  const overlay = document.createElement('div')
  overlay.style.backgroundImage = backgroundImageUrl
  overlay.style.width = '0'
  overlay.style.height = `max(${height}px, 100vh)`
  overlay.style.position = 'absolute'
  overlay.style.left = '0'
  overlay.style.top = '0'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '2147483647'
  overlay.id = OVERLAY_ID
  document.body.appendChild(overlay)
}

const changeOpacity = () => {
  const existingOverlay = document.getElementById(OVERLAY_ID)
  if (existingOverlay) {
    existingOverlay.style.opacity = isOpacityLow ? '100%' : '50%'
    isOpacityLow = !isOpacityLow
  }
}

const updateDisplay = (event) => {
  if (!isDesignerView) return mouseLeave()

  const existingOverlay = document.getElementById(OVERLAY_ID)
  if (!existingOverlay) return

  existingOverlay.style.width = `${event.pageX}px`
  existingOverlay.style.boxShadow = 'red 2px 0px 0px'
}

const mouseLeave = () => {
  const existingOverlay = document.getElementById(OVERLAY_ID)
  if (!existingOverlay) return

  existingOverlay.style.width = '0'
  existingOverlay.style.boxShadow = '0'
}

const getBlob = ({ blobAsText, mimeString, chunks }) => {
  let _chunkIndex = 0
  let mergedBlob
  const _blobs = []

  if (blobAsText) {
    //new chunk received  
    _chunkIndex++

    const bytes = new Uint8Array(blobAsText.length)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = blobAsText.charCodeAt(i)
    }
    // store blob
    _blobs[_chunkIndex - 1] = new Blob([bytes], { type: mimeString })

    if (_chunkIndex == chunks) {
      // merge all blob chunks
      for (let j = 0; j < _blobs.length; j++) {
        if (j > 0) {
          // append blob
          mergedBlob = new Blob([mergedBlob, _blobs[j]], { type: mimeString })
        }
        else {
          mergedBlob = new Blob([_blobs[j]], { type: mimeString })
        }
      }

      return mergedBlob
    }
  }
}

const handleBlob = (request) => {
  const _URL = window.URL || window.webkitURL
  const blob = getBlob(request)
  if (!blob) return

  const objectUrl = _URL.createObjectURL(blob)
  createNewBackgroundOverlay(objectUrl, request.height)
  isDesignerView = true
}

const handleCommand = (command) => {
  switch (command) {
    case 'run-foo':
      isDesignerView = !isDesignerView
      if (!isDesignerView) mouseLeave()
      else if (isDesignerView) updateDisplay()
      break
    case 'other-command':
      changeOpacity()
      break
    default:
      console.log(command)
      break
  }
}

const receiveMessage = (request, _sender, sendResponse) => {
  const { type } = request
  switch (type) {
    case 'BLOB':
      handleBlob(request)
      break
    case 'COMMAND':
      handleCommand(request.command)
      break
    default:
      break
  }

  sendResponse({ status: true })
}

const main = () => {
  chrome.runtime.onMessage.addListener(receiveMessage);

  document.addEventListener("mousemove", updateDisplay, false);
  document.addEventListener("mouseenter", updateDisplay, false);
  document.addEventListener("mouseleave", mouseLeave, false);
}

main()
