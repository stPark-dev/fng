"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  togglePlay: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 오디오 객체는 한 번만 생성
    if (!audioRef.current) {
      const audio = new Audio("/sound/Ancient_City.ogg.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;

      // 재생 상태 추적
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
    }

    return () => {
      // cleanup은 앱 전체가 언마운트될 때만
    };
  }, []);

  // 첫 사용자 인터랙션 시 재생 시도
  useEffect(() => {
    if (isInitialized) return;

    const handleFirstInteraction = () => {
      if (audioRef.current && !isInitialized) {
        audioRef.current.play().catch(() => {});
        setIsInitialized(true);
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isInitialized]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <MusicContext.Provider value={{ isPlaying, isMuted, toggleMute, togglePlay }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
