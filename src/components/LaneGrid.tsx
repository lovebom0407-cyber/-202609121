import { useState, useEffect } from 'react';
import { Participant, LaneNumber, LaneAssignments } from '../types';
import { Zap, XCircle, Check, Flag, UserX } from 'lucide-react';

interface LaneGridProps {
  lanes: LaneAssignments;
  participants: Participant[];
  currentTimerTime: string;
  onApplyLaneRecord: (lane: LaneNumber, recordStr: string) => void;
  onSetStatus: (participantId: string, status: Participant['status']) => void;
  onClearLane: (lane: LaneNumber) => void;
  onOpenAssignModal?: (lane: LaneNumber) => void;
}

const LANE_CONFIGS = {
  1: {
    label: '1번 레인',
    badge: 'LANE 1',
    badgeBg: 'bg-rose-500 text-white',
    borderActive: 'border-rose-500/50',
    headerColor: 'text-rose-400',
    glowColor: 'hover:shadow-rose-500/10',
  },
  2: {
    label: '2번 레인',
    badge: 'LANE 2',
    badgeBg: 'bg-sky-400 text-slate-950 font-black',
    borderActive: 'border-sky-500/50',
    headerColor: 'text-sky-400',
    glowColor: 'hover:shadow-sky-500/10',
  },
  3: {
    label: '3번 레인',
    badge: 'LANE 3',
    badgeBg: 'bg-yellow-400 text-amber-950 font-black',
    borderActive: 'border-yellow-500/50',
    headerColor: 'text-yellow-400',
    glowColor: 'hover:shadow-yellow-500/10',
  },
} as const;

export default function LaneGrid({
  lanes,
  participants,
  currentTimerTime,
  onApplyLaneRecord,
  onSetStatus,
  onClearLane,
}: LaneGridProps) {
  const [inputRecords, setInputRecords] = useState<Record<LaneNumber, string>>({
    1: '',
    2: '',
    3: '',
  });

  // Sync inputs whenever participants or assigned participant's record changes
  useEffect(() => {
    ([1, 2, 3] as LaneNumber[]).forEach((lane) => {
      const pid = lanes[lane];
      const p = participants.find((x) => x.id === pid);
      if (p && p.time) {
        setInputRecords((prev) => ({ ...prev, [lane]: p.time }));
      } else {
        setInputRecords((prev) => ({ ...prev, [lane]: '' }));
      }
    });
  }, [lanes, participants]);

  const handleInputChange = (lane: LaneNumber, val: string) => {
    setInputRecords((prev) => ({ ...prev, [lane]: val }));
  };

  const handleApply = (lane: LaneNumber) => {
    const val = inputRecords[lane].trim();
    onApplyLaneRecord(lane, val);
  };

  const handleApplyTimerDirect = (lane: LaneNumber) => {
    setInputRecords((prev) => ({ ...prev, [lane]: currentTimerTime }));
    onApplyLaneRecord(lane, currentTimerTime);
  };

  const getStatusBadge = (status: Participant['status'] | undefined) => {
    if (!status) return <span className="text-slate-500 font-semibold">대기</span>;
    switch (status) {
      case '경기중':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            경기중
          </span>
        );
      case '경기대기':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            경기대기
          </span>
        );
      case '완주':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Check className="w-3 h-3" /> 완주
          </span>
        );
      case '실격':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> 실격
          </span>
        );
      case '기권':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
            기권
          </span>
        );
      default:
        return <span className="text-slate-400 font-semibold text-xs">대기</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6">
      {([1, 2, 3] as LaneNumber[]).map((lane) => {
        const config = LANE_CONFIGS[lane];
        const participantId = lanes[lane];
        const p = participants.find((x) => x.id === participantId);

        return (
          <div
            key={lane}
            id={`lane-card-${lane}`}
            className={`relative flex flex-col justify-between rounded-3xl p-5 bg-gradient-to-b from-[#112843] to-[#0a1727] border-2 border-sky-500/20 shadow-xl transition-all ${config.glowColor}`}
          >
            {/* Lane Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Flag className={`w-5 h-5 ${config.headerColor}`} />
                <strong className={`text-2xl font-black ${config.headerColor}`}>
                  {config.label}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                {p && (
                  <button
                    onClick={() => onClearLane(lane)}
                    className="text-xs text-slate-400 hover:text-rose-300 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 transition-colors cursor-pointer"
                    title="레인 비우기"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${config.badgeBg}`}>
                  {config.badge}
                </span>
              </div>
            </div>

            {/* Player Info Box */}
            <div className="min-h-[148px] bg-[#040b13] border border-slate-700/70 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group">
              {p ? (
                <>
                  <div className="text-5xl font-black text-yellow-400 leading-none tracking-tight">
                    {p.no ? `#${p.no}` : '-'}
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black text-white truncate max-w-[90%]">
                    {p.name || '이름 미입력'}
                  </div>
                  {p.carName && (
                    <div className="text-xs text-sky-300 font-medium truncate max-w-[90%] mt-0.5">
                      🏎️ {p.carName}
                    </div>
                  )}
                  <div className="mt-2">{getStatusBadge(p.status)}</div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl text-slate-600 font-black">-</div>
                  <div className="mt-1 text-lg font-bold text-slate-400">참가자 미배정</div>
                  <div className="text-xs text-slate-500 mt-1">
                    명단에서 번호 배정 또는 [다음 3명 자동 배정]을 누르세요
                  </div>
                </div>
              )}
            </div>

            {/* Record Entry & Quick Tools */}
            <div className="mt-3.5 space-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="relative">
                  <input
                    id={`lane-${lane}-record-input`}
                    type="number"
                    step="0.001"
                    placeholder="기록(초) 예: 13.450"
                    value={inputRecords[lane]}
                    onChange={(e) => handleInputChange(lane, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApply(lane);
                    }}
                    disabled={!p}
                    className="w-full bg-[#071522] text-white border border-[#31516f] rounded-xl px-3 py-2 text-base font-bold placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  {inputRecords[lane] && (
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                      초
                    </span>
                  )}
                </div>
                <button
                  id={`lane-${lane}-btn-save`}
                  onClick={() => handleApply(lane)}
                  disabled={!p}
                  className="px-3.5 py-2 rounded-xl font-black text-sm bg-sky-400 text-slate-950 hover:bg-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  기록 저장
                </button>
              </div>

              {/* Quick actions row */}
              <div className="flex items-center justify-between gap-1.5 text-xs">
                <button
                  id={`lane-${lane}-btn-timer-apply`}
                  onClick={() => handleApplyTimerDirect(lane)}
                  disabled={!p}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="현재 타이머 측정값을 즉시 이 레인의 기록으로 저장"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>타이머 기록 적용 ({currentTimerTime}s)</span>
                </button>

                {p && p.status !== '실격' && (
                  <button
                    onClick={() => onSetStatus(p.id, '실격')}
                    className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-all cursor-pointer whitespace-nowrap"
                    title="코스아웃 또는 실격 처리"
                  >
                    실격(DQ)
                  </button>
                )}
                {p && p.status === '실격' && (
                  <button
                    onClick={() => onSetStatus(p.id, '경기대기')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold transition-all cursor-pointer whitespace-nowrap"
                    title="실격 취소"
                  >
                    복원
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
