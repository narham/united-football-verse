# Frontend CRUD Contract

## Contract Definition

This document defines the contract between the UI layer and the data access layer (repositories + hooks) for all Create, Read, Update, and Delete operations.

## Core Principles

1. **Stateless Contracts** - Hooks return state, not state management functions
2. **Unidirectional Data Flow** - Component → Hook → Repository → Storage
3. **Automatic Invalidation** - Mutations auto-refetch dependent queries
4. **Consistent Error Handling** - All errors follow same pattern
5. **Type Safe** - Full TypeScript support end-to-end

## Read Operations (Query)

### Contract Signature

```typescript
export interface QueryContract<T> {
  data: T | T[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch(): Promise<void>;
  isRefetching?: boolean;
}
```

### List Query

**Hook:**
```typescript
function usePlayers(params?: PlayerListParams): QueryContract<Player[]>
```

**Behavior:**
- Returns array of players (empty array `[]` if none)
- Params optional: `{ search?, position?, status? }`
- Automatic refetch on component mount
- Cache used on navigation back (unless stale)

**Example:**
```typescript
const { data: players = [], isLoading, error } = usePlayers();
const { data: filtered = [] } = usePlayers({ position: "GK" });
```

### Detail Query

**Hook:**
```typescript
function usePlayer(id: string | undefined): QueryContract<Player | null>
```

**Behavior:**
- Returns single player object or null
- Disabled when id is undefined/falsy
- Null when not found (not error)

**Example:**
```typescript
const { data: player } = usePlayer(playerId);
if (!player) return <NotFound />;
```

### Derived Queries

**Hook:**
```typescript
function useActiveSeason(): QueryContract<Season | null>
function usePastMatches(): QueryContract<Match[]>
function useFinanceTotals(): QueryContract<FinanceTotals>
```

**Behavior:**
- Built on same query cache as main queries
- Automatically invalidated when related data changes
- Specific query keys for surgical cache management

**Example:**
```typescript
const { data: active } = useActiveSeason();
const { data: past } = usePastMatches();
```

### Contract Guarantees

| Scenario | Guarantee |
|----------|-----------|
| First load | `isLoading = true`, `data = null` |
| After load | `isLoading = false`, `data = T[]` |
| Refetching | `isRefetching = true`, `data = T[]` |
| Error | `isLoading = false`, `error = Error`, `data = []` |
| Manual refetch | `await refetch()` re-executes queryFn |

## Create Operations (Mutation)

### Contract Signature

```typescript
export interface MutationContract<TInput, TOutput> {
  mutate(
    data: TInput,
    options?: {
      onSuccess?: (data: TOutput) => void;
      onError?: (error: Error) => void;
    }
  ): void;
  
  mutateAsync(data: TInput): Promise<TOutput>;
  
  isPending: boolean;
  error: Error | null;
  data: TOutput | null;
  reset(): void;
}
```

### Player Create

**Hook:**
```typescript
export function useCreatePlayer(): MutationContract<
  CreatePlayerInput,
  Player
>
```

**Input Contract:**
```typescript
export interface CreatePlayerInput {
  name: string;              // Required
  football_id: string;       // Required, unique
  posisi: PlayerPosition;    // Required: "GK" | "DF" | "MF" | "ST"
  status: PlayerStatus;      // Required: "Aktif" | "Cedera" | "Cuti"
  jersey_number?: number;
  birth_date?: string;
  nationality?: string;
  stats?: {
    height?: number;
    weight?: number;
  };
}
```

**Output Contract:**
```typescript
Player {
  id: string;                // Generated UUID
  name: string;
  football_id: string;
  posisi: PlayerPosition;
  status: PlayerStatus;
  jersey_number?: number;
  birth_date?: string;
  nationality?: string;
  stats?: any;
  created_at: string;        // ISO timestamp
  updated_at: string;        // ISO timestamp
  club_id: string;           // "club-default"
}
```

**Behavior:**
- Validates all required fields
- Generates unique ID if not provided
- Sets timestamps
- Returns created object
- On success: invalidates `['players']` and `['players', 'list']` queries
- On error: throws descriptive Error

**Example:**
```typescript
const createMutation = useCreatePlayer();

await createMutation.mutateAsync({
  name: "John Doe",
  football_id: "FIFA123",
  posisi: "GK",
  status: "Aktif"
});

// Component updates automatically
```

**Error States:**
```typescript
// Validation error
throw new Error("Nama pemain diperlukan");

// Duplicate football_id
throw new Error("Football ID sudah terdaftar");

// Storage error
throw new Error("Gagal menyimpan pemain");
```

### Generic Create Pattern

**All Create Hooks Follow:**
```typescript
useCreate[Entity](): MutationContract<Create[Entity]Input, [Entity]>
```

**Invalidation Always:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [domain] })
}
```

**Domains:**
- Players: `useCreatePlayer()`
- Staff: `useCreateStaff()`
- Teams: `useCreateTeam()`
- Seasons: `useCreateSeason()`
- Training: `useCreateTrainingSession()`
- Competitions: `useCreateCompetition()`
- Matches: `useCreateMatch()`
- Transactions: `useCreateTransaction()`

## Update Operations (Mutation)

### Contract Signature

```typescript
export interface UpdateMutationContract<TInput, TOutput> {
  mutateAsync(params: {
    id: string;
    data: TInput;
  }): Promise<TOutput>;
  
  isPending: boolean;
  error: Error | null;
  data: TOutput | null;
}
```

### Player Update

**Hook:**
```typescript
export function useUpdatePlayer(): UpdateMutationContract<
  UpdatePlayerInput,
  Player
>
```

**Input Contract:**
```typescript
export interface UpdatePlayerInput {
  name?: string;
  football_id?: string;
  posisi?: PlayerPosition;
  status?: PlayerStatus;
  jersey_number?: number;
  birth_date?: string;
  nationality?: string;
  stats?: any;
}
```

**Output Contract:**
```typescript
Player {
  // Same as Create output
  // updated_at refreshed
}
```

**Behavior:**
- Partial update (only provided fields changed)
- Validates input (if provided)
- Returns updated object
- On success: invalidates both detail and list queries
- On error: throws descriptive Error

**Example:**
```typescript
const updateMutation = useUpdatePlayer();

await updateMutation.mutateAsync({
  id: "player-123",
  data: {
    status: "Cedera",
    posisi: "MF"
  }
});

// Query auto-refreshes, component updates
```

**Invalidation Pattern:**
```typescript
onSuccess: (data) => {
  queryClient.invalidateQueries({ 
    queryKey: ['players', 'detail', data.id] 
  });
  queryClient.invalidateQueries({ 
    queryKey: ['players', 'list'] 
  });
}
```

### Generic Update Pattern

**All Update Hooks Follow:**
```typescript
useUpdate[Entity](): UpdateMutationContract<
  Update[Entity]Input,
  [Entity]
>
```

**Usage:**
```typescript
await updateMutation.mutateAsync({
  id: entityId,
  data: { ...changes }
});
```

**Error Scenarios:**
```typescript
// Not found
throw new Error("Pemain tidak ditemukan");

// Validation error
throw new Error("Status tidak valid");

// Storage error
throw new Error("Gagal memperbarui pemain");
```

## Delete Operations (Mutation)

### Contract Signature

```typescript
export interface DeleteMutationContract {
  mutateAsync(id: string): Promise<void>;
  
  isPending: boolean;
  error: Error | null;
}
```

### Player Delete

**Hook:**
```typescript
export function useDeletePlayer(): DeleteMutationContract
```

**Input Contract:**
```typescript
id: string  // Entity ID to delete
```

**Output Contract:**
```typescript
void  // No return value
```

**Behavior:**
- Removes entity from storage
- On success: invalidates all queries for entity type
- On error: throws descriptive Error
- No recovery option (confirmation required in UI)

**Example:**
```typescript
const deleteMutation = useDeletePlayer();

await deleteMutation.mutateAsync("player-123");

// All player queries invalidated
// List query refetches without deleted player
// Component updates automatically
```

**Invalidation Pattern:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['players'] });
}
```

### Generic Delete Pattern

**All Delete Hooks Follow:**
```typescript
useDelete[Entity](): DeleteMutationContract
```

**Error Scenarios:**
```typescript
// Not found
throw new Error("Pemain tidak ditemukan");

// Already deleted
throw new Error("Pemain sudah dihapus");

// Storage error
throw new Error("Gagal menghapus pemain");
```

## Input Validation Rules

### Player

| Field | Rules |
|-------|-------|
| `name` | Required, min 1 char, max 255 |
| `football_id` | Required, unique, alphanumeric |
| `posisi` | Required, one of: GK, DF, MF, ST |
| `status` | Required, one of: Aktif, Cedera, Cuti |
| `jersey_number` | Optional, 0-99 |
| `birth_date` | Optional, ISO date |

### Staff

| Field | Rules |
|-------|-------|
| `name` | Required, min 1 char, max 255 |
| `role` | Required, one of: Coach, Asst Coach, Physio, Manager, Doctor |
| `email` | Required, valid email format |
| `phone` | Optional, valid phone |

### Team

| Field | Rules |
|-------|-------|
| `name` | Required, unique, max 255 |
| `city` | Optional, max 100 |
| `founded_year` | Optional, valid year |

### Season

| Field | Rules |
|-------|-------|
| `name` | Required, unique, max 255 |
| `start_date` | Required, ISO date |
| `end_date` | Required, after start_date |
| `is_active` | Optional, boolean |

### Transaction

| Field | Rules |
|-------|-------|
| `amount` | Required, number > 0 |
| `type` | Required, Income or Expense |
| `category` | Required, defined category |
| `description` | Required, max 500 |
| `date` | Required, ISO date, not future |

## Error Handling Contract

### Error Types

```typescript
type MutationError = 
  | ValidationError      // Input validation failed
  | NotFoundError        // Entity not found
  | ConflictError        // Duplicate/conflict
  | StorageError         // localStorage failed
  | UnknownError;        // Unexpected error
```

### Error Propagation

```
Repository throws Error
  ↓
Hook catches in try-catch
  ↓
Mutation.error set
  ↓
Component reads error
  ↓
Display in UI
```

### Component Error Handling

```typescript
const mutation = useCreatePlayer();

const handleSubmit = async (data) => {
  try {
    await mutation.mutateAsync(data);
    toast.success("Pemain berhasil ditambahkan");
  } catch (error) {
    toast.error(error.message);
  }
};

// OR use mutation.error state
{mutation.error && (
  <Alert variant="destructive">
    {mutation.error.message}
  </Alert>
)}
```

## Loading States Contract

### Query Loading

```typescript
const { data, isLoading, isRefetching } = usePlayers();

// First load
isLoading = true
data = null

// Load complete
isLoading = false
data = Player[]

// User refetches
isRefetching = true
data = Player[] (stale data)
```

### Mutation Loading

```typescript
const mutation = useCreatePlayer();

// Before mutation
isPending = false
error = null

// During mutation
isPending = true
error = null

// After success
isPending = false
error = null
data = Player

// After error
isPending = false
error = Error
data = null
```

## Optimistic Updates

### Pattern

```typescript
const updateMutation = useUpdatePlayer();

// Show change immediately
setOptimistic(id, newValue);

try {
  await updateMutation.mutateAsync({ id, data: newValue });
  // Success - no action needed (query refreshes)
} catch (error) {
  // Revert optimistic update
  setOptimistic(id, oldValue);
  showError(error.message);
}
```

### Benefits

- Instant UI feedback
- Better UX perception
- Automatic rollback on error

## Mutation Side Effects

### Auto-Invalidation Rules

| Mutation | Invalidates |
|----------|------------|
| Create Player | `['players']` |
| Update Player | `['players', 'detail', id]` + `['players', 'list']` |
| Delete Player | `['players']` |
| Create Staff | `['staff']` |
| Update Staff | `['staff', 'detail', id]` + `['staff', 'list']` |
| Delete Staff | `['staff']` |
| Create Training | `['training']` |
| Update Training | `['training', 'detail', id]` + `['training', 'list']` + `['training', 'attendance', id]` |
| Delete Training | `['training']` |
| Create Transaction | `['transactions']` + `['finance', 'totals']` + `['finance', 'balance']` |
| Update Transaction | `['transactions']` + `['finance', 'totals']` + `['finance', 'balance']` |
| Delete Transaction | `['transactions']` + `['finance', 'totals']` + `['finance', 'balance']` |

### Custom Invalidation

```typescript
const mutation = useUpdatePlayer();

await mutation.mutateAsync(
  { id, data },
  {
    onSuccess: () => {
      // Auto-invalidation happens
      // Plus custom invalidation
      queryClient.invalidateQueries({
        queryKey: ['player-stats', id]
      });
    }
  }
);
```

## Contract Compliance Checklist

### For All Query Hooks
- [ ] Returns `{ data, isLoading, error, refetch }`
- [ ] Data type matches return type
- [ ] Error is Error object or null
- [ ] Refetch is function
- [ ] Disabled when ID is undefined (detail queries)

### For All Mutation Hooks
- [ ] Returns `{ mutate, mutateAsync, isPending, error, data }`
- [ ] Input is typed TInput
- [ ] Output is typed TOutput
- [ ] isPending boolean during mutation
- [ ] Error is Error object or null after failure
- [ ] mutateAsync returns Promise<TOutput>

### For All Repositories
- [ ] list() returns ListResult<T>
- [ ] getById() returns T | null
- [ ] create() validates input
- [ ] update() supports partial updates
- [ ] delete() throws if not found

### For All Routes
- [ ] Handle isLoading state
- [ ] Handle error state
- [ ] Use hook for data
- [ ] Use mutation for create/update/delete
- [ ] Show loading indicator
- [ ] Show error message
- [ ] Confirm before delete

## Versioning

**Current Version:** 1.0 (Phase 6 STEP 4)

**Changes from Previous:**
- Added formal contract specification
- Defined error handling
- Added invalidation rules
- Added validation rules

**Next Version:**
- Pagination support (Phase 7)
- Offline sync (Phase 8)
- Optimistic updates (Phase 9)
- Real-time subscriptions (Phase 10)
