# Frontend Data Flow Architecture

## Complete Data Flow Diagrams

### 1. Read Flow (Query)

```
┌──────────────┐
│  Component   │
│  (Route)     │
└──────┬───────┘
       │ calls
       ▼
┌──────────────────────┐
│  usePlayers()        │
│  (TanStack Query)    │
└──────┬───────────────┘
       │ queryFn
       ▼
┌──────────────────────┐
│  useRepositories()   │
│  (Context)           │
└──────┬───────────────┘
       │ repositories.player.list()
       ▼
┌──────────────────────┐
│  DemoPlayerRepository│
│  .list()             │
└──────┬───────────────┘
       │ storage.get()
       ▼
┌──────────────────────┐
│  DemoStorage         │
│  localStorage        │
└──────────────────────┘
```

**State at Each Layer:**

| Layer | State |
|-------|-------|
| Component | `isLoading`, `error`, `data` |
| Hook | Query cache managed by TanStack Query |
| Repository | In-memory data with search/filter applied |
| Storage | Raw JSON from localStorage |

### 2. Write Flow (Mutation)

```
┌──────────────┐
│  Component   │
│  (Form)      │
└──────┬───────┘
       │ handleSubmit()
       ▼
┌──────────────────────┐
│ useCreatePlayer()    │
│ .mutateAsync()       │
└──────┬───────────────┘
       │ mutationFn
       ▼
┌──────────────────────┐
│  useRepositories()   │
│  (Context)           │
└──────┬───────────────┘
       │ repositories.player.create()
       ▼
┌──────────────────────┐
│  DemoPlayerRepository│
│  .create()           │
│  - Validate input    │
│  - Generate ID       │
│  - Create object     │
│  - Log activity      │
│  - Create notification
└──────┬───────────────┘
       │ storage.set()
       ▼
┌──────────────────────┐
│  DemoStorage         │
│  localStorage        │
└──────┬───────────────┘
       │ onSuccess()
       ▼
┌──────────────────────┐
│ Query Invalidation   │
│ .invalidateQueries() │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  TanStack Query      │
│  Refetch             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Component Re-render │
│  (New Data)          │
└──────────────────────┘
```

### 3. Search/Filter Flow

```
┌──────────────┐
│  Component   │
│  Input Search
└──────┬───────┘
       │ setQ("search term")
       ▼
┌──────────────────────┐
│  useMemo filtered    │
│  (Client-side)       │
└──────┬───────────────┘
       │ OR
       ▼
┌──────────────────────┐
│  usePlayers({        │
│    search: q,        │
│    position: pos     │
│  })                  │
└──────┬───────────────┘
       │ queryFn with params
       ▼
┌──────────────────────┐
│  repository.list()   │
│  (params applied)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Filter logic        │
│  - By search term    │
│  - By position       │
│  - By status         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Return filtered data│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Component renders   │
│  filtered list       │
└──────────────────────┘
```

### 4. Cache Invalidation Flow

```
Create/Update/Delete Mutation
        ↓
On Success
        ↓
queryClient.invalidateQueries({
  queryKey: ['players']
})
        ↓
TanStack Query finds all queries
with 'players' in key
        ↓
Mark as stale
        ↓
Components using these queries
are notified
        ↓
Refetch triggered (if component mounted)
        ↓
New data fetched
        ↓
Component re-renders with fresh data
```

## Component Integration Pattern

### Full CRUD Page Example

```
PemainPage (Route Component)
├── usePlayers() ──────────► Query: list all players
├── useCreatePlayer() ──────► Mutation: create
├── useUpdatePlayer() ──────► Mutation: update
├── useDeletePlayer() ──────► Mutation: delete
│
├── UI: Search Bar
│   └── onChange ──────────► setQ() ──────► useMemo filter
│
├── UI: Filter Toggles
│   └── onChange ──────────► setPosisi() ──► useMemo filter
│
├── UI: PlayerTable
│   └── data: filtered[]
│
└── Modals
    ├── CreatePlayerModal
    │   └── handleSubmit() ──► createMutation.mutateAsync()
    │
    ├── EditPlayerModal
    │   └── handleSubmit() ──► updateMutation.mutateAsync()
    │
    └── DeleteConfirm
        └── onConfirm() ────► deleteMutation.mutateAsync()
```

## State Management Layers

### Layer 1: React Local State
```typescript
const [q, setQ] = useState("");              // Search term
const [posisi, setPosisi] = useState("ALL"); // Filter
const [open, setOpen] = useState(false);     // Modal visibility
```

### Layer 2: Component Derived State
```typescript
const filtered = useMemo(
  () => players.filter(p => p.posisi === posisi),
  [players, posisi]
);
```

### Layer 3: TanStack Query Cache
```typescript
const { data: players } = usePlayers();  // Cached on disk
```

### Layer 4: Repository State
```typescript
// In-memory state during query execution
const allPlayers = storage.get("players");
const filtered = allPlayers.filter(...);
return filtered;
```

### Layer 5: Persistent State
```typescript
// localStorage: bolaID.demo.players
[
  { id: "1", name: "John", posisi: "GK" },
  { id: "2", name: "Jane", posisi: "DF" }
]
```

## Error Boundaries

### Error at Repository Level
```typescript
async create(clubId, input) {
  if (!input.name) {
    throw new Error("Nama pemain diperlukan");
  }
}
```
↓ Caught by mutation hook ↓
```typescript
const { mutateAsync, error } = useCreatePlayer();
// error: Error("Nama pemain diperlukan")
```
↓ Rendered in component ↓
```typescript
{error && <ErrorBanner message={error.message} />}
```

### Error at Hook Level
```typescript
const { data, error, isLoading } = usePlayers();

if (error) {
  return <DefaultErrorState message="Failed to load players" />;
}
```

### Error at Query Level
```typescript
queryFn: async () => {
  try {
    return await repositories.player.list();
  } catch (error) {
    throw new Error(`Failed to fetch players: ${error.message}`);
  }
}
```

## Subscription and Reactivity

### Query Subscription Lifecycle

```
Component Mounts
  ↓
useQuery executes queryFn
  ↓
Result cached
  ↓
Component renders with data
  ↓
User navigates away
  ↓
Component unmounts
  ↓
Query unsubscribed (still cached)
  ↓
User navigates back
  ↓
Query already cached (no refetch unless stale)
  ↓
Component re-renders instantly
```

### Mutation Lifecycle

```
Form Submit
  ↓
mutation.mutateAsync(data)
  ↓
Query status: isPending = true
  ↓
Component renders: button disabled, spinner shown
  ↓
Repository executes mutation
  ↓
Success: onSuccess() callback fires
  ↓
Query invalidated
  ↓
Related queries refetch
  ↓
Component re-renders with fresh data
  ↓
Modal closes (if configured)
```

## Concurrent Operations

### Multiple Mutations

```typescript
const createPlayer = useCreatePlayer();
const createStaff = useCreateStaff();

// Both can execute independently
Promise.all([
  createPlayer.mutateAsync(playerData),
  createStaff.mutateAsync(staffData)
]);
```

### Mutation + Query Refetch

```typescript
// Mutation completes
updatePlayer.mutateAsync({ id, data })
  .then(() => {
    // Query auto-refetches due to invalidation
    // Component re-renders twice if UI updates on each
  });
```

### Parallel Queries

```typescript
// All three execute in parallel
const { data: players } = usePlayers();
const { data: staff } = useStaff();
const { data: teams } = useTeams();
```

## Performance Optimizations

### 1. Query Key Specificity

```typescript
// Over-invalidate (slow)
queryClient.invalidateQueries({})  // All queries

// Better
queryClient.invalidateQueries({ queryKey: ['players'] })

// Best
queryClient.invalidateQueries({ queryKey: ['players', 'detail', id] })
```

### 2. Memoization

```typescript
const filtered = useMemo(
  () => players.filter(p => p.status === 'Aktif'),
  [players]  // Only recompute when players changes
);
```

### 3. Lazy Loading

```typescript
const { data: player } = usePlayer(id);
// Only executes when id is truthy
// enabled: !!id prevents unnecessary queries
```

### 4. Pagination

```typescript
const { data } = usePlayers({ 
  page: 1, 
  limit: 20 
});
// Demo repo can implement pagination
// Future Supabase can use cursor-based pagination
```

## Debugging Workflow

### 1. Check Component State
```typescript
console.log({ players, isLoading, error });
```

### 2. Check Query Cache
```typescript
// In DevTools console
queryClient.getQueryData(['players'])
```

### 3. Check Repository State
```typescript
// In repository method
console.log('All players:', allPlayers);
console.log('Filtered:', filtered);
```

### 4. Check localStorage
```javascript
// In browser console
JSON.parse(localStorage.getItem('bolaID.demo.players'))
```

### 5. Enable React Query Devtools
```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
<ReactQueryDevtools initialIsOpen={true} />
```

## State Consistency Patterns

### Optimistic Updates
```typescript
// Assume update succeeds immediately
setLocalState(newValue);

try {
  await mutation.mutateAsync(data);
} catch {
  // Revert if it fails
  setLocalState(oldValue);
}
```

### Eventual Consistency
```typescript
// Mutation succeeds on backend
await mutation.mutateAsync(data);

// Query auto-refetches via invalidation
// Component eventually shows consistent data
```

### Conflict Resolution
```typescript
// Two users edit same player
User A: updatePlayer({ id: "1", name: "John" })
User B: updatePlayer({ id: "1", name: "Jon" })

// Last write wins (demo repo behavior)
// Future Supabase can implement conflict resolution
```

## Testing Patterns

### Mock Repository
```typescript
const mockRepository = {
  player: {
    list: () => Promise.resolve({ data: [...] })
  }
};
```

### Mock Hook
```typescript
jest.mock('@/hooks/usePlayers', () => ({
  usePlayers: () => ({
    data: [],
    isLoading: false,
    error: null
  })
}));
```

### Test Mutation
```typescript
const { mutateAsync } = useCreatePlayer();
await mutateAsync({ name: "Test" });
expect(queryClient.getQueryData(['players'])).toContain({
  name: "Test"
});
```

## Security Considerations

### 1. Input Validation
```typescript
// Repository validates before creating
if (!input.name) throw new Error("Name required");
```

### 2. Authorization (Future)
```typescript
// When Supabase is added, use RLS policies
// Demo repo has no auth, all data accessible
```

### 3. Data Sanitization
```typescript
// Sanitize user input before storage
const sanitized = input.name.trim().slice(0, 100);
```

### 4. localStorage Privacy
```typescript
// Demo uses localStorage (insecure)
// Supabase will use secure backend
```
