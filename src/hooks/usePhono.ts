import { useMemo, useRef, useState } from 'react'
import { pipeline } from '@xenova/transformers'
import { alignWords, clearSentencePunctuation } from '../utils/phono'

export const usePhono = () => {
  const [transcription, setTranscription] = useState<string | null>(null)
  const [alignment, setAlignment] = useState<any[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const compareText = (expected: string, transcribed: string, withPunctuation: boolean) => {
    const expectedWords = withPunctuation
      ? expected.toLowerCase().split(/\s+/)
      : clearSentencePunctuation(expected).split(/\s+/).filter(w => w)

    const transcribedWords = withPunctuation
      ? transcribed.toLowerCase().split(/\s+/)
      : clearSentencePunctuation(transcribed).split(/\s+/).filter(w => w)

    const alignedResult = alignWords(expectedWords, transcribedWords)
    setAlignment(alignedResult)

    const correctCount = alignedResult.filter(op => op.type === 'correct').length
    const totalExpected = expectedWords.length
    const accuracyScore = totalExpected > 0 ? (correctCount / totalExpected) * 100 : 0
    setScore(Math.round(accuracyScore))
  }

  const startRecording = async ({ targetText, language, withPunctuation }: { targetText: string, language: string, withPunctuation: boolean }) => {
    setIsRecording(true)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunks.current = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      setIsLoading(true)
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
      const arrayBuffer = await audioBlob.arrayBuffer()

      const audioContext = new AudioContext({ sampleRate: 16000 })
      const decodedAudio = await audioContext.decodeAudioData(arrayBuffer)
      const float32Samples = decodedAudio.getChannelData(0)

      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny')

      const output = await transcriber(float32Samples, {
        chunk_length: 30,
        language: language,
        stride_length: 5,
        task: 'transcribe'
      })

      const text = output.text.trim()
      setTranscription(text)
      compareText(targetText, text, withPunctuation)
      setIsLoading(false)
    }

    mediaRecorder.start()
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const deps = useMemo(() => ({
    transcription,
    alignment,
    score,
    isRecording,
    isLoading,
    startRecording,
    stopRecording
  }), [transcription,
    alignment,
    score,
    isRecording,
    isLoading,
    startRecording,
    stopRecording])

  return deps
}