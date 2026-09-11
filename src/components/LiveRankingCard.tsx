import { Participant } from '../types';
import { Trophy, Award } from 'lucide-react';

interface LiveRankingCardProps {
  participants: Participant[];
}

export default function LiveRankingCard({ participants }: LiveRankingCardProps) {
  // Sort participants by valid record ascending
  const ranked = participants
    .filter((p) => {
      const num = parseFloat(p.time);
      return Number.isFinite(num) && num > 0;
    })
    .sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

  const p1 = ranked[0];
  const p2 = ranked[1];
  const p3 = ranked[2];

  return (
    <section className="bg-slate-900/90 border border-sky-500/20 rounded-3xl p-5 shadow-xl flex flex-col flex-1">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          실시간 순위 & 포디움
        </h2>
        <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-400/20">
          완주 {ranked.length}명
        </span>
      </div>

      {/* Podium Grid (Top 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4">
        {/* 1st Place (Center or Left) - Let's do 1st Gold */}
        <div
          id="podium-gold"
          className="bg-gradient-to-b from-amber-500/10 to-[#071420] border border-amber-400/40 rounded-2xl p-3 text-center shadow-lg relative overflow-hidden flex flex-col justify-between"
        >
          <div className="text-2xl sm:text-3xl filter drop-shadow">🥇</div>
          <div className="my-1">
            <div className="font-black text-sm sm:text-base text-white truncate" title={p1?.name}>
              {p1 ? (p1.name || `#${p1.no}`) : '-'}
            </div>
            {p1?.no && (
              <div className="text-[11px] text-amber-300 font-bold">#{p1.no}</div>
            )}
          </div>
          <div className="font-mono font-black text-amber-400 text-sm sm:text-base tabular-nums">
            {p1 ? `${parseFloat(p1.time).toFixed(3)}s` : '-'}
          </div>
        </div>

        {/* 2nd Place Silver */}
        <div
          id="podium-silver"
          className="bg-gradient-to-b from-slate-400/10 to-[#071420] border border-slate-400/30 rounded-2xl p-3 text-center shadow-lg flex flex-col justify-between"
        >
          <div className="text-2xl sm:text-3xl filter drop-shadow">🥈</div>
          <div className="my-1">
            <div className="font-black text-sm sm:text-base text-white truncate" title={p2?.name}>
              {p2 ? (p2.name || `#${p2.no}`) : '-'}
            </div>
            {p2?.no && (
              <div className="text-[11px] text-slate-300 font-bold">#{p2.no}</div>
            )}
          </div>
          <div className="font-mono font-black text-slate-300 text-sm sm:text-base tabular-nums">
            {p2 ? `${parseFloat(p2.time).toFixed(3)}s` : '-'}
          </div>
        </div>

        {/* 3rd Place Bronze */}
        <div
          id="podium-bronze"
          className="bg-gradient-to-b from-amber-800/10 to-[#071420] border border-amber-700/30 rounded-2xl p-3 text-center shadow-lg flex flex-col justify-between"
        >
          <div className="text-2xl sm:text-3xl filter drop-shadow">🥉</div>
          <div className="my-1">
            <div className="font-black text-sm sm:text-base text-white truncate" title={p3?.name}>
              {p3 ? (p3.name || `#${p3.no}`) : '-'}
            </div>
            {p3?.no && (
              <div className="text-[11px] text-amber-500 font-bold">#{p3.no}</div>
            )}
          </div>
          <div className="font-mono font-black text-amber-500 text-sm sm:text-base tabular-nums">
            {p3 ? `${parseFloat(p3.time).toFixed(3)}s` : '-'}
          </div>
        </div>
      </div>

      {/* Ranked List */}
      <div className="flex-1 flex flex-col min-h-[160px]">
        {ranked.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#071420]/60 rounded-2xl border border-slate-800">
            <Award className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold">기록이 입력되면 순위가 자동으로 표시됩니다.</p>
            <p className="text-xs text-slate-600 mt-0.5">각 레인에서 경기 후 기록 저장을 진행하세요.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {ranked.slice(0, 10).map((r, i) => (
              <div
                key={r.id}
                className={`grid grid-cols-[44px_1fr_90px] items-center p-2 rounded-xl border transition-all ${
                  i === 0
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : i === 1
                    ? 'bg-slate-400/10 border-slate-400/20'
                    : i === 2
                    ? 'bg-amber-700/10 border-amber-700/20'
                    : 'bg-[#091827] border-[#203d58] hover:border-sky-500/30'
                }`}
              >
                <div
                  className={`font-black text-center text-base ${
                    i === 0
                      ? 'text-yellow-400'
                      : i === 1
                      ? 'text-slate-300'
                      : i === 2
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }`}
                >
                  {i + 1}위
                </div>
                <div className="pl-2 flex items-center gap-1.5 overflow-hidden">
                  <span className="font-extrabold text-white text-sm truncate">{r.name || '이름 미입력'}</span>
                  <span className="text-xs text-slate-400 font-semibold shrink-0">#{r.no}</span>
                </div>
                <div className="text-right font-mono font-black text-sm text-yellow-400 tabular-nums">
                  {parseFloat(r.time).toFixed(3)}s
                </div>
              </div>
            ))}
            {ranked.length > 10 && (
              <div className="text-center text-xs text-slate-500 pt-1 font-medium">
                + 외 {ranked.length - 10}명 (전체 기록은 왼쪽 표에서 확인 가능)
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
