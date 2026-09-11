import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Trophy, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  roundTitle: string;
  onUpdateRoundTitle: (title: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLoadDemoData: () => void;
}

export default function Header({
  roundTitle,
  onUpdateRoundTitle,
  soundEnabled,
  onToggleSound,
  onLoadDemoData,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(roundTitle);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ko-KR', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateRoundTitle(tempTitle.trim());
    } else {
      setTempTitle(roundTitle);
    }
  };

  return (
    <header className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sky-500/20 pb-4">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-bold tracking-wider uppercase">
            <Trophy className="w-3.5 h-3.5" /> MINI 4WD TOURNAMENT
          </div>
          <button
            id="btn-quick-sample"
            onClick={onLoadDemoData}
            className="text-xs text-sky-300/80 hover:text-sky-200 flex items-center gap-1 hover:underline transition-colors cursor-pointer"
            title="테스트용 예시 참가자 명단 불러오기"
          >
            <Sparkles className="w-3 h-3" /> 샘플 데이터
          </button>
        </div>

        <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-2">
          <span>🏁 미니카 3레인 스피드 챌린지</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base font-medium">
          한 경기당 3명 동시 출전 · 기록 입력 시 전체 순위 자동 반영
        </p>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-5">
        {/* Round & Clock */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="bg-slate-900/90 text-yellow-400 font-extrabold text-lg px-2 py-0.5 rounded border border-yellow-400/50 w-36 text-right"
              />
            ) : (
              <button
                onClick={() => {
                  setTempTitle(roundTitle);
                  setIsEditingTitle(true);
                }}
                className="text-yellow-400 font-black text-xl hover:text-yellow-300 transition-colors cursor-pointer"
                title="클릭하여 회차명 수정"
              >
                {roundTitle} ✎
              </button>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-slate-100 flex items-center justify-end gap-1.5 tabular-nums">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>{currentTime || '00:00:00'}</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 hover:bg-sky-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title={soundEnabled ? '효과음 켜짐' : '효과음 음소거'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? '전체화면 종료 (ESC)' : '전광판 전체화면 (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
