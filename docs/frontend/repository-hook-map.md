# Repository Hook Map

## Complete Hook Reference

### Player Hooks (`src/hooks/usePlayers.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `usePlayers()` | Fetch all players | `UseQueryResult<Player[]>` | `params?: PlayerListParams` |
| `usePlayer(id)` | Fetch single player | `UseQueryResult<Player \| null>` | `id: string \| undefined` |
| `useCreatePlayer()` | Create player | `UseMutationResult<Player, Error, CreatePlayerInput>` | — |
| `useUpdatePlayer()` | Update player | `UseMutationResult<Player, Error, {id, data}>` | — |
| `useDeletePlayer()` | Delete player | `UseMutationResult<void, Error, string>` | — |

**Usage Example:**

```typescript
const { data: players, isLoading, error } = usePlayers();
const createPlayerMutation = useCreatePlayer();

await createPlayerMutation.mutateAsync({
  name: "John Doe",
  posisi: "GK",
  // ...
});
```

### Staff Hooks (`src/hooks/useStaff.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useStaff()` | Fetch all staff | `UseQueryResult<Staff[]>` | `params?: StaffListParams` |
| `useStaffMember(id)` | Fetch single staff | `UseQueryResult<Staff \| null>` | `id: string \| undefined` |
| `useCreateStaff()` | Create staff | `UseMutationResult<Staff, Error, CreateStaffInput>` | — |
| `useUpdateStaff()` | Update staff | `UseMutationResult<Staff, Error, {id, data}>` | — |
| `useDeleteStaff()` | Delete staff | `UseMutationResult<void, Error, string>` | — |

### Team Hooks (`src/hooks/useTeams.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useTeams()` | Fetch all teams | `UseQueryResult<Team[]>` | — |
| `useTeam(id)` | Fetch single team | `UseQueryResult<Team \| null>` | `id: string \| undefined` |
| `useCreateTeam()` | Create team | `UseMutationResult<Team, Error, CreateTeamInput>` | — |
| `useUpdateTeam()` | Update team | `UseMutationResult<Team, Error, {id, data}>` | — |
| `useDeleteTeam()` | Delete team | `UseMutationResult<void, Error, string>` | — |

### Season Hooks (`src/hooks/useSeasons.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useSeasons()` | Fetch all seasons | `UseQueryResult<Season[]>` | — |
| `useActiveSeason()` | Fetch active season | `UseQueryResult<Season \| null>` | — |
| `useSeason(id)` | Fetch single season | `UseQueryResult<Season \| null>` | `id: string \| undefined` |
| `useCreateSeason()` | Create season | `UseMutationResult<Season, Error, CreateSeasonInput>` | — |
| `useUpdateSeason()` | Update season | `UseMutationResult<Season, Error, {id, data}>` | — |
| `useDeleteSeason()` | Delete season | `UseMutationResult<void, Error, string>` | — |
| `useSetActiveSeason()` | Set active season | `UseMutationResult<void, Error, string>` | — |

### Training Hooks (`src/hooks/useTraining.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useTrainingSessions()` | Fetch all training sessions | `UseQueryResult<TrainingSession[]>` | `params?: TrainingListParams` |
| `useTrainingSession(id)` | Fetch single session | `UseQueryResult<TrainingSession \| null>` | `id: string \| undefined` |
| `useAttendance(trainingId)` | Fetch attendance | `UseQueryResult<Attendance[]>` | `trainingId: string \| undefined` |
| `useCreateTrainingSession()` | Create session | `UseMutationResult<TrainingSession, Error, CreateTrainingInput>` | — |
| `useUpdateTrainingSession()` | Update session | `UseMutationResult<TrainingSession, Error, {id, data}>` | — |
| `useDeleteTrainingSession()` | Delete session | `UseMutationResult<void, Error, string>` | — |
| `useRecordAttendance()` | Record attendance | `UseMutationResult<Attendance, Error, RecordAttendanceInput>` | — |

### Competition Hooks (`src/hooks/useCompetitions.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useCompetitions()` | Fetch all competitions | `UseQueryResult<Competition[]>` | — |
| `useCompetition(id)` | Fetch single competition | `UseQueryResult<Competition \| null>` | `id: string \| undefined` |
| `useCreateCompetition()` | Create competition | `UseMutationResult<Competition, Error, CreateCompetitionInput>` | — |
| `useUpdateCompetition()` | Update competition | `UseMutationResult<Competition, Error, {id, data}>` | — |
| `useDeleteCompetition()` | Delete competition | `UseMutationResult<void, Error, string>` | — |

### Match Hooks (`src/hooks/useMatches.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useMatches()` | Fetch all matches | `UseQueryResult<Match[]>` | `params?: MatchListParams` |
| `useMatch(id)` | Fetch single match | `UseQueryResult<Match \| null>` | `id: string \| undefined` |
| `useUpcomingMatches()` | Fetch upcoming matches | `UseQueryResult<Match[]>` | — |
| `usePastMatches()` | Fetch past matches | `UseQueryResult<Match[]>` | — |
| `useCreateMatch()` | Create match | `UseMutationResult<Match, Error, CreateMatchInput>` | — |
| `useUpdateMatch()` | Update match | `UseMutationResult<Match, Error, {id, data}>` | — |
| `useDeleteMatch()` | Delete match | `UseMutationResult<void, Error, string>` | — |

### Finance Hooks (`src/hooks/useFinance.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useTransactions()` | Fetch all transactions | `UseQueryResult<Transaction[]>` | `params?: TransactionListParams` |
| `useTransaction(id)` | Fetch single transaction | `UseQueryResult<Transaction \| null>` | `id: string \| undefined` |
| `useFinanceTotals()` | Fetch financial totals | `UseQueryResult<FinanceTotals>` | — |
| `useFinanceBalance()` | Fetch account balance | `UseQueryResult<number>` | — |
| `useCreateTransaction()` | Create transaction | `UseMutationResult<Transaction, Error, CreateTransactionInput>` | — |
| `useUpdateTransaction()` | Update transaction | `UseMutationResult<Transaction, Error, {id, data}>` | — |
| `useDeleteTransaction()` | Delete transaction | `UseMutationResult<void, Error, string>` | — |

### Organization Hooks (`src/hooks/useOrganization.tsx`)

| Hook | Purpose | Return Type | Params |
|------|---------|-------------|--------|
| `useClub()` | Fetch club info | `UseQueryResult<Club>` | `clubId?: string` |
| `useUpdateClub()` | Update club | `UseMutationResult<Club, Error, {clubId, data}>` | — |

### Core Hooks

#### `useRepositories()`

Access all repositories directly.

```typescript
const repositories = useRepositories();
// repositories.player
// repositories.staff
// repositories.team
// ... etc
```

## Hook Patterns

### Query Pattern

```typescript
const { 
  data,           // The query result
  isLoading,      // Loading state
  error,          // Error object
  refetch,        // Manual refetch function
} = usePlayers();

if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;

return <PlayerList players={data || []} />;
```

### Mutation Pattern

```typescript
const {
  mutate,         // Async mutation function
  mutateAsync,    // Promise-based mutation
  isPending,      // Loading state during mutation
  error,          // Error from mutation
  data,           // Result from mutation
} = useCreatePlayer();

const handleCreate = async (formData) => {
  try {
    await mutateAsync(formData);
    // Auto-redirect or close modal
  } catch (error) {
    setErrorMessage(error.message);
  }
};
```

### Optimistic Update Pattern

```typescript
const updateMutation = useUpdatePlayer();

const optimisticUpdate = async (id, data) => {
  // Update local state immediately
  setLocalData(prev => ({
    ...prev,
    [id]: data
  }));

  try {
    await updateMutation.mutateAsync({ id, data });
  } catch (error) {
    // Revert on error
    refetch();
  }
};
```

## Query Key Usage

### Invalidate All Player Data

```typescript
queryClient.invalidateQueries({ queryKey: ['players'] })
```

### Invalidate Specific Player

```typescript
queryClient.invalidateQueries({ queryKey: ['players', 'detail', playerId] })
```

### Invalidate All Lists

```typescript
queryClient.invalidateQueries({ queryKey: ['players', 'list'] })
```

## TypeScript Usage

### Type Imports

```typescript
import type {
  Player,
  CreatePlayerInput,
  UpdatePlayerInput,
  PlayerListParams,
  ListResult,
} from "@/repositories/interfaces";
```

### Hook Result Types

```typescript
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

type PlayersQuery = UseQueryResult<Player[], Error>;
type CreatePlayerMutation = UseMutationResult<Player, Error, CreatePlayerInput>;
```

## Common Scenarios

### Fetch and Display List

```typescript
function PlayerListPage() {
  const { data: players = [], isLoading, error } = usePlayers();

  if (isLoading) return <DefaultLoadingState />;
  if (error) return <DefaultErrorState />;
  if (!players.length) return <DefaultEmptyState />;

  return <PlayerTable data={players} />;
}
```

### Create with Modal

```typescript
function CreatePlayerModal({ open, onOpenChange }) {
  const createMutation = useCreatePlayer();

  const handleSubmit = async (formData) => {
    try {
      await createMutation.mutateAsync(formData);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CreatePlayerForm 
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </Dialog>
  );
}
```

### Update with Form

```typescript
function EditPlayerPage({ playerId }) {
  const { data: player, isLoading } = usePlayer(playerId);
  const updateMutation = useUpdatePlayer();

  const handleSubmit = async (formData) => {
    await updateMutation.mutateAsync({
      id: playerId,
      data: formData
    });
  };

  if (isLoading) return <DefaultLoadingState />;

  return (
    <PlayerForm 
      initialValues={player}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
```

### Delete with Confirmation

```typescript
function DeletePlayerButton({ playerId }) {
  const deleteMutation = useDeletePlayer();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(playerId);
      setOpen(false);
    } catch (error) {
      // Error state
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="destructive"
      >
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
```

### Filter with Hook Parameters

```typescript
function FilteredPlayerList() {
  const [filters, setFilters] = useState({
    position: "ALL",
    status: "ALL"
  });

  const { data: players = [] } = usePlayers(
    filters.position === "ALL" && filters.status === "ALL" 
      ? undefined 
      : { position: filters.position, status: filters.status }
  );

  return (
    <>
      <FilterControls onChange={setFilters} />
      <PlayerTable data={players} />
    </>
  );
}
```

## Debugging

### Enable React Query Devtools

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

### Console Logging

```typescript
const { data } = usePlayers({
  onSuccess: (data) => console.log('Players loaded:', data),
  onError: (error) => console.error('Player load failed:', error),
});
```

### Check Cache

```typescript
// In browser console
queryClient.getQueryData(['players'])
queryClient.getQueryState(['players'])
```
