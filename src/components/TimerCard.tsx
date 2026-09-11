import { Play, Square, RotateCcw, Flame, Timer, Check, Undo2, AlertTriangle } from 'lucide-react';
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
    btnClass: 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-900/30',
    borderClass: 'border-rose-500/40',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    activeText: 'text-rose-400',
    ringFocus: 'focus:border-rose-400 focus:ring-rose-400/20',
  },
  2: {
    label: '2번 레인',
    badge: 'LANE 2',
    themeColor: 'sky',
    btnClass: 'bg-sky-400 hover:bg-sky-300 text-slate-950 font-black shadow-sky-900/30',
    borderClass: 'border-sky-500/40',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    activeText: 'text-sky-400',
    ringFocus: 'focus:border-sky-400 focus:ring-sky-400/20',
  },
  3: {
    label: '3번 레인',
    badge: 'LANE 3',
    themeColor: 'yellow',
    btnClass: 'bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-black shadow-yellow-900/30',
    borderClass: 'border-yellow-500/40',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    activeText: 'text-yellow-400',
    ringFocus: 'focus:border-yellow-400 focus:ring-yellow-400/20',
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
  return (
    <section className="bg-slate-900/90 border border-sky-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col">
      {/* Big Display Container - Expanded Vertically for Grand Stadium UIUX */}
      <div className="bg-[#02070d] border-2 border-sky-500/30 rounded-3xl p-6 sm:p-8 lg:p-10 text-center relative overflow-hidden shadow-inner">
        {/* Subtle decorative racetrack gradient and scanlines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.12)_0%,_transparent_75%)] pointer-events-none" />
        {isRunning && (
          <div className="absolute inset-0 bg-sky-500/5 animate-pulse pointer-events-none" />
        )}

        {/* Top Status & Mode Indicator */}
        <div className="relative z-10 flex items-center justify-between gap-2 border-b border-sky-500/15 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs sm:text-sm font-black text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
              <Timer className="w-4 h-4" />
              공용 경기 스톱워치 전광판
            </span>
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <span className="hidden sm:inline">단축키:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
              SPACE
            </kbd>
            <span className="text-slate-600">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
              C
            </kbd>
            <span className="text-slate-600">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
              1·2·3
            </kbd>
          </div>
        </div>

        {/* Countdown Area Overlay / Display */}
        {countdownText && (
          <div
            id="countdown-banner"
            className="py-2 flex items-center justify-center text-5xl sm:text-7xl lg:text-8xl font-black text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] transition-all animate-pulse"
          >
            <span
              className={
                countdownText === 'GO!'
                  ? 'text-emerald-400 scale-125 animate-bounce'
                  : 'tracking-widest'
              }
            >
              {countdownText}
            </span>
          </div>
        )}

        {/* Gigantic Stopwatch Digital Display */}
        <div className="my-2 sm:my-4 flex items-baseline justify-center select-none">
          <div
            id="main-timer-digits"
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-all"
          >
            {timerDisplay}
          </div>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-sans text-sky-400 font-extrabold ml-2">
            초
          </span>
        </div>

        {/* Big Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-4 sm:mt-6 relative z-10">
          <button
            id="btn-timer-countdown"
            onClick={onRunCountdown}
            className="flex-1 min-w-[140px] py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base bg-yellow-400 text-yellow-950 hover:bg-yellow-300 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/20 cursor-pointer"
            title="3·2·1 카운트다운 효과음 후 자동 출발 (단축키 C)"
          >
            <Flame className="w-5 h-5 text-yellow-900 fill-yellow-900" />
            3·2·1 GO!
          </button>

          {!isRunning ? (
            <button
              id="btn-timer-start"
              onClick={onStartTimer}
              className="flex-1 min-w-[130px] py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
              title="스톱워치 시작 (단축키 스페이스바)"
            >
              <Play className="w-5 h-5 fill-current" />
              START
            </button>
          ) : (
            <button
              id="btn-timer-stop"
              onClick={onStopTimer}
              className="flex-1 min-w-[130px] py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 cursor-pointer animate-pulse"
              title="스톱워치 정지 (단축키 스페이스바)"
            >
              <Square className="w-5 h-5 fill-current" />
              STOP
            </button>
          )}

          <button
            id="btn-timer-reset"
            onClick={onResetTimer}
            className="py-3.5 px-4 sm:px-5 rounded-2xl font-black text-sm sm:text-base bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shadow"
            title="타이머 0.000초 리셋 (단축키 R)"
          >
            <RotateCcw className="w-5 h-5" />
            RESET
          </button>
        </div>
      </div>

      {/* 3-Lane Real-time Time Lapse (Split Lap) Recording Section */}
      <div className="mt-5 pt-4 border-t border-sky-500/20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>⏱️ 3레인 동시 타임랩스 (스플릿 랩타임)</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            경기자가 결승선을 통과할 때 레인 버튼(또는 키 1·2·3)을 누르면 당시 시간이 즉시 기록됩니다!
          </span>
        </div>

        {/* 3 Lane Time-Lapse Rows */}
        <div className="space-y-3">
          {([1, 2, 3] as LaneNumber[]).map((lane) => {
            const meta = LANE_META[lane];
            const participantId = lanes[lane];
            const participant = participants.find((p) => p.id === participantId);
            const recordedLap = lapTimes[lane];

            return (
              <div
                key={lane}
                id={`timelapse-row-lane-${lane}`}
                className={`p-3 sm:p-3.5 rounded-2xl bg-[#071422]/90 border ${meta.borderClass} shadow-md transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}
              >
                {/* Left: Button to capture lap time */}
                <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                  <button
                    id={`btn-lap-lane-${lane}`}
                    onClick={() => onRecordLap(lane)}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow ${meta.btnClass}`}
                    title={`클릭하면 현재 타이머 시간(${timerDisplay}초)이 즉시 1번 레인 기록으로 입력됩니다 (단축키 ${lane})`}
                  >
                    <Timer className="w-4 h-4" />
                    <span>{meta.label} 랩타임 찍기 ({lane})</span>
                  </button>

                  {/* Racer Name & Car Badge */}
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-300 truncate flex items-center gap-1.5">
                      {participant ? (
                        <>
                          <span className={`font-black ${meta.activeText}`}>
                            #{participant.no}
                          </span>
                          <span className="text-white font-extrabold truncate">
                            {participant.name || '이름 미입력'}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70" />
                          레인 미배정
                        </span>
                      )}
                    </div>
                    {participant?.carName && (
                      <div className="text-[11px] text-sky-300/80 font-medium truncate">
                        🏎️ {participant.carName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: The Captured Time Value & Direct Input */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#030b14] border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-inner">
                    <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
                      당시 기록:
                    </span>
                    <div className="relative w-28 sm:w-32">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={recordedLap || ''}
                        onChange={(e) => onUpdateLapTime(lane, e.target.value)}
                        className={`w-full bg-transparent font-mono font-black text-base text-right text-yellow-400 focus:outline-none ${meta.ringFocus} rounded px-1`}
                        title="클릭하여 수동으로 랩타임 미세 조정 가능"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">초</span>
                  </div>

                  {/* Status Indicator */}
                  {recordedLap ? (
                    <div className="flex items-center gap-1">
                      <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-3.5 h-3.5" />
                        저장됨
                      </span>
                      <button
                        onClick={() => onClearLap(lane)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="이 레인의 타임랩스 기록 지우기"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold px-2">
                      대기 중
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
