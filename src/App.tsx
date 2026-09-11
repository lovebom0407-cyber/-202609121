import { useState, useEffect, useRef, useCallback } from 'react';
import { Participant, LaneNumber, LaneAssignments } from './types';
import Header from './components/Header';
import LaneGrid from './components/LaneGrid';
import TimerCard from './components/TimerCard';
import LiveRankingCard from './components/LiveRankingCard';
import ParticipantTable from './components/ParticipantTable';
import { playCountdownBeep, playRecordSavedSound, playBuzzer, playLapRecordSound } from './utils/audio';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY_ROWS = 'miniCar3Rows_v2';
const STORAGE_KEY_LANES = 'miniCar3Lanes_v2';
const STORAGE_KEY_TITLE = 'miniCar3Title_v2';
const STORAGE_KEY_SOUND = 'miniCar3Sound_v2';

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function isValidTime(val: string | number | undefined | null): boolean {
  if (val === undefined || val === null || val === '') return false;
  const num = parseFloat(String(val));
  return Number.isFinite(num) && num > 0;
}

const SAMPLE_RACERS = [
  { no: '1', name: '김민수', carName: '마하프레임', time: '', status: '대기' as const },
  { no: '2', name: '이지훈', carName: '아반테 Mk.III', time: '', status: '대기' as const },
  { no: '3', name: '박서준', carName: '썬더샷 Jr.', time: '', status: '대기' as const },
  { no: '4', name: '최다은', carName: '매그넘 세이버', time: '', status: '대기' as const },
  { no: '5', name: '정우진', carName: '소닉 세이버', time: '', status: '대기' as const },
  { no: '6', name: '강예린', carName: '네오 트라이대거', time: '', status: '대기' as const },
  { no: '7', name: '윤하람', carName: '스핀 코브라', time: '', status: '대기' as const },
  { no: '8', name: '임도윤', carName: '버닝 썬', time: '', status: '대기' as const },
  { no: '9', name: '한소희', carName: '뱅퀴시', time: '', status: '대기' as const },
  { no: '10', name: '오세훈', carName: '프로토 세이버', time: '', status: '대기' as const },
  { no: '11', name: '배수현', carName: '슈팅 스타', time: '', status: '대기' as const },
  { no: '12', name: '송민호', carName: '대시 1호 엠페러', time: '', status: '대기' as const },
];

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [lanes, setLanes] = useState<LaneAssignments>({ 1: null, 2: null, 3: null });
  const [roundTitle, setRoundTitle] = useState('1회차 경기');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer states
  const [timerElapsed, setTimerElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [countdownText, setCountdownText] = useState<string>('');
  const [lapTimes, setLapTimes] = useState<Record<LaneNumber, string>>({
    1: '',
    2: '',
    3: '',
  });

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warn' } | null>(null);

  const timerStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 2800);
  }, []);

  // Initial Load from localStorage
  useEffect(() => {
    try {
      const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);
      if (savedTitle) setRoundTitle(savedTitle);

      const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const savedRows = localStorage.getItem(STORAGE_KEY_ROWS);
      const savedLanes = localStorage.getItem(STORAGE_KEY_LANES);

      let parsedRows: Participant[] = [];
      if (savedRows) {
        parsedRows = JSON.parse(savedRows);
      }

      if (Array.isArray(parsedRows) && parsedRows.length > 0) {
        setParticipants(parsedRows);
      } else {
        // Fallback: Initial default 12 participants as in original code
        const initial = Array.from({ length: 12 }, (_, i) => ({
          id: generateUid(),
          no: String(i + 1),
          name: '',
          carName: '',
          time: '',
          status: '대기' as const,
        }));
        setParticipants(initial);
      }

      if (savedLanes) {
        const parsedLanes = JSON.parse(savedLanes);
        if (parsedLanes && typeof parsedLanes === 'object') {
          setLanes({
            1: parsedLanes[1] || null,
            2: parsedLanes[2] || null,
            3: parsedLanes[3] || null,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load local storage data', err);
    }
  }, []);

  // Auto-persist changes quietly to LocalStorage
  useEffect(() => {
    if (participants.length > 0) {
      localStorage.setItem(STORAGE_KEY_ROWS, JSON.stringify(participants));
    }
    localStorage.setItem(STORAGE_KEY_LANES, JSON.stringify(lanes));
    localStorage.setItem(STORAGE_KEY_TITLE, roundTitle);
    localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
  }, [participants, lanes, roundTitle, soundEnabled]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Stopwatch controls
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) return;

    // Update state of participants currently placed on the 3 lanes to '경기중'
    setParticipants((prev) =>
      prev.map((p) => {
        if ((lanes[1] === p.id || lanes[2] === p.id || lanes[3] === p.id) && p.status !== '실격') {
          return { ...p, status: '경기중' };
        }
        return p;
      })
    );

    setIsRunning(true);
    timerStartRef.current = performance.now() - timerElapsed;

    timerIntervalRef.current = window.setInterval(() => {
      setTimerElapsed(performance.now() - timerStartRef.current);
    }, 10);
  }, [lanes, timerElapsed]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setTimerElapsed(0);
    setCountdownText('');
    setLapTimes({ 1: '', 2: '', 3: '' });
  }, [stopTimer]);

  const runCountdown = useCallback(() => {
    resetTimer();
    let count = 3;
    setCountdownText(String(count));
    if (soundEnabled) playCountdownBeep(count);

    countdownIntervalRef.current = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownText(String(count));
        if (soundEnabled) playCountdownBeep(count);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdownText('GO!');
        if (soundEnabled) playCountdownBeep('GO');
        startTimer();
        setTimeout(() => setCountdownText(''), 1000);
      }
    }, 1000);
  }, [resetTimer, soundEnabled, startTimer]);

  // Time lapse (Split lap) handlers
  const handleRecordLap = useCallback(
    (lane: LaneNumber) => {
      const currentSeconds = (timerElapsed / 1000).toFixed(3);
      setLapTimes((prev) => ({ ...prev, [lane]: currentSeconds }));

      if (soundEnabled) {
        playLapRecordSound();
      }

      const participantId = lanes[lane];
      if (participantId) {
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.id === participantId) {
              return { ...p, time: currentSeconds, status: '완주' };
            }
            return p;
          })
        );
        const target = participants.find((p) => p.id === participantId);
        showToast(
          `[${lane}번 레인] ${target?.name || `#${target?.no}`} 랩타임 ${currentSeconds}초 기록 완료!`,
          'success'
        );
      } else {
        showToast(`[${lane}번 레인] 랩타임 ${currentSeconds}초 캡처됨 (선수 미배정)`, 'info');
      }
    },
    [timerElapsed, soundEnabled, lanes, participants, showToast]
  );

  const handleUpdateLapTime = useCallback(
    (lane: LaneNumber, timeStr: string) => {
      setLapTimes((prev) => ({ ...prev, [lane]: timeStr }));
      const participantId = lanes[lane];
      if (participantId) {
        const hasValidTime = isValidTime(timeStr);
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.id === participantId) {
              return {
                ...p,
                time: timeStr,
                status: hasValidTime ? '완주' : timeStr === '' ? '경기중' : p.status,
              };
            }
            return p;
          })
        );
      }
    },
    [lanes]
  );

  const handleClearLap = useCallback(
    (lane: LaneNumber) => {
      setLapTimes((prev) => ({ ...prev, [lane]: '' }));
      const participantId = lanes[lane];
      if (participantId) {
        setParticipants((prev) =>
          prev.map((p) => (p.id === participantId ? { ...p, time: '', status: '경기중' } : p))
        );
        showToast(`${lane}번 레인 랩타임 기록이 초기화되었습니다.`, 'info');
      }
    },
    [lanes, showToast]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          stopTimer();
        } else {
          startTimer();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        runCountdown();
      } else if (e.key === 'r' || e.key === 'R') {
        resetTimer();
      } else if (e.key === '1') {
        handleRecordLap(1);
      } else if (e.key === '2') {
        handleRecordLap(2);
      } else if (e.key === '3') {
        handleRecordLap(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, startTimer, stopTimer, runCountdown, resetTimer, handleRecordLap]);

  // Participant actions
  const handleAddParticipant = () => {
    const nextNo = participants.length + 1;
    const newParticipant: Participant = {
      id: generateUid(),
      no: String(nextNo),
      name: '',
      carName: '',
      time: '',
      status: '대기',
    };
    setParticipants((prev) => [...prev, newParticipant]);
    showToast(`참가자 #${nextNo} 추가되었습니다.`, 'info');
  };

  const handleUpdateField = (id: string, field: keyof Participant, value: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        if (field === 'time') {
          if (isValidTime(value)) {
            updated.status = '완주';
          }
        }
        return updated;
      })
    );
  };

  const handleAssignLane = (participantId: string, targetLane: LaneNumber) => {
    setLanes((prev) => {
      const next = { ...prev };
      // Clear from any other lane first
      ([1, 2, 3] as LaneNumber[]).forEach((ln) => {
        if (next[ln] === participantId) next[ln] = null;
      });
      next[targetLane] = participantId;
      return next;
    });

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId && (p.status === '대기' || p.status === '기권')) {
          return { ...p, status: '경기대기' };
        }
        return p;
      })
    );
  };

  const handleAssignNextThree = () => {
    // Find first 3 participants who do not have a valid time and are not disqualified
    const targets = participants
      .filter((p) => !isValidTime(p.time) && p.status !== '실격' && p.status !== '기권')
      .slice(0, 3);

    if (targets.length === 0) {
      showToast('배정할 대기 참가자가 없습니다.', 'warn');
      return;
    }

    const newLanes: LaneAssignments = { 1: null, 2: null, 3: null };
    targets.forEach((p, idx) => {
      const laneNum = (idx + 1) as LaneNumber;
      newLanes[laneNum] = p.id;
    });

    setLanes(newLanes);

    const targetIds = new Set(targets.map((t) => t.id));
    setParticipants((prev) =>
      prev.map((p) => {
        if (targetIds.has(p.id)) {
          return { ...p, status: '경기대기' };
        }
        return p;
      })
    );

    showToast(`다음 ${targets.length}명 레인 배정 완료!`);
  };

  const handleClearLane = (lane: LaneNumber) => {
    setLanes((prev) => ({ ...prev, [lane]: null }));
  };

  const handleApplyLaneRecord = (lane: LaneNumber, recordStr: string) => {
    const participantId = lanes[lane];
    if (!participantId) {
      showToast(`${lane}번 레인에 참가자를 먼저 배정하세요.`, 'warn');
      return;
    }
    const val = parseFloat(recordStr);
    if (!Number.isFinite(val) || val <= 0) {
      showToast('올바른 기록(초)을 입력하세요. (예: 12.345)', 'warn');
      return;
    }

    const formattedTime = val.toFixed(3);

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return { ...p, time: formattedTime, status: '완주' };
        }
        return p;
      })
    );

    if (soundEnabled) playRecordSavedSound();

    const target = participants.find((p) => p.id === participantId);
    showToast(`[${lane}번 레인] ${target?.name || `#${target?.no}`} 기록: ${formattedTime}초 저장 완료!`);
  };

  const handleSetStatus = (participantId: string, status: Participant['status']) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return { ...p, status };
        }
        return p;
      })
    );
    if (status === '실격' && soundEnabled) {
      playBuzzer();
    }
  };

  const handleDeleteRow = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setLanes((prev) => {
      const next = { ...prev };
      ([1, 2, 3] as LaneNumber[]).forEach((k) => {
        if (next[k] === id) next[k] = null;
      });
      return next;
    });
  };

  const handleSortByRecord = () => {
    setParticipants((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const ta = isValidTime(a.time) ? parseFloat(a.time) : null;
        const tb = isValidTime(b.time) ? parseFloat(b.time) : null;
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;
        return ta - tb;
      });
      return sorted;
    });
    showToast('기록순(오름차순)으로 정렬되었습니다.');
  };

  const handleSaveData = () => {
    localStorage.setItem(STORAGE_KEY_ROWS, JSON.stringify(participants));
    localStorage.setItem(STORAGE_KEY_LANES, JSON.stringify(lanes));
    localStorage.setItem(STORAGE_KEY_TITLE, roundTitle);
    showToast('모든 대회 데이터가 안전하게 저장되었습니다.');
  };

  const handleDownloadCSV = () => {
    const valid = participants
      .filter((p) => isValidTime(p.time))
      .sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    const rankObj: Record<string, number> = {};
    valid.forEach((p, idx) => {
      rankObj[p.id] = idx + 1;
    });

    const headers = ['순위', '번호', '이름', '미니카/모터명', '기록(초)', '상태'];
    const rows = participants.map((p) => [
      rankObj[p.id] ? `${rankObj[p.id]}위` : '',
      p.no || '',
      p.name || '',
      p.carName || '',
      p.time || '',
      p.status || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // UTF-8 BOM so Excel opens Korean text cleanly
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `미니카대회_${roundTitle.replace(/\s+/g, '_')}_기록표.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV 파일이 다운로드되었습니다.');
  };

  const handleResetAll = () => {
    if (!window.confirm('참가자 명단과 모든 경기 기록을 삭제하고 초기화할까요?')) {
      return;
    }
    const initial = Array.from({ length: 12 }, (_, i) => ({
      id: generateUid(),
      no: String(i + 1),
      name: '',
      carName: '',
      time: '',
      status: '대기' as const,
    }));
    setParticipants(initial);
    setLanes({ 1: null, 2: null, 3: null });
    resetTimer();
    localStorage.removeItem(STORAGE_KEY_ROWS);
    localStorage.removeItem(STORAGE_KEY_LANES);
    showToast('대회 명단이 초기화되었습니다.', 'warn');
  };

  const handleLoadDemoData = () => {
    const demo = SAMPLE_RACERS.map((r) => ({
      ...r,
      id: generateUid(),
    }));
    setParticipants(demo);
    setLanes({ 1: demo[0].id, 2: demo[1].id, 3: demo[2].id });
    showToast('테스트용 12인 샘플 데이터가 로드되었습니다.');
  };

  const timerSecondsDisplay = (timerElapsed / 1000).toFixed(3);

  return (
    <div className="w-[min(1600px,96vw)] mx-auto py-5 sm:py-7 px-2 sm:px-4">
      {/* Top Header */}
      <Header
        roundTitle={roundTitle}
        onUpdateRoundTitle={(t) => {
          setRoundTitle(t);
          showToast(`회차명이 "${t}"(으)로 변경되었습니다.`);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled((prev) => {
            const next = !prev;
            showToast(next ? '효과음이 켜졌습니다.' : '효과음이 꺼졌습니다.', 'info');
            return next;
          });
        }}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* 3-Lane Display Grid */}
      <LaneGrid
        lanes={lanes}
        participants={participants}
        currentTimerTime={timerSecondsDisplay}
        onApplyLaneRecord={handleApplyLaneRecord}
        onSetStatus={handleSetStatus}
        onClearLane={handleClearLane}
      />

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-5">
        {/* Left: Participants Table */}
        <ParticipantTable
          participants={participants}
          lanes={lanes}
          onAddRow={handleAddParticipant}
          onAssignNextThree={handleAssignNextThree}
          onSortByRecord={handleSortByRecord}
          onSaveData={handleSaveData}
          onDownloadCSV={handleDownloadCSV}
          onResetAll={handleResetAll}
          onUpdateField={handleUpdateField}
          onAssignLane={handleAssignLane}
          onDeleteRow={handleDeleteRow}
        />

        {/* Right Side: Stopwatch & Live Podium */}
        <div className="flex flex-col gap-5">
          <TimerCard
            timerDisplay={timerSecondsDisplay}
            countdownText={countdownText}
            isRunning={isRunning}
            onStartTimer={startTimer}
            onStopTimer={stopTimer}
            onResetTimer={resetTimer}
            onRunCountdown={runCountdown}
            lanes={lanes}
            participants={participants}
            lapTimes={lapTimes}
            onRecordLap={handleRecordLap}
            onUpdateLapTime={handleUpdateLapTime}
            onClearLap={handleClearLap}
          />

          <LiveRankingCard participants={participants} />
        </div>
      </div>

      {/* Footer info */}
      <footer className="mt-8 text-center text-xs text-slate-500 pb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>🏁 F 키: 스톱워치 전광판 대형 전체화면 모드 토글</span>
        <span>•</span>
        <span>스페이스바: 스톱워치 시작/정지</span>
        <span>•</span>
        <span>C 키: 3·2·1 GO! 카운트다운</span>
        <span>•</span>
        <span>1, 2, 3 키: 각 레인 실시간 타임랩스(스플릿) 찍기</span>
        <span>•</span>
        <span>R 키: 타이머 리셋</span>
      </footer>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border transition-all animate-bounce ${
            toast.type === 'warn'
              ? 'bg-amber-950 text-amber-200 border-amber-800'
              : toast.type === 'info'
              ? 'bg-slate-900 text-sky-300 border-sky-600'
              : 'bg-emerald-950 text-emerald-200 border-emerald-700'
          }`}
        >
          {toast.type === 'warn' ? (
            <AlertCircle className="w-5 h-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
