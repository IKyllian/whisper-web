import { useState } from 'react'
import { usePhono } from '../hooks/usePhono'
import { clearSentencePunctuation } from '../utils/phono'
import { useToAudio } from '../hooks/useToAudio'

const LANGUAGE_MAP: Record<string, string> = {
  "fr": "fra",
  "es": "spa",
  "en": "eng"
}

const Phono = () => {
  const {
    transcription,
    alignment,
    score,
    isRecording,
    isLoading: isPhonoLoading,
    startRecording,
    stopRecording
  } = usePhono()

  const { generateAudio, isLoading: isAudioLoading, error, audioResult, audioRef } = useToAudio()
  const [targetText, setTargetText] = useState("")
  const [language, setLanguage] = useState("en")
  const [withPunctuation, setWithPunctuation] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟'
    if (score >= 70) return '👍'
    return '💪'
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🗣️ Vérification de prononciation</h2>

      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Paramètres</h3>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
            <select
              onChange={(e) => setLanguage(e.target.value)}
              value={language}
              className="w-full sm:w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">Anglais</option>
              <option value="fr">Français</option>
              <option value="es">Espagnol</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withPunctuation}
              onChange={() => setWithPunctuation((prev) => !prev)}
              className="form-checkbox text-blue-600"
            />
            Inclure la ponctuation
          </label>
        </div>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          🎧 Génération audio depuis le texte
        </h3>

        <textarea
          placeholder="Entrez votre phrase cible ici..."
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          className="w-full p-3 border rounded-md shadow-sm resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          disabled={targetText.trim().length <= 0 || isAudioLoading}
          onClick={() =>
            generateAudio({ text: targetText, language: LANGUAGE_MAP[language] })
          }
          className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-semibold transition ${isAudioLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAudioLoading ? '🔄 Génération en cours...' : '🎤 Générer Audio'}
        </button>

        {error && (
          <div className="text-red-600 font-medium">
            ❌ Erreur : {error}
          </div>
        )}

        {audioResult && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-md shadow-inner flex flex-col sm:flex-row items-center gap-4">
            <div className="text-3xl">🔊</div>
            <div className="flex-1">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Aperçu audio généré :</h4>
              <audio
                ref={audioRef}
                controls
                className="w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          🎙️ Vérification de votre prononciation
        </h3>

        <button
          disabled={targetText.trim().length <= 0}
          onClick={() =>
            isRecording
              ? stopRecording()
              : startRecording({ targetText, language, withPunctuation })
          }
          className={`px-4 py-2 rounded-md font-semibold text-white transition ${isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? '🛑 Stop' : '🎤 Start Recording'}
        </button>

        {isPhonoLoading && (
          <div className="mt-4 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Transcription en cours...
            </p>
          </div>
        )}

        {!isPhonoLoading && transcription && score !== null && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Score de précision</h3>
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {score}% {getScoreEmoji(score)}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${score >= 90
                      ? 'bg-green-500'
                      : score >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold mb-2">📝 Transcription :</h3>
              <p className="mb-4 text-gray-800 whitespace-pre-line italic">
                "{withPunctuation ? transcription : clearSentencePunctuation(transcription)}"
              </p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm border-2">
              <h3 className="text-lg font-semibold mb-3">Analyse détaillée :</h3>
              <div className="flex flex-wrap gap-2">
                {alignment.map((op, i) => {
                  if (op.type === 'correct') {
                    return (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border-2 border-green-300"
                      >
                        ✓ {op.expected}
                      </span>
                    )
                  } else if (op.type === 'wrong') {
                    return (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-red-100 text-red-800 border-2 border-red-300"
                        title={`Attendu: "${op.expected}" | Obtenu: "${op.got}"`}
                      >
                        ✗ {op.expected} → {op.got}
                      </span>
                    )
                  } else if (op.type === 'missing') {
                    return (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 border-2 border-orange-300"
                        title="Mot manquant"
                      >
                        ⊘ {op.expected}
                      </span>
                    )
                  } else if (op.type === 'extra') {
                    return (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border-2 border-purple-300"
                        title="Mot en trop"
                      >
                        + {op.got}
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-green-300"></span>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-red-300"></span>
                  <span>Incorrect (mot substitué)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-orange-300"></span>
                  <span>Manquant (mot oublié)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-purple-300"></span>
                  <span>Extra (mot en trop)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

export default Phono