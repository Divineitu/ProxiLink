import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const Call = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type = 'voice', vendorName = 'Vendor', vendorId } = location.state || {};
  
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    // Simulate connecting
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      toast.success(`Connected to ${vendorName}`);
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, [vendorName]);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    setCallStatus('ended');
    toast.success('Call ended');
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                {vendorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold mb-2">{vendorName}</h2>
            {callStatus === 'connecting' && (
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <span className="inline-block animate-pulse">●</span>
                Connecting...
              </p>
            )}
            {callStatus === 'connected' && (
              <p className="text-primary font-medium">{formatDuration(duration)}</p>
            )}
            {callStatus === 'ended' && (
              <p className="text-muted-foreground">Call Ended</p>
            )}
          </div>

          {/* Video Placeholder (for video calls) */}
          {type === 'video' && isVideoEnabled && (
            <div className="mb-6 bg-muted rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Video preview</p>
              </div>
            </div>
          )}

          {/* Call Status Animation */}
          {callStatus === 'connecting' && (
            <div className="flex justify-center mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex justify-center gap-4 mb-4">
            {/* Mute/Unmute */}
            <Button
              size="icon"
              variant={isMuted ? 'destructive' : 'secondary'}
              className="h-14 w-14 rounded-full"
              onClick={() => {
                setIsMuted(!isMuted);
                toast.success(isMuted ? 'Microphone on' : 'Microphone muted');
              }}
              disabled={callStatus !== 'connected'}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* Video Toggle (for video calls) */}
            {type === 'video' && (
              <Button
                size="icon"
                variant={isVideoEnabled ? 'secondary' : 'destructive'}
                className="h-14 w-14 rounded-full"
                onClick={() => {
                  setIsVideoEnabled(!isVideoEnabled);
                  toast.success(isVideoEnabled ? 'Video off' : 'Video on');
                }}
                disabled={callStatus !== 'connected'}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}

            {/* Speaker Toggle */}
            <Button
              size="icon"
              variant={isSpeakerOn ? 'secondary' : 'outline'}
              className="h-14 w-14 rounded-full"
              onClick={() => {
                setIsSpeakerOn(!isSpeakerOn);
                toast.success(isSpeakerOn ? 'Speaker off' : 'Speaker on');
              }}
              disabled={callStatus !== 'connected'}
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </Button>

            {/* End Call */}
            <Button
              size="icon"
              variant="destructive"
              className="h-16 w-16 rounded-full"
              onClick={endCall}
              disabled={callStatus === 'ended'}
            >
              <PhoneOff className="h-7 w-7" />
            </Button>
          </div>

          {/* Call Type Badge */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
              {type === 'video' ? (
                <>
                  <Video className="h-4 w-4" />
                  Video Call
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Voice Call
                </>
              )}
            </span>
          </div>

          {/* Info Text */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            This is a demo call interface. In production, this would use WebRTC for real-time communication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Call;
