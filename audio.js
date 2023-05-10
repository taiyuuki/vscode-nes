let audio_ctx
let script_processor
let gain = 1
const AUDIO_BUFFERING = 512
const SAMPLE_COUNT = 4 * 1024
const SAMPLE_MASK = SAMPLE_COUNT - 1
const audio_samples_L = new Float32Array(SAMPLE_COUNT)
const audio_samples_R = new Float32Array(SAMPLE_COUNT)
let audio_write_cursor = 0, audio_read_cursor = 0

function ignoreSourceError(fn) {
  try {
    fn()
  } catch (error) {
    return
  }
}

function audio_remain() {
  return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK
}

function onAudioSample(left, right) {
  audio_samples_L[audio_write_cursor] = left
  audio_samples_R[audio_write_cursor] = right
  audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK
}

function getSampleRate() {
  if (!window.AudioContext) {
    return 44100
  }
  const myCtx = new window.AudioContext()
  const sampleRate = myCtx.sampleRate
  myCtx.close()
  return sampleRate
}

function audioFrame(nes) {
  audio_ctx = new AudioContext()
  audio_ctx.resume()

  script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2)
  script_processor.onaudioprocess = (event) => {
    const dst = event.outputBuffer
    const len = dst.length
    if (audio_remain() < AUDIO_BUFFERING) {
      ignoreSourceError(nes.frame)
    }
    const dst_l = dst.getChannelData(0)
    const dst_r = dst.getChannelData(1)
    for (let i = 0; i < len; i++) {
      const src_idx = (audio_read_cursor + i) & SAMPLE_MASK
      dst_l[i] = audio_samples_L[src_idx] * gain
      dst_r[i] = audio_samples_R[src_idx] * gain
    }

    audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK
  }
  script_processor.connect(audio_ctx.destination)
}

function audioStop() {
  script_processor.disconnect(audio_ctx.destination)
  script_processor.onaudioprocess = null
  script_processor = null

  if ('close' in audio_ctx) {
    audio_ctx.close()
  }
}

/**
 * 🎮: Pause
 */
function pause() {
  audio_ctx.suspend()
}

/**
 * 🎮: Play
 */
function play() {
  audio_ctx.resume()
}

function setGain(n) {
  if (n > 100) {
    n = 100
  }
  if (n < 0) {
    n = 0
  }
  gain = n / 100
}