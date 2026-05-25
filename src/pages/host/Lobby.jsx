import { usePlayers } from '../../hooks/usePlayers'
import { startGame } from '../../firebase/helpers'
import PlayerList from '../../components/PlayerList'
import RoomCodeDisplay from '../../components/RoomCodeDisplay'

export default function Lobby({ game, roomCode }) {
  const { players } = usePlayers(roomCode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-8 p-6">
      <RoomCodeDisplay code={roomCode} />
      <p className="text-white/70 text-lg">{players.length} player{players.length !== 1 ? 's' : ''} joined</p>
      <PlayerList players={players} />
      <button
        onClick={() => startGame(roomCode)}
        disabled={players.length === 0}
        className="bg-yellow-400 text-gray-900 font-black text-2xl px-10 py-4 rounded-2xl shadow-xl hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Game!
      </button>
      <p className="text-white/40 text-sm">{game.questions.length} question{game.questions.length !== 1 ? 's' : ''} ready</p>
    </div>
  )
}
