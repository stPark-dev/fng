"use client";

import { useState } from "react";
import { useMusic } from "@/lib/music-context";
import { useI18n } from "@/lib/i18n-context";

export default function FloatingMusicPlayer() {
  const { isPlaying, isMuted, toggleMute, togglePlay } = useMusic();
  const { locale } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 확장 메뉴 */}
      {isExpanded && (
        <div className="dark-box blood-border p-3 flex flex-col gap-2 animate-fade-in">
          {/* 재생/일시정지 */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 text-[#a08060] hover:text-[#e0d0b8] transition-colors p-2"
            title={isPlaying ? (locale === "ko" ? "일시정지" : "Pause") : (locale === "ko" ? "재생" : "Play")}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-xs">{isPlaying ? (locale === "ko" ? "일시정지" : "Pause") : (locale === "ko" ? "재생" : "Play")}</span>
          </button>

          {/* 음소거 */}
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 text-[#a08060] hover:text-[#e0d0b8] transition-colors p-2"
            title={isMuted ? (locale === "ko" ? "음소거 해제" : "Unmute") : (locale === "ko" ? "음소거" : "Mute")}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
            <span className="text-xs">{isMuted ? (locale === "ko" ? "음소거 해제" : "Unmute") : (locale === "ko" ? "음소거" : "Mute")}</span>
          </button>
        </div>
      )}

      {/* 메인 플로팅 버튼 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isPlaying && !isMuted
            ? "bg-[#8b0000] hover:bg-[#a01010] shadow-[0_0_20px_#8b000080]"
            : "bg-[#2a1a10] hover:bg-[#3a2a1a] border-2 border-[#4a3828]"
        }`}
        title={locale === "ko" ? "음악 컨트롤" : "Music Control"}
      >
        {isPlaying && !isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#e0d0b8] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#907050]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
