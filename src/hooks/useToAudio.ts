import { useState, useCallback, useRef, useEffect } from 'react';
import { env, pipeline } from '@xenova/transformers';
import { encodeWAV } from '../utils/AudioUtils';

type TextToAudioResult = {
  audio: Float32Array;
  sampling_rate: number;
};

export const useToAudio = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<TextToAudioResult | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null)

  const generateAudio = useCallback(async ({ text, language }: { text: string, language?: string }) => {
    if (!text.trim()) {
      setError('Text cannot be empty');
      return;
    }

    console.info('text = ', text, language)
    setIsLoading(true);
    setError(null);
    setAudioResult(null);

    try {
      // const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {
      //   quantized: false,
      // });
      const synthesizer = await pipeline('text-to-speech', language ? `Xenova/mms-tts-${language}` : 'Xenova/speecht5_tts', {
        quantized: false,
      });

      const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';

      const result = await synthesizer(text, { speaker_embeddings });
      setAudioResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (audioResult && audioRef.current) {
      const blob = encodeWAV(audioResult.audio, audioResult.sampling_rate)
      const url = URL.createObjectURL(blob)
      audioRef.current.src = url
    }
  }, [audioResult])

  return {
    generateAudio,
    isLoading,
    error,
    audioResult,
    audioRef
  };
};