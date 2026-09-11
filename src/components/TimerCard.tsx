import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Flame,
  Timer,
  Check,
  Undo2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Trophy,
} from 'lucide-react';
import { LaneNumber, LaneAssignments, Participant } from '../types';

interface TimerCardProps {
  timerDisplay: string;
  countdownText: string;
  isRunning: boolean;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
  onRunCountdown: () => void;
  lanes: LaneAssignments;
  participants: Participant[];
  lapTimes: Record<LaneNumber, string>;
  onRecordLap: (lane: LaneNumber) => void;
  onUpdateLapTime: (lane: LaneNumber, timeStr: string) => void;
  onClearLap: (lane: LaneNumber) => void;
}

const LANE_META = {
  1: {
    label: '1번 레인',
    badge: 'LANE 1',
    themeColor: 'rose',
    btnClass:
      'bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-950/40 border border-rose-400/40',
    cardBorder: 'border-rose-500/50 bg-rose-950/20',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
    digitalColor: 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    ringFocus: 'focus:border-rose-400 focus:ring-rose-400/30',
  },
  2: {
    label: '2번 레인',
    badge: 'LANE 2',
    themeColor: 'sky',
    btnClass:
      'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-950/40 border border-sky-300/40',
    cardBorder: 'border-sky-500/50 bg-sky-950/20',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    textColor: 'text-sky-400',
    digitalColor: 'text-sky-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    ringFocus: 'focus:border-sky-400 focus:ring-sky-400/30',
  },
  3: {
    label: '3번 레인',
    badge: 'LANE 3',
    themeColor: 'yellow',
    btnClass:
      'bg-amber-400 hover:bg-amber-300 text-amber-950 font-black shadow-lg shadow-amber-950/40 border border-amber-300/40',
    cardBorder: 'border-amber-500/50 bg-amber-950/20',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-400',
    digitalColor: 'text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]',
    ringFocus: 'focus:border-amber-400 focus:ring-amber-400/30',
  },
} as const;

export default function TimerCard({
  timerDisplay,
  countdownText,
  isRunning,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onRunCountdown,
  lanes,
  participants,
  lapTimes,
  onRecordLap,
  onUpdateLapTime,
  onClearLap,
}: TimerCardProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle browser Fullscreen API + state
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          // Fallback to CSS fullscreen
        });
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen change listener (e.g. user pressed ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut F for fullscreen toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      id="grand-timer-container"
      className={
        isFullscreen
          ? 'fixed inset-0 z-[100] bg-[#020712] p-4 sm:p-7 md:p-9 flex flex-col justify-between overflow-y-auto'
          : 'bg-slate-900/95 border border-sky-500/25 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col'
      }
    >
      {/* Stadium Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-sky-500/20 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3.5 h-3.5 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wider uppercase flex items-center gap-2">
            <Timer className="w-5 h-5 text-sky-400" />
            <span>미니카 3레인 공용 스톱워치 전광판</span>
            {isFullscreen && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-black">
                대형 전광판 전체화면 모드
              </span>
            )}
          </h2>
        </div>

        {/* Header Right: Shortcuts & Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-2">
            <span>단축키:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
              SPACE
            </kbd>
            <span>·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
              C
            </kbd>
            <span>·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
              1·2·3
            </kbd>
            <span>·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
              F
            </kbd>
          </div>

          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
              isFullscreen
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30 hover:text-white'
            }`}
            title="스톱워치 전광판 및 타임랩스 전체화면 토글 (단축키 F)"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>전체화면 나가기 (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>전광판 전체화면 (F)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Stadium Area: Left (Gigantic Overall Stopwatch) + Right (Lane 1, 2, 3 Time Lapse Recorded Times) */}
      <div
        className={`grid grid-cols-1 ${
          isFullscreen ? 'lg:grid-cols-[1.3fr_1fr]' : 'xl:grid-cols-[1.35fr_1fr]'
        } gap-4 sm:gap-6 items-stretch my-auto`}
      >
        {/* LEFT COLUMN: Gigantic Main Stopwatch Board */}
        <div
          id="main-timer-board"
          className="bg-[#02070e] border-2 border-sky-500/30 rounded-3xl p-5 sm:p-7 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[260px] sm:min-h-[320px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.15)_0%,_transparent_75%)] pointer-events-none" />
          {isRunning && (
            <div className="absolute inset-0 bg-sky-500/5 animate-pulse pointer-events-none" />
          )}

          {/* Top Status */}
          <div className="relative z-10 w-full flex items-center justify-between text-xs sm:text-sm text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5 text-sky-400 font-black tracking-widest uppercase">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {isRunning ? 'RACE RUNNING' : 'STOPPED'}
            </span>
            <span className="text-slate-400 font-mono">공용 스타디움 메인 타이머</span>
          </div>

          {/* Countdown Display overlay */}
          {countdownText ? (
            <div
              id="countdown-banner"
              className="my-auto py-4 flex items-center justify-center text-7xl sm:text-8xl md:text-9xl font-black text-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.9)] animate-pulse"
            >
              <span
                className={
                  countdownText === 'GO!'
                    ? 'text-emerald-400 scale-110 animate-bounce'
                    : 'tracking-widest'
                }
              >
                {countdownText}
              </span>
            </div>
          ) : (
            <div className="my-auto py-2 sm:py-4 flex items-baseline justify-center select-none">
              <div
                id="main-timer-digits"
                className={`font-mono font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_35px_rgba(56,189,248,0.3)] transition-all ${
                  isFullscreen
                    ? 'text-7xl sm:text-8xl md:text-9xl xl:text-[9.5rem]'
                    : 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl'
                }`}
              >
                {timerDisplay}
              </div>
              <span
                className={`font-sans text-sky-400 font-extrabold ml-2 ${
                  isFullscreen ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl lg:text-4xl'
                }`}
              >
                초
              </span>
            </div>
          )}

          <div className="relative z-10 text-[11px] sm:text-xs text-slate-400 text-center font-medium">
            3·2·1 GO 카운트다운 후 동시 스타트 • 레인 통과 시 하단 1·2·3 랩타임 버튼을 누르면 오른쪽에 즉시 찍힙니다.
          </div>
        </div>

        {/* RIGHT COLUMN: 1번, 2번, 3번 레인 타임랩스 기록 시간 전광판 */}
        <div
          id="lane-timelapse-board"
          className="bg-[#040b15]/95 border-2 border-sky-500/25 rounded-3xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-inner"
        >
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>레인별 실시간 타임랩스 기록</span>
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs text-sky-300/80 font-bold">
              스톱워치 기준 결승선 통과 시각
            </span>
          </div>

          {/* 3 Lane Recorded Time Rows */}
          <div className="space-y-2.5 flex-1 flex flex-col justify-around">
            {([1, 2, 3] as LaneNumber[]).map((lane) => {
              const meta = LANE_META[lane];
              const participantId = lanes[lane];
              const participant = participants.find((p) => p.id === participantId);
              const recordedLap = lapTimes[lane];

              return (
                <div
                  key={lane}
                  id={`timelapse-display-lane-${lane}`}
                  className={`p-3 sm:p-4 rounded-2xl border ${meta.cardBorder} transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md`}
                >
                  {/* Lane Badge & Participant Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black border uppercase tracking-wider shrink-0 ${meta.badgeClass}`}
                    >
                      {meta.badge}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-1.5">
                        {participant ? (
                          <>
                            <span className={meta.textColor}>#{participant.no}</span>
                            <span className="text-white truncate">{participant.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-500 font-medium flex items-center gap-1 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70" />
                            선수 미배정
                          </span>
                        )}
                      </div>
                      {participant?.carName && (
                        <div className="text-[11px] text-slate-400 truncate font-medium">
                          🏎️ {participant.carName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recorded Lap Time (Large Digital Stamp + Direct Adjust Input) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0">
                    <div className="flex items-center gap-2 bg-[#02060c] border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-inner">
                      <span className="text-xs font-bold text-slate-400">랩타임:</span>
                      <div className="w-24 sm:w-28 text-right">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="--.---"
                          value={recordedLap || ''}
                          onChange={(e) => onUpdateLapTime(lane, e.target.value)}
                          className={`w-full bg-transparent font-mono font-black text-lg sm:text-xl text-right focus:outline-none rounded ${
                            recordedLap
                              ? meta.digitalColor
                              : 'text-slate-500 placeholder-slate-600'
                          } ${meta.ringFocus}`}
                          title="클릭하여 랩타임 직접 수정 가능"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">초</span>
                    </div>

                    {/* Status & Undo */}
                    <div className="flex items-center gap-1 shrink-0">
                      {recordedLap ? (
                        <>
                          <span className="px-2 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black flex items-center gap-1 whitespace-nowrap">
                            <Check className="w-3 h-3" />
                            완주
                          </span>
                          <button
                            onClick={() => onClearLap(lane)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title={`${lane}번 레인 기록 취소`}
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-1 rounded-xl bg-slate-800/80 text-slate-400 text-[11px] font-semibold">
                          대기
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR: [3·2·1 GO!] [START/STOP] [RESET] 바로 옆에 [1번 랩타임] [2번 랩타임] [3번 랩타임] 나란히 배치 */}
      <div className="mt-4 pt-3.5 border-t border-sky-500/20">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {/* Group 1: Main Stopwatch Controls */}
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
            {/* 3·2·1 Countdown Button */}
            <button
              id="btn-timer-countdown"
              onClick={onRunCountdown}
              className="flex-1 min-w-[125px] py-3 sm:py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm md:text-base bg-yellow-400 text-yellow-950 hover:bg-yellow-300 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-yellow-400/20 cursor-pointer"
              title="3·2·1 카운트다운 효과음 후 자동 출발 (단축키 C)"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-900 fill-yellow-900" />
              <span>3·2·1 GO!</span>
            </button>

            {/* Start / Stop Button */}
            {!isRunning ? (
              <button
                id="btn-timer-start"
                onClick={onStartTimer}
                className="flex-1 min-w-[120px] py-3 sm:py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm md:text-base bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                title="스톱워치 시작 (단축키 스페이스바)"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>START</span>
              </button>
            ) : (
              <button
                id="btn-timer-stop"
                onClick={onStopTimer}
                className="flex-1 min-w-[120px] py-3 sm:py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm md:text-base bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-amber-500/20 cursor-pointer animate-pulse"
                title="스톱워치 정지 (단축키 스페이스바)"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>STOP</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              id="btn-timer-reset"
              onClick={onResetTimer}
              className="py-3 sm:py-3.5 px-3.5 sm:px-4 rounded-2xl font-black text-xs sm:text-sm md:text-base bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shadow"
              title="타이머 0.000초 리셋 (단축키 R)"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>RESET</span>
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-8 w-px bg-sky-500/30 mx-1" />

          {/* Group 2: Time Lapse Buttons (Immediately next to RESET button) */}
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[320px]">
            {([1, 2, 3] as LaneNumber[]).map((lane) => {
              const meta = LANE_META[lane];
              return (
                <button
                  key={lane}
                  id={`btn-lap-lane-${lane}`}
                  onClick={() => onRecordLap(lane)}
                  className={`flex-1 min-w-[100px] py-3 sm:py-3.5 px-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${meta.btnClass}`}
                  title={`${lane}번 레인 미니카가 결승선을 통과할 때 누르면 현재 타이머 시간이 즉시 찍힙니다 (단축키 ${lane})`}
                >
                  <Timer className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{meta.label} 랩 ({lane})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
