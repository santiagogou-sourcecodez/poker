import { Route, Switch } from 'wouter'
import { Shell } from './components/layout/Shell'
import { BottomNav } from './components/layout/BottomNav'
import { DashboardPage } from './pages/DashboardPage'
import { ActiveGamePage } from './pages/ActiveGamePage'
import { SettlementPage } from './pages/SettlementPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { HistoryPage } from './pages/HistoryPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { PlayerManagementPage } from './pages/PlayerManagementPage'

export default function App() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/game" component={ActiveGamePage} />
        <Route path="/game/settle" component={SettlementPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/history/:id" component={GameDetailPage} />
        <Route path="/players" component={PlayerManagementPage} />
      </Switch>
      <BottomNav />
    </Shell>
  )
}
