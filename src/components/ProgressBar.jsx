export default function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-2 text-white text-sm">
      <span>Question {current} of {total}</span>
      <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-400 rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
