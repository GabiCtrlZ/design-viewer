/* eslint-disable consistent-return */
const OVERLAY_ID = 'design-viewer-overlay-element'
let isDesignerView = false
let isOpacityLow = false
let chunkIndex = 0
let blobs = []

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

const mouseLeave = () => {
  const existingOverlay = document.getElementById(OVERLAY_ID)

  if (!existingOverlay) return

  existingOverlay.style.width = '0'
  existingOverlay.style.boxShadow = '0'
}

const updateDisplay = (event) => {
  if (!isDesignerView) return mouseLeave()

  const existingOverlay = document.getElementById(OVERLAY_ID)

  if (!existingOverlay) return

  existingOverlay.style.width = `${event.pageX + 2}px`
  existingOverlay.style.boxShadow = 'red 2px 0px 0px'
}

const getBlob = ({ blobAsText, mimeString, chunks }) => {
  if (blobAsText) {
    // new chunk received
    chunkIndex += 1

    const bytes = new Uint8Array(blobAsText.length).map((_, idx) => blobAsText.charCodeAt(idx))

    // store blob
    blobs[chunkIndex - 1] = new Blob([bytes], { type: mimeString })

    if (chunkIndex === chunks) {
      // merge all blob chunks
      const mergedBlob = blobs.reduce((acc, curr) => {
        if (acc) return new Blob([acc, curr], { type: mimeString })

        return new Blob([curr], { type: mimeString })
      }, undefined)

      blobs = []
      chunkIndex = 0

      return mergedBlob
    }
  }
}

const handleBlob = (request) => {
  const URL = window.URL || window.webkitURL
  const blob = getBlob(request)

  if (!blob) return

  const objectUrl = URL.createObjectURL(blob)

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
  chrome.runtime.onMessage.addListener(receiveMessage)

  document.addEventListener('mousemove', updateDisplay, false)
  document.addEventListener('mouseenter', updateDisplay, false)
  document.addEventListener('mouseleave', mouseLeave, false)
}

main()
