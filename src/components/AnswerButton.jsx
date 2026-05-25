const COLORS = [
  { bg: 'bg-red-500 hover:bg-red-600',   label: '▲' },
  { bg: 'bg-blue-500 hover:bg-blue-600', label: '◆' },
  { bg: 'bg-yellow-400 hover:bg-yellow-500', label: '●' },
  { bg: 'bg-green-500 hover:bg-green-600', label: '■' },
]

export default function AnswerButton({ index, text, onClick, disabled, selected, correct, revealed }) {
  const { bg, label } = COLORS[index]

  let extra = ''
  if (revealed) {
    if (correct) extra = 'ring-4 ring-white scale-105'
    else if (selected && !correct) extra = 'opacity-50'
    else extra = 'opacity-40'
  } else if (selected) {
    extra = 'ring-4 ring-white scale-105'
  }

  return (
    <button
      className={`${bg} ${extra} text-white font-bold text-lg rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 w-full disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-2xl">{label}</span>
      <span className="text-left">{text}</span>
    </button>
  )
}
