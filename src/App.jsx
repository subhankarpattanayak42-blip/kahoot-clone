import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import Home from './pages/Home'
import CreateQuiz from './pages/host/CreateQuiz'
import HostGame from './pages/host/HostGame'
import JoinGame from './pages/player/JoinGame'
import PlayerGame from './pages/player/PlayerGame'
import VibeCodingRegister from './pages/VibeCodingRegister'

import VibeCodingAdmin from './pages/VibeCodingAdmin'

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/host/create"    element={<CreateQuiz />} />
          <Route path="/host/:roomCode" element={<HostGame />} />
          <Route path="/play"           element={<JoinGame />} />
          <Route path="/play/:roomCode" element={<PlayerGame />} />
          <Route path="/register"       element={<VibeCodingRegister />} />
          <Route path="/admin"          element={<VibeCodingAdmin />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  )
}
