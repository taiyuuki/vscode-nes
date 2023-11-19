const WIDTH = 256
const HEIGHT = 240
let animationframeID
let framebuffer_u8 = {}
let framebuffer_u32 = {}
let canvas_ctx = {}

function onFrame(framebuffer_24) {
  let i = 0
  for (let y = 0; y < HEIGHT; ++y) {
    for (let x = 0; x < WIDTH; ++x) {
      i = (y * 256) + x
      framebuffer_u32[i] = 0xff000000 | framebuffer_24[i] // Full alpha
    }
  }

  if (cheat.enable) {
    cheat.onFrame()
  }
}

function animationFram(cvs) {
  canvas_ctx = cvs.getContext('2d')
  const image = canvas_ctx.getImageData(0, 0, WIDTH, HEIGHT)
  canvas_ctx.fillStyle = 'black'
  canvas_ctx.fillRect(0, 0, WIDTH, HEIGHT)
  const buffer = new ArrayBuffer(image.data.length)
  framebuffer_u8 = new Uint8ClampedArray(buffer)
  framebuffer_u32 = new Uint32Array(buffer)
  cancelAnimationFrame(animationframeID)
  animationframeID = requestAnimationFrame(onAnimationFrame)

  function onAnimationFrame() {
    cancelAnimationFrame(animationframeID)
    animationframeID = requestAnimationFrame(onAnimationFrame)
    image.data.set(framebuffer_u8)
    canvas_ctx.putImageData(image, 0, 0)
  }
}

function fitInParent(cvs) {
  const parent = cvs.parentNode
  const parentWidth = parent.clientWidth
  const parentHeight = parent.clientHeight
  const parentRatio = parentWidth / parentHeight
  const desiredRatio = WIDTH / HEIGHT
  if (desiredRatio < parentRatio) {
    cvs.style.height = `${parentHeight}px`
    cvs.style.width = `${Math.round(parentHeight + desiredRatio)}px`
  }
  else {
    cvs.style.width = `${parentWidth}px`
    cvs.style.height = `${Math.round(parentWidth / desiredRatio)}px`
  }
}

function animationStop() {
  cancelAnimationFrame(animationframeID)
}