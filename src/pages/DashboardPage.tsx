import { useState } from 'react'
import { useLocation } from 'wouter'
import { PageHeader, PageContent } from '../components/layout/Shell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PlayerAvatar } from '../components/ui/PlayerAvatar'
import { useActiveGame } from '../hooks/useActiveGame'
import { useGameHistory } from '../hooks/useGameHistory'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useSyncContext } from '../contexts/SyncContext'
import { formatDate } from '../lib/format'

export function DashboardPage() {
  const [, setLocation] = useLocation()
  const activeGame = useActiveGame()
  const history = useGameHistory()
  const leaderboard = useLeaderboard()
  const { isOnline, isScorekeeper, enterScorekeeper, exitScorekeeper, changePin } = useSyncContext()

  const [showPinModal, setShowPinModal] = useState(false)
  const [showChangePinModal, setShowChangePinModal] = useState(false)
  const [showScorekeeperMenu, setShowScorekeeperMenu] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [changePinError, setChangePinError] = useState(false)
  const [changePinSuccess, setChangePinSuccess] = useState(false)

  const hasActiveGame = activeGame !== null && activeGame !== undefined

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return
    const ok = await enterScorekeeper(pin)
    if (ok) {
      setShowPinModal(false)
      setPin('')
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  const handleChangePinSubmit = async () => {
    if (currentPin.length !== 4 || newPin.length !== 4) return
    const ok = await changePin(currentPin, newPin)
    if (ok) {
      setChangePinSuccess(true)
      setTimeout(() => {
        setShowChangePinModal(false)
        setCurrentPin('')
        setNewPin('')
        setChangePinError(false)
        setChangePinSuccess(false)
      }, 1200)
    } else {
      setChangePinError(true)
    }
  }

  return (
    <>
      <PageHeader
        title="poker @ sudio"
        right={
          <div className="flex items-center gap-2">
            {isOnline && (
              isScorekeeper ? (
                <div className="relative">
                  <button
                    onClick={() => setShowScorekeeperMenu(!showScorekeeperMenu)}
                    className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    scorekeeper ✓
                  </button>
                  {showScorekeeperMenu && (
                    <div className="absolute right-0 top-8 z-50 bg-slate-900 border border-slate-700 rounded-xl py-1 w-36 shadow-lg">
                      <button
                        onClick={() => { setShowScorekeeperMenu(false); setShowChangePinModal(true) }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        change pin
                      </button>
                      <button
                        onClick={() => { setShowScorekeeperMenu(false); exitScorekeeper() }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800"
                      >
                        exit scorekeeper
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  viewer
                </button>
              )
            )}
            {isScorekeeper && (
              <button
                onClick={() => setLocation('/players')}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="manage players"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
            )}
          </div>
        }
      />
      <PageContent>
        {/* CTA */}
        {isScorekeeper && (
          <div className="mb-6">
            {hasActiveGame ? (
              <Button
                size="lg"
                fullWidth
                onClick={() => setLocation('/game')}
              >
                continue game night →
              </Button>
            ) : (
              <Button
                size="lg"
                fullWidth
                onClick={() => setLocation('/game')}
              >
                start game night 🃏
              </Button>
            )}
          </div>
        )}

        {/* Viewer CTA — just navigate to watch */}
        {!isScorekeeper && hasActiveGame && (
          <div className="mb-6">
            <Button
              size="lg"
              fullWidth
              variant="secondary"
              onClick={() => setLocation('/game')}
            >
              view live game →
            </Button>
          </div>
        )}

        {/* Top 3 leaderboard preview */}
        {leaderboard && leaderboard.ranked.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-slate-500 tracking-wider">season leaders</h2>
              <button
                onClick={() => setLocation('/leaderboard')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                view all →
              </button>
            </div>
            <Card>
              {leaderboard.ranked.slice(0, 3).map((entry) => {
                const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
                return (
                  <div
                    key={entry.player.id}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0"
                  >
                    <span className="text-sm w-6 text-center">{medals[entry.rank!] ?? entry.rank}</span>
                    <PlayerAvatar name={entry.player.name} emoji={entry.player.emoji} size="sm" />
                    <span className="flex-1 text-sm font-medium text-slate-200">{entry.player.name}</span>
                    <span className="text-sm font-bold text-slate-300">{entry.points} pts</span>
                  </div>
                )
              })}
            </Card>
          </div>
        )}

        {/* Latest game results */}
        {history && history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-slate-500 tracking-wider">latest game</h2>
              <button
                onClick={() => setLocation('/history')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                all history →
              </button>
            </div>
            <Card onClick={() => setLocation(`/history/${history[0].game.id}`)}>
              <div className="text-sm text-slate-400 mb-2">
                {formatDate(history[0].game.date)}
              </div>
              {[...history[0].gamePlayers]
                .sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
                .slice(0, 3)
                .map((gp) => (
                  <div key={gp.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={gp.player.name} emoji={gp.player.emoji} size="sm" />
                      <span className="text-sm text-slate-300">{gp.player.name}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${(gp.net ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {(gp.net ?? 0) >= 0 ? '+' : ''}€{(gp.net ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              {history[0].gamePlayers.length > 3 && (
                <div className="text-xs text-slate-500 mt-1">
                  +{history[0].gamePlayers.length - 3} more
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Empty state when no data at all */}
        {(!history || history.length === 0) && (!leaderboard || leaderboard.ranked.length === 0) && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              no games played yet.{isScorekeeper ? ' start a game night to get going.' : ''}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6">
          <h2 className="text-sm text-slate-500 tracking-wider mb-2">info</h2>
          <Card>
            <div className="text-sm text-slate-400 space-y-3 py-1">
              <p className="text-slate-300">carrer pere IV 29-35, 4-1</p>
              <div>
                <p>cash game starts at 7pm, last hand 10:30pm.</p>
                <p>buy in €20 for 500 chips.</p>
                <p>blinds 5/10 all night.</p>
                <p>unlimited rebuys.</p>
                <p>texas hold'em.</p>
              </div>
              <p>feel free to bring people along if we're short on numbers. they'll get added to the group after if they want to come again.</p>
            </div>
          </Card>
        </div>
      </PageContent>

      {/* PIN modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-72">
            <h2 className="text-lg font-bold text-slate-200 mb-1">scorekeeper mode</h2>
            <p className="text-sm text-slate-400 mb-4">
              enter 4-digit pin to manage games. first time? this sets your pin.
            </p>
            <input
              type="tel"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                setPinError(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              placeholder="0000"
              autoFocus
              className={`w-full text-center text-2xl tracking-[0.5em] bg-slate-800 border ${pinError ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500`}
            />
            {pinError && (
              <p className="text-xs text-red-400 mt-2">wrong pin</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" fullWidth onClick={() => { setShowPinModal(false); setPin(''); setPinError(false) }}>
                cancel
              </Button>
              <Button fullWidth disabled={pin.length !== 4} onClick={handlePinSubmit}>
                enter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-72">
            <h2 className="text-lg font-bold text-slate-200 mb-1">change pin</h2>
            {changePinSuccess ? (
              <p className="text-sm text-emerald-400 py-4 text-center">pin changed</p>
            ) : (
              <>
                <p className="text-sm text-slate-400 mb-4">enter current pin, then your new one.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">current pin</label>
                    <input
                      type="tel"
                      maxLength={4}
                      value={currentPin}
                      onChange={(e) => {
                        setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                        setChangePinError(false)
                      }}
                      placeholder="0000"
                      autoFocus
                      className={`w-full text-center text-2xl tracking-[0.5em] bg-slate-800 border ${changePinError ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500`}
                    />
                    {changePinError && (
                      <p className="text-xs text-red-400 mt-1">wrong current pin</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">new pin</label>
                    <input
                      type="tel"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onKeyDown={(e) => e.key === 'Enter' && handleChangePinSubmit()}
                      placeholder="0000"
                      className="w-full text-center text-2xl tracking-[0.5em] bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" fullWidth onClick={() => { setShowChangePinModal(false); setCurrentPin(''); setNewPin(''); setChangePinError(false) }}>
                    cancel
                  </Button>
                  <Button fullWidth disabled={currentPin.length !== 4 || newPin.length !== 4} onClick={handleChangePinSubmit}>
                    save
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
