import { useSessionStore } from '../store/session'

export function QAPanel() {
  const { questions, prompt, answerQuestion, setPhase } = useSessionStore()
  const allAnswered = questions.length > 0 && questions.every((q) => q.selected !== null)

  function handleStart() {
    const answers = questions.map((q) => q.selected!)
    setPhase('planning')
    window.electron.submitPrompt({ prompt, answers })
  }

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
      <div className="text-indigo-400 text-[10px] uppercase tracking-widest mb-1">◆ Agent Questions</div>

      {questions.map((q, i) => (
        <div key={i} className="bg-[#12121e] rounded-md p-3 border border-[#2a2a3e]">
          <div className="text-amber-400 text-[11px] mb-2">{q.question}</div>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => answerQuestion(i, opt)}
                className={`text-[11px] px-3 py-1 rounded-full transition-colors ${
                  q.selected === opt
                    ? 'bg-indigo-900 text-indigo-200 border border-indigo-500'
                    : 'bg-[#1e1e3a] text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt}{q.selected === opt ? ' ✓' : ''}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleStart}
        disabled={!allAnswered}
        className="mt-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-sm rounded-md py-2 transition-colors"
      >
        Start coding →
      </button>
    </div>
  )
}
