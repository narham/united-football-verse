# Frontend Repository Architecture

## Overview

This document describes the repository-driven architecture for the bolaID Football OS frontend. The architecture follows a clean data-access pattern that separates concerns and enables seamless backend replacement.

## Architecture Layers

```
Route / Component
    ↓
TanStack Query Hook
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
Demo/In-Memory Data
```

## Key Components

### 1. Repository Interfaces

**Location:** `src/repositories/interfaces/`

- `types.ts` - Domain types and entity definitions
- `index.ts` - Repository interface contracts

**Purpose:** Define contracts for data access independent of implementation.

**Key Interfaces:**

```typescript
export interface PlayerRepository {
  list(clubId: string, params?: PlayerListParams): Promise<ListResult<Player>>;
  getById(id: string): Promise<Player | null>;
  create(clubId: string, input: CreatePlayerInput): Promise<Player>;
  update(id: string, input: UpdatePlayerInput): Promise<Player>;
  delete(id: string): Promise<void>;
  getByFootballId(footballId: string): Promise<Player | null>;
  getStats(playerId: string, season: string): Promise<any>;
  getPerformanceRating(playerId: string, season?: string): Promise<PlayerPerformanceRating>;
}
```

Similar interfaces exist for:
- `StaffRepository`
- `TeamRepository`
- `SeasonRepository`
- `TrainingRepository`
- `CompetitionRepository`
- `MatchRepository`
- `FinanceRepository`
- `NotificationRepository`
- `ActivityRepository`
- `OrganizationRepository`

### 2. Repository Implementations

**Location:** `src/repositories/demo/`

Demo repositories implement all interfaces using localStorage as the backing store.

**Key Classes:**
- `DemoPlayerRepository`
- `DemoStaffRepository`
- `DemoTeamRepository`
- `DemoSeasonRepository`
- `DemoTrainingRepository`
- `DemoCompetitionRepository`
- `DemoMatchRepository`
- `DemoFinanceRepository`
- `DemoNotificationRepository`
- `DemoActivityRepository`
- `DemoOrganizationRepository`

**Storage Layer:**
- `DemoStorage` - Centralized localStorage helper with namespace support
- Namespaced as `bolaID.demo.{entity}`

### 3. Repository Factory

**Location:** `src/repositories/demo/index.ts`

```typescript
export function createDemoRepositories(clubId: string): Repositories
```

Creates all repository instances with shared storage context.

### 4. Repository Context Provider

**Location:** `src/lib/repositories-context.tsx`

Provides repository access to all components via React Context.

```typescript
export function RepositoriesProvider({ children, clubId }) {
  // Provides repositories to entire app
}

export function useRepositoriesContext(): Repositories
```

### 5. TanStack Query Hooks

**Location:** `src/hooks/`

Hooks for server-state style access with automatic query invalidation.

#### Player Hooks

```typescript
usePlayers(params?: PlayerListParams)         // List all players
usePlayer(id: string)                         // Get single player
useCreatePlayer()                             // Create player mutation
useUpdatePlayer()                             // Update player mutation
useDeletePlayer()                             // Delete player mutation
```

#### Staff Hooks

```typescript
useStaff(params?: StaffListParams)
useStaffMember(id: string)
useCreateStaff()
useUpdateStaff()
useDeleteStaff()
```

#### Team Hooks

```typescript
useTeams()
useTeam(id: string)
useCreateTeam()
useUpdateTeam()
useDeleteTeam()
```

#### Season Hooks

```typescript
useSeasons()
useActiveSeason()
useSeason(id: string)
useCreateSeason()
useUpdateSeason()
useDeleteSeason()
useSetActiveSeason()
```

#### Training Hooks

```typescript
useTrainingSessions(params?: TrainingListParams)
useTrainingSession(id: string)
useAttendance(trainingId: string)
useCreateTrainingSession()
useUpdateTrainingSession()
useDeleteTrainingSession()
useRecordAttendance()
```

#### Competition Hooks

```typescript
useCompetitions()
useCompetition(id: string)
useCreateCompetition()
useUpdateCompetition()
useDeleteCompetition()
```

#### Match Hooks

```typescript
useMatches(params?: MatchListParams)
useMatch(id: string)
useUpcomingMatches()
usePastMatches()
useCreateMatch()
useUpdateMatch()
useDeleteMatch()
```

#### Finance Hooks

```typescript
useTransactions(params?: TransactionListParams)
useTransaction(id: string)
useFinanceTotals()
useFinanceBalance()
useCreateTransaction()
useUpdateTransaction()
useDeleteTransaction()
```

#### Organization Hooks

```typescript
useClub(clubId?: string)
useUpdateClub()
```

## Query Key Conventions

Query keys follow a hierarchical pattern for efficient invalidation:

```typescript
// Players
['players']                    // All player data
['players', 'list']           // Player lists
['players', 'list', params]   // Specific list with params
['players', 'detail']         // All player details
['players', 'detail', id]     // Specific player

// Teams
['teams']
['teams', 'list']
['teams', 'detail', id]

// Seasons
['seasons']
['seasons', 'list']
['seasons', 'detail', id]
['seasons', 'active']

// Training
['training']
['training', 'list', params]
['training', 'detail', id]
['training', 'attendance', sessionId]
```

## Mutation Invalidation Rules

After mutations, the following queries are invalidated:

### Create Operations
```typescript
queryClient.invalidateQueries({ queryKey: ['entity'] })
```

### Update Operations
```typescript
// Invalidate both detail and list queries
queryClient.invalidateQueries({ queryKey: ['entity', 'detail', id] })
queryClient.invalidateQueries({ queryKey: ['entity', 'list'] })

// For related totals/summaries
queryClient.invalidateQueries({ queryKey: ['entity', 'totals'] })
queryClient.invalidateQueries({ queryKey: ['entity', 'balance'] })
```

### Delete Operations
```typescript
queryClient.invalidateQueries({ queryKey: ['entity'] })
```

## Data Flow

### Read Flow
```
Component
  ↓ useQuery hook
TanStack Query (cache management)
  ↓ queryFn
Hook (e.g., usePlayers)
  ↓
Repository method (e.g., player.list())
  ↓
Demo repository implementation
  ↓
DemoStorage / localStorage
```

### Write Flow
```
Component (form submission)
  ↓ useMutation hook
Repository method (e.g., player.create())
  ↓
Demo repository implementation
  ↓
DemoStorage / localStorage
  ↓ onSuccess
Query invalidation
  ↓
TanStack Query refetch
  ↓
Component re-renders with new data
```

## UI Integration Pattern

### Route Integration

Each route follows this pattern:

```typescript
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from "@/hooks/usePlayers";
import { DefaultLoadingState, DefaultEmptyState } from "@/components/data-state";

function MyRoute() {
  const { data = [], isLoading, error } = usePlayers();
  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer();
  const deleteMutation = useDeletePlayer();

  if (isLoading) return <DefaultLoadingState />;
  if (error) return <DefaultEmptyState title="Error" />;

  return (
    // UI implementation
  );
}
```

### CRUD States

All CRUD operations provide proper UX states:

```
Idle → Submit
  ↓
Loading (button disabled)
  ↓
Success/Error
  ↓
Query invalidation
  ↓
UI updates
```

### Modal CRUD Pattern

```typescript
function CreatePlayerModal({ open, onOpenChange }) {
  const [formData, setFormData] = useState({});
  const { mutate, isPending } = useCreatePlayer();

  const handleSubmit = async () => {
    try {
      await mutate(formData, {
        onSuccess: () => onOpenChange(false),
        onError: (error) => setError(error.message),
      });
    } catch (e) {
      // Handle error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Form>
        {/* form fields */}
        <Button disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Saving..." : "Create"}
        </Button>
      </Form>
    </Dialog>
  );
}
```

## Error Handling

### Repository Level

Repositories throw descriptive errors:

```typescript
if (index === -1) {
  throw new Error("Player tidak ditemukan");
}
```

### Hook Level

Hooks capture errors in TanStack Query state:

```typescript
const { data, error, isLoading } = usePlayers();

if (error) {
  // Handle error with user-friendly message
}
```

### Component Level

Components render error states:

```typescript
if (error) {
  return <DefaultErrorState message={error.message} />;
}
```

## Backend Replacement Strategy (Future: Supabase)

The current architecture is designed for seamless backend replacement:

### Current Flow
```
createRepositories() → DemoRepositories
```

### Future Flow
```
createRepositories() → SupabaseRepositories
```

### No UI Changes Required

The UI layer remains unaware of implementation:

1. Repository interfaces stay the same
2. Hook signatures stay the same
3. Query keys stay the same
4. Mutation patterns stay the same

### Replacement Checklist

To replace with Supabase:

1. ✅ Keep repository interfaces unchanged
2. ✅ Create `SupabasePlayerRepository` implementing `PlayerRepository`
3. ✅ Create `SupabaseStaffRepository` implementing `StaffRepository`
4. ... (repeat for all domains)
5. ✅ Update factory function to create Supabase repositories
6. ✅ Existing components require zero changes

## Search and Filter Pattern

Filters are applied at the repository level:

```typescript
// Hook
export function usePlayers(params?: PlayerListParams) {
  return useQuery({
    queryFn: async () => {
      const result = await repositories.player.list("club-default", params);
      return result.data || [];
    },
  });
}

// Component
const { data: players } = usePlayers({ 
  position: "GK", 
  status: "Aktif" 
});
```

For client-side filtering:

```typescript
const filtered = useMemo(
  () => players.filter(p => p.status === "Aktif"),
  [players]
);
```

## Caching and Staleness

TanStack Query defaults:

- **staleTime:** 0ms (data considered stale immediately)
- **gcTime:** 5 minutes (garbage collected after)
- **refetchOnMount:** true

Queries automatically refetch when:
1. Component mounts
2. Window regains focus
3. Query explicitly invalidated
4. Cache expired

## Demo Data Mutability

The demo repository supports full CRUD:

```
Initial demo-data loaded from demo-data.ts
      ↓
Create player
      ↓
Player list updates in memory
      ↓
PlayerTable re-renders with new data
      ↓
Persisted to localStorage
```

No full page reload required.

Data persists during session but resets on page reload (unless localStorage extension is added).

## Performance Considerations

### Query Keys

- Specific query keys prevent over-invalidation
- Hierarchical structure enables surgical cache management
- Example: updating one player invalidates detail + list, not unrelated queries

### Lazy Loading

- Queries only execute when component mounts and enabled=true
- Deferred queries reduce initial load

### Pagination

ListResult structure supports pagination:

```typescript
export interface ListResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
```

Future optimization point: Implement cursor-based pagination.

## Development Workflow

### Adding New Domain

1. Define types in `src/repositories/interfaces/types.ts`
2. Define repository interface in `src/repositories/interfaces/index.ts`
3. Implement demo repository in `src/repositories/demo/{entity}-repository.ts`
4. Create query key constants in hook file
5. Create hooks in `src/hooks/use{Entity}.tsx`
6. Add to RepositoriesProvider
7. Integrate in route components

### Testing Checklist

- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] List query returns data
- [ ] Create mutation works
- [ ] Update mutation updates data
- [ ] Delete mutation removes data
- [ ] Filter/search works
- [ ] Loading states display
- [ ] Error states display
- [ ] Query invalidation works
- [ ] localStorage persists data
- [ ] Mobile layout functional
- [ ] Dark mode functional

## Future Enhancements

1. **Optimistic Updates** - Show UI changes immediately
2. **Pagination** - Implement cursor-based pagination
3. **Infinite Queries** - useInfiniteQuery for large lists
4. **Request Deduplication** - Prevent duplicate network requests
5. **Offline Support** - Cache-first strategy with sync
6. **Undo/Redo** - Track mutation history
7. **Real-time Sync** - WebSocket subscriptions
8. **Advanced Filtering** - Repository-level filtering optimization
