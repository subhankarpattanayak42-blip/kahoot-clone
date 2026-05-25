import { createContext, useContext, useState } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [roomCode, setRoomCode] = useState('')
  const [role, setRole] = useState(null)
  const [nickname, setNickname] = useState('')

  return (
    <GameContext.Provider value={{ roomCode, setRoomCode, role, setRole, nickname, setNickname }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  return useContext(GameContext)
}
