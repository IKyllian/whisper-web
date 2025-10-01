function padTime(time: number) {
    return String(time).padStart(2, "0");
}

export function formatAudioTimestamp(time: number) {
    const hours = (time / (60 * 60)) | 0;
    time -= hours * (60 * 60);
    const minutes = (time / 60) | 0;
    time -= minutes * 60;
    const seconds = time | 0;
    return `${hours ? padTime(hours) + ":" : ""}${padTime(minutes)}:${padTime(
        seconds,
    )}`;
}

export function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // RIFF identifier 'RIFF'
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true) // file length
  writeString(view, 8, 'WAVE') // RIFF type

  // format chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // format (1 = PCM)
  view.setUint16(22, 1, true) // channels
  view.setUint32(24, sampleRate, true) // sample rate
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // write PCM samples
  floatTo16BitPCM(view, 44, samples)

  return new Blob([view], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]))
    s = s < 0 ? s * 0x8000 : s * 0x7FFF
    view.setInt16(offset, s, true)
  }
}
