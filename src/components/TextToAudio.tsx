import { useForm } from "react-hook-form"
import { useToAudio } from "../hooks/useToAudio"

type FormValue = {
  text: string
  language: string
}

const TextToAudio = () => {
  const { register, handleSubmit } = useForm<FormValue>()
  const { generateAudio, isLoading, error, audioResult, audioRef } = useToAudio()

  const onSubmit = (value: FormValue) => {
    generateAudio(value)
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🗣️ Text To Speech</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <textarea
          {...register('text', { required: true })}
          placeholder="Entrez le texte à convertir en audio..."
          className="w-full p-3 border rounded-md resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          {...register('language')}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value='eng'>Anglais</option>
          <option value='fra'>Français</option>
          <option value='spa'>Espagnol</option>
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? '🔄 Génération en cours...' : '🎧 Générer Audio'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 mt-4 font-medium">
          ❌ Erreur : {error}
        </div>
      )}

      {audioResult && (
        <div className="w-full mt-6 bg-gray-50 p-4 rounded-md shadow-sm text-center">
          <h3 className="text-lg font-semibold mb-2">🎶 Audio généré :</h3>
          <audio ref={audioRef} controls className="w-full" />
        </div>
      )}
    </div>
  )
}

export default TextToAudio
