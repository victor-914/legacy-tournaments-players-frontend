# API Endpoints

This project is a Next.js App Router frontend. The current source contains one implemented local API route. Most data-facing UI screens are wired to `mockApi` methods, and a shared Axios client is configured for a future backend API base URL.

## Implemented Local API Routes

Base path: same origin as the frontend application.

| Method | Path | Source | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | `src/app/api/health/route.ts` | Returns a JSON health response for the player frontend service. |

### GET `/api/health`

Response:

```json
{
  "success": true,
  "message": "Legacy Esports frontend is online",
  "data": {
    "service": "player-frontend"
  }
}
```

## Configured Backend REST Client

Source: `src/services/apiClient.ts`

The shared Axios client is configured with:

```text
${NEXT_PUBLIC_API_URL}/api
```

It also attaches an authorization header when `hammer_access_token` exists in browser local storage:

```text
Authorization: Bearer <token>
```

No source files currently call `apiClient`, so no concrete backend REST endpoint paths are implemented in the frontend yet.

## Mock API Surface Currently Used By Screens

Source: `src/services/mockApi.ts`

These are in-memory mock service methods, not HTTP endpoints. They represent the data operations currently consumed by the UI before the backend is connected.

| Mock Method | Used For | Current Consumer |
| --- | --- | --- |
| `getDashboard()` | Dashboard summary data | `src/features/dashboard/components/DashboardView.tsx` |
| `getTournaments()` | Tournament list | `src/features/tournaments/components/TournamentsView.tsx` |
| `getTournament(id)` | Tournament details by ID | `src/features/tournaments/components/TournamentDetailsView.tsx` |
| `getStandings()` | Group-stage standings | `src/features/groups/components/GroupStageView.tsx` |
| `getLeaderboard()` | Grand finale leaderboard | `src/features/leaderboards/components/GrandFinaleLeaderboardView.tsx` |
| `getActivity()` | Activity feed data | No current direct consumer found |
| `getMatch()` | Upcoming/current match data | `src/features/matches/components/MatchSubmissionView.tsx` |
| `getProfile()` | Player profile data | `src/features/profile/components/ProfileView.tsx` |

## Socket.IO Connection

Source: `src/socket/socketClient.ts`

The client connects to:

```text
NEXT_PUBLIC_SOCKET_URL || http://localhost:4000
```

The socket client listens for:

| Event | Description |
| --- | --- |
| `connect` | Marks the socket store as connected. |
| `disconnect` | Marks the socket store as disconnected. |

No custom emitted socket events or custom listened socket events are defined in the current source.
