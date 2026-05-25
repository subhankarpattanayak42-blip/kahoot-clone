import { useParams } from 'react-router-dom'
import { useGame } from '../../hooks/useGame'
import { useGameContext } from '../../context/GameContext'
import WaitingLobby from './WaitingLobby'
import AnswerQuestion from './AnswerQuestion'
import AnswerResult from './AnswerResult'
import PlayerLeaderboard from './PlayerLeaderboard'
import GameOver from './GameOver'

export default function PlayerGame() {
  const { roomCode } = useParams()
  const { game, loading, error } = useGame(roomCode)
  const { nickname } = useGameContext()

  if (loading) return <Screen>Loading...</Screen>
  if (error)   return <Screen>{error}</Screen>
  if (!game)   return <Screen>Game not found</Screen>

  switch (game.status) {
    case 'lobby':       return <WaitingLobby nickname={nickname} />
    case 'question':    return <AnswerQuestion game={game} roomCode={roomCode} />
    case 'reveal':      return <AnswerResult game={game} roomCode={roomCode} />
    case 'leaderboard': return <PlayerLeaderboard game={game} roomCode={roomCode} />
    case 'finished':    return <GameOver game={game} roomCode={roomCode} />
    default:            return <Screen>Unknown state</Screen>
  }
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white text-2xl font-bold">
      {children}
    </div>
  )
}
