export default function PlayerList({ players }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {players.map(p => (
        <div key={p.id} className="bg-white text-purple-800 font-bold px-3 py-1 rounded-full text-sm shadow">
          {p.nickname}
        </div>
      ))}
    </div>
  )
}
