import { AudioManager } from "./components/AudioManager";
import Phono from "./components/Phono";
import TextToAudio from "./components/TextToAudio";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
    const transcriber = useTranscriber();

    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className="flex flex-col justify-center items-center">
                <div className='container flex flex-col justify-center items-center'>
                    <h1 className='text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl text-center'>
                        Whisper Web
                    </h1>
                    {/* <h2 className='mt-3 mb-5 px-4 text-center text-1xl font-semibold tracking-tight text-slate-900 sm:text-2xl'>
                        ML-powered speech recognition directly in your browser
                    </h2> */}
                    {/* <AudioManager transcriber={transcriber} />
                    <Transcript transcribedData={transcriber.output} /> */}
                    {/* <TextToAudio /> */}
                    <Phono />
                </div>
            </div>
        </div>
    );
}

export default App;
