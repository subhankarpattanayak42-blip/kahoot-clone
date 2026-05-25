export default function WaitingLobby({ nickname }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-6xl animate-bounce">⏳</div>
      <h1 className="text-white font-black text-3xl text-center">Waiting for host to start...</h1>
      <p className="text-white/60 text-xl">You're in as <span className="text-yellow-300 font-bold">{nickname}</span></p>
    </div>
  )
}
