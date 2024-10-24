import { Loader2, PauseCircle, PlayCircle, Upload, Volume2, VolumeX, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const UnifiedInputDropzone = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [trimmedAudioUrl, setTrimmedAudioUrl] = useState('');
    const [volume, setVolume] = useState(1);
    const [previousVolume, setPreviousVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragOut = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        handleFileSelection(droppedFile);
    }, []);

    const handleFileSelection = (selectedFile) => {
        if (selectedFile && selectedFile.type === 'audio/mpeg') {
            setFile(selectedFile);

            // Clean up previous URL if it exists
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            // Create new URL for audio playback
            const url = URL.createObjectURL(selectedFile);
            setAudioUrl(url);

            // Reset trim values
            setStartTime(0);
            setEndTime(0);
            setCurrentTime(0);
            setIsPlaying(false);
        } else {
            alert('Please upload MP3 files only');
        }
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files[0];
        handleFileSelection(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        setAudioUrl('');
        setIsPlaying(false);
        setDuration(0);
        setCurrentTime(0);
        setStartTime(0);
        setEndTime(0);
    };

    // Audio control
    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.currentTime = startTime;
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);

            // Stop playback if we reach the end time
            if (endTime && audioRef.current.currentTime >= endTime) {
                audioRef.current.pause();
                audioRef.current.currentTime = startTime;
                setIsPlaying(false);
            }
        }
    };
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    // Toggle mute/unmute
    const toggleMute = () => {
        if (isMuted) {
            setVolume(previousVolume);
            setIsMuted(false);
            if (audioRef.current) {
                audioRef.current.volume = previousVolume;
            }
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            setIsMuted(true);
            if (audioRef.current) {
                audioRef.current.volume = 0;
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setEndTime(audioRef.current.duration);
        }
    };

    const handleTrim = async () => {
        if (!file) return;

        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('audio', file);
            formData.append('startTime', startTime.toString());
            formData.append('endTime', endTime.toString());

            const response = await fetch('/api/trim-audio', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Trimming failed');
            }

            const blob = await response.blob();
            const trimmedUrl = URL.createObjectURL(blob);

            // Cleanup old trimmed URL if it exists
            if (trimmedAudioUrl) {
                URL.revokeObjectURL(trimmedAudioUrl);
            }

            setTrimmedAudioUrl(trimmedUrl);
        } catch (error) {
            console.error('Error trimming audio:', error);
            alert('Failed to trim audio. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };
    // Handle seek
    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (trimmedAudioUrl) URL.revokeObjectURL(trimmedAudioUrl);
        };
    }, [audioUrl, trimmedAudioUrl]);
    // Update audio volume when component mounts
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    relative 
                    border-2 
                    rounded-lg 
                    transition-all 
                    duration-200
                    min-h-[56px]
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${isFocused ? 'border-blue-500 ring-2 ring-blue-200' : ''}
                    ${file ? 'border-solid' : 'border-dashed'}
                    `}
            >
                <div className="flex items-center min-h-[56px] px-4 py-2 gap-3">
                    {/* Text Input */}
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400"
                        placeholder="Type your message or drop an MP3 file..."
                    />

                    {/* File Upload Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {file && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-md">
                                <span className="text-sm font-medium text-blue-600 max-w-[150px] truncate">
                                    {file.name}
                                </span>
                                <button
                                    onClick={removeFile}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
                            <input
                                type="file"
                                accept=".mp3,audio/mpeg"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                            <Upload className={`w-5 h-5 ${file ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'}`} />
                        </label>
                    </div>
                </div>

                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
                        <p className="text-blue-600 font-medium">Drop MP3 file here</p>
                    </div>
                )}
            </div>

            {/* Audio Player and Trim Controls */}
            {file && audioUrl && (
                <div className="space-y-4 p-4 border rounded-lg">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                    />
                    {/* Seek Bar */}
                    <div className="w-full flex flex-col gap-1">
                        <div className="w-full flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-12 text-right">
                                {formatTime(currentTime)}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                            />
                            <span className="text-sm text-gray-500 w-12">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        {/* Play/Pause Button and Time Display */}
                        <div>
                            <button
                                onClick={togglePlayPause}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                {isPlaying ? (
                                    <PauseCircle className="w-10 h-10 text-gray-700" />
                                ) : (
                                    <PlayCircle className="w-10 h-10 text-gray-700" />
                                )}
                            </button>
                        </div>
                        {/* Volume control */}
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
                    </div>

                    {/* Time Range Inputs */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <label className="text-sm text-gray-600 w-20">Start Time:</label>
                            <input
                                type="range"
                                min="0"
                                max={duration}
                                value={startTime}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value < endTime) {
                                        setStartTime(value);
                                        if (audioRef.current && !isPlaying) {
                                            audioRef.current.currentTime = value;
                                        }
                                    }
                                }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 w-16">{formatTime(startTime)}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-sm text-gray-600 w-20">End Time:</label>
                            <input
                                type="range"
                                min="0"
                                max={duration}
                                value={endTime}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value > startTime) {
                                        setEndTime(value);
                                    }
                                }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 w-16">{formatTime(endTime)}</span>
                        </div>
                    </div>

                    {/* Trim Button */}
                    <div className="flex items-center justify-end gap-4 mt-4">
                        <button
                            onClick={handleTrim}
                            disabled={isProcessing || startTime === endTime}
                            className={`px-4 py-2 rounded-md text-sm font-medium
                                    ${isProcessing
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'}
                            `}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                'Export Trim Audio'
                            )}
                        </button>
                    </div>

                    {/* Trimmed Audio Preview */}
                    {trimmedAudioUrl && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Trimmed Audio Preview</h3>
                            <audio controls className="w-full">
                                <source src={trimmedAudioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                            <a
                                href={trimmedAudioUrl}
                                download={`trimmed_${file.name}`}
                                className="mt-2 text-sm text-blue-500 hover:text-blue-600 inline-block"
                            >
                                Download Trimmed Audio
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Optional: Display current values */}
            {(text || file) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Current Values:</h3>
                    {text && <p className="text-sm text-gray-600">Text: {text}</p>}
                    {file && (
                        <p className="text-sm text-gray-600">
                            File: {file.name} ({Math.round(file.size / 1024)} KB)
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default UnifiedInputDropzone;