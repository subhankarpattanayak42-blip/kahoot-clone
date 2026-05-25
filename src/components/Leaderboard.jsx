const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ players, highlightUid }) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      {players.slice(0, 10).map((player, index) => (
        <div
          key={player.id}
          className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-white shadow
            ${player.id === highlightUid ? 'bg-purple-600 scale-105' : 'bg-gray-700'}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl w-8 text-center">
              {index < 3 ? MEDALS[index] : `${index + 1}.`}
            </span>
            <span className="text-lg">{player.nickname}</span>
          </div>
          <span className="text-yellow-300 text-xl">{player.score} pts</span>
        </div>
      ))}
    </div>
  )
}
