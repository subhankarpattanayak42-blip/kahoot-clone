import { useParams } from 'react-router-dom'
import { useGame } from '../../hooks/useGame'
import { useGameContext } from '../../context/GameContext'
import Lobby from './Lobby'
import QuestionDisplay from './QuestionDisplay'
import AnswerReveal from './AnswerReveal'
import HostLeaderboard from './HostLeaderboard'
import GameOver from './GameOver'

export default function HostGame() {
  const { roomCode } = useParams()
  const { game, loading, error } = useGame(roomCode)

  if (loading) return <Screen>Loading game...</Screen>
  if (error)   return <Screen>{error}</Screen>
  if (!game)   return <Screen>Game not found</Screen>

  switch (game.status) {
    case 'lobby':       return <Lobby game={game} roomCode={roomCode} />
    case 'question':    return <QuestionDisplay game={game} roomCode={roomCode} />
    case 'reveal':      return <AnswerReveal game={game} roomCode={roomCode} />
    case 'leaderboard': return <HostLeaderboard game={game} roomCode={roomCode} />
    case 'finished':    return <GameOver game={game} roomCode={roomCode} />
    default:            return <Screen>Unknown game state</Screen>
  }
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white text-2xl font-bold">
      {children}
    </div>
  )
}
