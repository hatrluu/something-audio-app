import WavesurferPlayer from '@wavesurfer/react'
import Region from 'wavesurfer.js/dist/plugins/regions.js';
import { useEffect, useMemo, useState } from 'react'
import { PauseCircle, PlayCircle, VolumeX, Volume2 } from 'lucide-react';
import { GenericPlugin } from 'wavesurfer.js/dist/base-plugin.js';

const Waveform = ({ audio }) => {
    const [wavesurfer, setWavesurfer] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(1);

    const onReady = (ws) => {
        setWavesurfer(ws)
        setIsPlaying(false)
    }

    const onPlayPause = () => {
        if(wavesurfer) wavesurfer.playPause()
    }

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if(wavesurfer) wavesurfer.setVolume(newVolume);
        
    };
    // Toggle mute/unmute
    const toggleMute = () => {
        if (isMuted) {
            setVolume(previousVolume);
            setIsMuted(false);
            if(wavesurfer) wavesurfer.setVolume(previousVolume);
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            setIsMuted(true);
            if(wavesurfer) wavesurfer.setVolume(0);
        }
    };
    const random = (min, max) => Math.random() * (max - min) + min
    const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`
    // const RegionPlugin = Region.create().addRegion({start: 0, end: 10, color: randomColor()})
    const regions = Region.create();
    useEffect(() => {
        if(wavesurfer)
        wavesurfer.on('decode', 
            regions.addRegion({
                start: 0,
                end: 8,
                content: 'Resize me',
                color: randomColor(),
                drag: false,
                resize: true,
              })
        )
    })
    return (
        <>
            <WavesurferPlayer
                height={100}
                waveColor="violet"
                plugins={useMemo(() => [regions],[])}
                url={audio}
                onReady={onReady}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {!wavesurfer && (<p>Loading ...</p>)}
            {wavesurfer && (<div className="flex items-center gap-10">
                <div>
                    <button onClick={onPlayPause}>
                        {isPlaying ? (<PauseCircle className="w-10 h-10 text-gray-700" />) :
                            (<PlayCircle className="w-10 h-10 text-gray-700" />)}
                    </button>
                </div>
                <div className="flex items-center gap-2 w-48">
                    <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Volume2 className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    <div className="relative w-full h-6 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                        />
                    </div>
                </div>
            </div>)}
        </>
    )
}

export default Waveform