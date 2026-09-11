import { useState, useMemo } from 'react';
import { Participant, LaneNumber, LaneAssignments } from '../types';
import { Plus, Users, ArrowDownUp, Save, Download, Trash2, Search, Filter } from 'lucide-react';

interface ParticipantTableProps {
  participants: Participant[];
  lanes: LaneAssignments;
  onAddRow: () => void;
  onAssignNextThree: () => void;
  onSortByRecord: () => void;
  onSaveData: () => void;
  onDownloadCSV: () => void;
  onResetAll: () => void;
  onUpdateField: (id: string, field: keyof Participant, value: string) => void;
  onAssignLane: (id: string, lane: LaneNumber) => void;
  onDeleteRow: (id: string) => void;
}

export default function ParticipantTable({
  participants,
  lanes,
  onAddRow,
  onAssignNextThree,
  onSortByRecord,
  onSaveData,
  onDownloadCSV,
  onResetAll,
  onUpdateField,
  onAssignLane,
  onDeleteRow,
}: ParticipantTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // Compute ranks for participants with valid finish times
  const rankMap = useMemo(() => {
    const valid = participants
      .filter((p) => {
        const val = parseFloat(p.time);
        return Number.isFinite(val) && val > 0;
      })
      .sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    const map: Record<string, number> = {};
    valid.forEach((p, idx) => {
      map[p.id] = idx + 1;
    });
    return map;
  }, [participants]);

  // Which lane is each participant assigned to?
  const assignedLanes = useMemo(() => {
    const map: Record<string, LaneNumber> = {};
    if (lanes[1]) map[lanes[1]] = 1;
    if (lanes[2]) map[lanes[2]] = 2;
    if (lanes[3]) map[lanes[3]] = 3;
    return map;
  }, [lanes]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.no).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.carName && p.carName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === '전체' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [participants, searchTerm, statusFilter]);

  const totalCount = participants.length;
  const finishedCount = participants.filter((p) => p.status === '완주').length;
  const waitingCount = participants.filter((p) => p.status === '대기' || p.status === '경기대기').length;

  return (
    <section className="bg-slate-900/90 border border-sky-500/20 rounded-3xl overflow-hidden shadow-xl flex flex-col">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-[#112640]/50">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            참가자 명단 / 전체 기록
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-semibold">
              총 {totalCount}명
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-950 border border-sky-800 text-sky-300 font-semibold">
              완주 {finishedCount}명
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-800 text-amber-300 font-semibold">
              대기 {waitingCount}명
            </span>
          </div>
        </div>

        {/* Toolbar action buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            id="btn-add-participant"
            onClick={onAddRow}
            className="px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-sky-400 text-slate-950 hover:bg-sky-300 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            참가자 추가
          </button>
          <button
            id="btn-assign-next-three"
            onClick={onAssignNextThree}
            className="px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-yellow-400 text-yellow-950 hover:bg-yellow-300 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow"
            title="기록이 아직 없는 다음 3명을 1, 2, 3번 레인에 순서대로 배정"
          >
            다음 3명 자동 배정
          </button>
          <button
            id="btn-sort-records"
            onClick={onSortByRecord}
            className="px-2.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            기록순 정렬
          </button>
          <button
            id="btn-save-data"
            onClick={onSaveData}
            className="px-2.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="브라우저 저장소에 데이터 영구 저장"
          >
            <Save className="w-3.5 h-3.5" />
            저장
          </button>
          <button
            id="btn-download-csv"
            onClick={onDownloadCSV}
            className="px-2.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="Excel 및 스프레드시트 호환 CSV 파일 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            id="btn-reset-all"
            onClick={onResetAll}
            className="px-2.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="전체 명단 및 기록 초기화"
          >
            <Trash2 className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['전체', '대기', '경기대기', '경기중', '완주', '실격'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="이름 / 번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#071522] text-xs text-white border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto overflow-y-auto max-h-[52vh]">
        <table className="w-full border-collapse min-w-[760px] text-sm">
          <thead>
            <tr className="bg-[#12273e] text-slate-300 border-b border-white/10 sticky top-0 z-10 font-bold text-xs uppercase tracking-wider">
              <th className="py-2.5 px-3 text-center w-14">순위</th>
              <th className="py-2.5 px-3 text-center w-20">번호</th>
              <th className="py-2.5 px-3 text-left">참가자 이름</th>
              <th className="py-2.5 px-3 text-left w-36">미니카/모터명</th>
              <th className="py-2.5 px-3 text-center w-28">기록(초)</th>
              <th className="py-2.5 px-3 text-center w-28">상태</th>
              <th className="py-2.5 px-3 text-center w-28">레인 배정</th>
              <th className="py-2.5 px-3 text-center w-14">삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                  {participants.length === 0 ? (
                    <div>
                      <p>등록된 참가자가 없습니다.</p>
                      <button
                        onClick={onAddRow}
                        className="mt-2 text-xs text-sky-400 hover:underline cursor-pointer"
                      >
                        + 첫 번째 참가자 추가하기
                      </button>
                    </div>
                  ) : (
                    '검색 조건과 일치하는 참가자가 없습니다.'
                  )}
                </td>
              </tr>
            ) : (
              filteredParticipants.map((r) => {
                const currentRank = rankMap[r.id];
                const activeLane = assignedLanes[r.id];

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-sky-500/5 transition-colors ${
                      activeLane ? 'bg-sky-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2 px-2 text-center font-mono font-black">
                      {currentRank ? (
                        <span
                          className={`text-base ${
                            currentRank === 1
                              ? 'text-yellow-400'
                              : currentRank === 2
                              ? 'text-slate-200'
                              : currentRank === 3
                              ? 'text-amber-500'
                              : 'text-sky-300'
                          }`}
                        >
                          {currentRank}위
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Number */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={r.no}
                        onChange={(e) => onUpdateField(r.id, 'no', e.target.value)}
                        placeholder="번호"
                        className="w-full bg-[#071522] text-white border border-[#31516f] rounded-lg px-2 py-1 text-center font-bold text-sm focus:outline-none focus:border-sky-400"
                      />
                    </td>

                    {/* Name */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => onUpdateField(r.id, 'name', e.target.value)}
                        placeholder="이름 입력"
                        className="w-full bg-[#071522] text-white border border-[#31516f] rounded-lg px-2.5 py-1 font-extrabold text-sm focus:outline-none focus:border-sky-400"
                      />
                    </td>

                    {/* Mini Car Name (Optional Detail) */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={r.carName || ''}
                        onChange={(e) => onUpdateField(r.id, 'carName', e.target.value)}
                        placeholder="예: 마하프레임"
                        className="w-full bg-[#071522] text-sky-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                      />
                    </td>

                    {/* Record Time */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="0.001"
                        value={r.time}
                        onChange={(e) => onUpdateField(r.id, 'time', e.target.value)}
                        placeholder="0.000"
                        className="w-full bg-[#071522] text-yellow-400 border border-[#31516f] rounded-lg px-2 py-1 text-right font-mono font-bold text-sm focus:outline-none focus:border-sky-400"
                      />
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-2 px-2">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          onUpdateField(r.id, 'status', e.target.value as Participant['status'])
                        }
                        className={`w-full bg-[#071522] border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer ${
                          r.status === '완주'
                            ? 'text-sky-300 border-sky-500/40'
                            : r.status === '실격'
                            ? 'text-rose-400 border-rose-500/40'
                            : r.status === '경기중'
                            ? 'text-emerald-300 border-emerald-500/40'
                            : 'text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="대기">대기</option>
                        <option value="경기대기">경기대기</option>
                        <option value="경기중">경기중</option>
                        <option value="완주">완주</option>
                        <option value="실격">실격</option>
                        <option value="기권">기권</option>
                      </select>
                    </td>

                    {/* Lane Assignment Buttons */}
                    <td className="py-2 px-2">
                      <div className="flex items-center justify-center gap-1">
                        {([1, 2, 3] as LaneNumber[]).map((ln) => {
                          const isAssigned = activeLane === ln;
                          return (
                            <button
                              key={ln}
                              onClick={() => onAssignLane(r.id, ln)}
                              className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                isAssigned
                                  ? ln === 1
                                    ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300'
                                    : ln === 2
                                    ? 'bg-sky-400 text-slate-950 shadow-sm ring-2 ring-sky-200'
                                    : 'bg-yellow-400 text-amber-950 shadow-sm ring-2 ring-yellow-200'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                              }`}
                              title={`${ln}번 레인에 배정`}
                            >
                              {ln}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onDeleteRow(r.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="참가자 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
