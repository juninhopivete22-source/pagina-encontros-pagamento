'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Camera,
  Settings,
  MessageCircle,
  Heart
} from 'lucide-react';

interface VideoCallComponentProps {
  isOpen: boolean;
  onClose: () => void;
  participant: {
    id: string;
    name: string;
    image: string;
  };
}

export default function VideoCallComponent({ isOpen, onClose, participant }: VideoCallComponentProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Simula conexão da chamada
      const connectTimer = setTimeout(() => {
        setCallStatus('connected');
        startCallTimer();
      }, 3000);

      // Inicia captura de vídeo local
      startLocalVideo();

      return () => {
        clearTimeout(connectTimer);
        stopLocalVideo();
      };
    }
  }, [isOpen]);

  const startCallTimer = () => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  };

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const stopLocalVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    stopLocalVideo();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-black/50 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={participant.image} />
                <AvatarFallback>{participant.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{participant.name}</h3>
                <p className="text-sm text-gray-300">
                  {callStatus === 'connecting' && 'Conectando...'}
                  {callStatus === 'connected' && formatDuration(callDuration)}
                  {callStatus === 'ended' && 'Chamada encerrada'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                callStatus === 'connected' ? 'bg-green-500' : 
                callStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">
                {callStatus === 'connected' ? 'Conectado' : 
                 callStatus === 'connecting' ? 'Conectando' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative">
            {/* Remote Video (Main) */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              {callStatus === 'connected' ? (
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="text-center text-white">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={participant.image} />
                    <AvatarFallback className="text-4xl">{participant.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-xl font-semibold">{participant.name}</p>
                  <p className="text-gray-400">
                    {callStatus === 'connecting' ? 'Conectando...' : 'Chamada encerrada'}
                  </p>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white/20">
              {isVideoEnabled ? (
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                  <VideoOff className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-4 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-full w-12 h-12 ${
                    isVideoEnabled ? 'text-white hover:bg-white/20' : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-full w-12 h-12 ${
                    isAudioEnabled ? 'text-white hover:bg-white/20' : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full w-12 h-12 text-white hover:bg-white/20"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full w-12 h-12 text-white hover:bg-white/20"
                >
                  <Heart className="h-5 w-5" />
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
                  onClick={endCall}
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Connection Quality Indicator */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-green-500 rounded"></div>
                <div className="w-1 h-3 bg-green-500 rounded"></div>
                <div className="w-1 h-3 bg-green-500 rounded"></div>
                <div className="w-1 h-3 bg-gray-500 rounded"></div>
              </div>
              <span>Boa qualidade</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}