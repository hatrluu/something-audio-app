import WavesurferPlayer from '@wavesurfer/react';
import { PauseCircle, PlayCircle, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

const Waveform = ({ audio }) => {
    const [wavesurfer, setWavesurfer] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(1);
    const [regions, setRegions] = useState([]);

    const wavesurferRef = useRef(null);
    
    const onReady = (ws) => {
        setWavesurfer(ws)
        setIsPlaying(false)
    }

    const onPlayPause = () => {
        if (wavesurfer) wavesurfer.playPause()
    }

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (wavesurfer) wavesurfer.setVolume(newVolume);

    };
    // Toggle mute/unmute
    const toggleMute = () => {
        if (isMuted) {
            setVolume(previousVolume);
            setIsMuted(false);
            if (wavesurfer) wavesurfer.setVolume(previousVolume);
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            setIsMuted(true);
            if (wavesurfer) wavesurfer.setVolume(0);
        }
    };
    const random = (min, max) => Math.random() * (max - min) + min
    const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`
    // const RegionPlugin = Region.create().addRegion({start: 0, end: 10, color: randomColor()})

    // Handle creation of new regions
    const handleRegionCreated = useCallback((region) => {
        setRegions(prev => [...prev, region]);
    }, []);

    // Handle updates to existing regions
    const handleRegionUpdated = useCallback((region) => {
        setRegions(prev =>
            prev.map(r => r.id === region.id ? region : r)
        );
    }, []);

    // Handle region deletion
    const handleRegionDeleted = useCallback((region) => {
        setRegions(prev => prev.filter(r => r.id !== region.id));
    }, []);

    // Set up region event listeners when wavesurfer is ready
    const handleWSMount = useCallback((waveSurfer) => {
        if (waveSurfer) {
            wavesurferRef.current = waveSurfer;
            waveSurfer.on('region-created', handleRegionCreated);
            waveSurfer.on('region-updated', handleRegionUpdated);
            waveSurfer.on('region-removed', handleRegionDeleted);

            // Clean up event listeners when component unmounts
            return () => {
                waveSurfer.un('region-created', handleRegionCreated);
                waveSurfer.un('region-updated', handleRegionUpdated);
                waveSurfer.un('region-removed', handleRegionDeleted);
            };
        }
    }, [handleRegionCreated, handleRegionUpdated, handleRegionDeleted]);


    const addRegion = () => {
        if (wavesurferRef.current)
            wavesurferRef.current.addRegion({
                start: 0,
                end: 8,
                color: randomColor(),
                drag: true,
                resize: true,
            })
    }
    return (
        <>
            <WavesurferPlayer
                height={100}
                waveColor="violet"
                url={audio}
                onReady={onReady}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onMount={handleWSMount}
            />

            {!wavesurfer && (<p>Loading ...</p>)}
            {wavesurfer && (<div className="flex items-center gap-10">
                <button
                    onClick={addRegion}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add Region
                </button>
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