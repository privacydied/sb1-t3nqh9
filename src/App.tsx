import React, { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import WaveSurfer from 'wavesurfer.js';
import * as Tone from 'tone';
import { 
  Play, Pause, Volume2, Upload, Download,
  Mic, Music, Waves, Split, Clock, 
  FileAudio, RefreshCw, Settings
} from 'lucide-react';

const tools = [
  { id: 'voice', name: 'Voice Changer', icon: Mic },
  { id: 'enhance', name: 'Audio Enhancer', icon: Music },
  { id: 'echo', name: 'Echo Remover', icon: Waves },
  { id: 'stem', name: 'Stem Splitter', icon: Split },
  { id: 'detect', name: 'Key & BPM Finder', icon: Clock },
  { id: 'reverb', name: 'Reverb Remover', icon: RefreshCw },
  { id: 'convert', name: 'Audio Converter', icon: FileAudio },
];

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [selectedTool, setSelectedTool] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4F46E5',
        progressColor: '#818CF8',
        cursorColor: '#4F46E5',
        barWidth: 2,
        barGap: 1,
        height: 100,
        responsive: true,
      });

      return () => {
        wavesurferRef.current?.destroy();
      };
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        wavesurferRef.current?.load(url);
        
        // Initialize Tone.js player
        await Tone.start();
        playerRef.current = new Tone.Player(url).toDestination();
        
        toast.success('Audio file loaded successfully');
      } catch (error) {
        toast.error('Error loading audio file');
      }
    }
  };

  const togglePlayPause = async () => {
    if (!audioFile) return;
    
    try {
      if (isPlaying) {
        await playerRef.current?.stop();
        wavesurferRef.current?.pause();
      } else {
        await playerRef.current?.start();
        wavesurferRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      toast.error('Error playing audio');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    wavesurferRef.current?.setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume.value = Tone.gainToDb(newVolume);
    }
  };

  const processAudio = async () => {
    if (!audioFile || !selectedTool) return;
    
    setIsProcessing(true);
    try {
      // Simulated processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Audio processed successfully');
    } catch (error) {
      toast.error('Error processing audio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Voice.ai Clone</h1>
          <p className="text-gray-600">Professional Audio Processing Suite</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="flex flex-wrap gap-4 mb-8">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedTool === tool.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tool.icon size={20} />
                {tool.name}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg p-8 hover:border-indigo-500 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                  <p className="text-gray-600">Drop your audio file here or click to browse</p>
                </div>
              </div>
            </label>
          </div>

          <div ref={waveformRef} className="mb-8" />

          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              onClick={togglePlayPause}
              disabled={!audioFile}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <div className="flex items-center gap-4 flex-1 max-w-xs">
              <Volume2 size={20} className="text-gray-600" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full"
              />
            </div>

            <button
              onClick={processAudio}
              disabled={!audioFile || !selectedTool || isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Settings size={20} />
              {isProcessing ? 'Processing...' : 'Process Audio'}
            </button>

            <button
              disabled={!audioFile}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;