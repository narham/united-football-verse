# Identity Document UI Integration - Next Steps

## Immediate Work Items

### 1️⃣ PLAYER FORM ENHANCEMENT

**File:** `src/components/forms/player-form.tsx` (or create if doesn't exist)

**Requirements:**

```typescript
// Step 1: Add citizenship selector to form
<FormField
  name="citizenship"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Kewarganegaraan</FormLabel>
      <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih kewarganegaraan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="INDONESIAN">Indonesia</SelectItem>
          <SelectItem value="FOREIGN">Asing</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>

// Step 2: Conditionally show NIK for Indonesian citizens
{citizenship === "INDONESIAN" && (
  <FormField
    name="nik"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nomor Identitas Nasional (NIK)</FormLabel>
        <FormControl>
          <Input 
            placeholder="3271001203080001"
            maxLength="16"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              field.onChange(value);
            }}
          />
        </FormControl>
        {errors.nik && <FormMessage>{errors.nik}</FormMessage>}
      </FormItem>
    )}
  />
)}

// Step 3: Conditionally show Passport/KITAS for foreign citizens
{citizenship === "FOREIGN" && (
  <>
    <FormField
      name="documentType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Jenis Dokumen</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis dokumen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PASSPORT">Paspor</SelectItem>
              <SelectItem value="KITAS">KITAS</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
    
    <FormField
      name="documentNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nomor Dokumen</FormLabel>
          <FormControl>
            <Input placeholder="M12345678" />
          </FormControl>
          {errors.documentNumber && <FormMessage>{errors.documentNumber}</FormMessage>}
        </FormItem>
      )}
    />
    
    <FormField
      name="issuingCountry"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Negara Penerbit</FormLabel>
          <FormControl>
            <Input placeholder="Malaysia" />
          </FormControl>
        </FormItem>
      )}
    />
    
    <FormField
      name="issuedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tanggal Terbit</FormLabel>
          <FormControl>
            <input type="date" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
    
    <FormField
      name="expiresAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tanggal Kedaluwarsa</FormLabel>
          <FormControl>
            <input type="date" {...field} />
          </FormControl>
          {errors.expiresAt && <FormMessage>{errors.expiresAt}</FormMessage>}
        </FormItem>
      )}
    />
  </>
)}
```

**Integration with Mutations:**

```typescript
import { useCreateIdentityDocument, useUpdateIdentityDocument } from "@/hooks/useIdentityDocuments"

const createMutation = useCreateIdentityDocument()
const updateMutation = useUpdateIdentityDocument()

// On form submit:
async function onSubmit(values) {
  try {
    // Create player first
    const player = await createPlayer(values)
    
    // If citizenship selected, create identity document
    if (values.citizenship === "INDONESIAN" && values.nik) {
      await createMutation.mutateAsync({
        playerId: player.id,
        documentType: "NIK",
        documentNumber: values.nik,
        issuingCountry: "Indonesia"
      })
    } else if (values.citizenship === "FOREIGN" && values.documentNumber) {
      await createMutation.mutateAsync({
        playerId: player.id,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        issuingCountry: values.issuingCountry,
        issuedAt: values.issuedAt,
        expiresAt: values.expiresAt
      })
    }
    
    // Show success
    toast.success("Pemain berhasil dibuat")
  } catch (error) {
    if (error.message.includes("duplicate")) {
      toast.error("Nomor dokumen sudah terdaftar")
    } else {
      toast.error(error.message)
    }
  }
}
```

**Validation Before Submit:**

```typescript
import { 
  validateNIK, 
  validatePassport, 
  validateKITAS,
  isExpired 
} from "@/domain/identity"

// In form validation schema:
const schema = z.object({
  citizenship: z.enum(["INDONESIAN", "FOREIGN"]),
  
  nik: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      const { isValid, error } = validateNIK(val);
      if (!isValid) {
        throw new Error(error);
      }
      return true;
    }, { message: "NIK tidak valid" }),
    
  documentType: z.enum(["PASSPORT", "KITAS"]).optional(),
  
  documentNumber: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      const docType = form.getValues("documentType");
      if (docType === "PASSPORT") {
        const { isValid, error } = validatePassport(val);
        if (!isValid) throw new Error(error);
      } else if (docType === "KITAS") {
        const { isValid, error } = validateKITAS(val);
        if (!isValid) throw new Error(error);
      }
      return true;
    }, { message: "Nomor dokumen tidak valid" }),
    
  expiresAt: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      if (isExpired(val)) {
        throw new Error("Dokumen sudah kedaluwarsa");
      }
      return true;
    }, { message: "Tanggal tidak valid" })
})
```

---

### 2️⃣ PLAYER PROFILE - IDENTITY SECTION

**File:** `src/components/player-identity-section.tsx` (new component)

**Requirements:**

Display masked identity documents with verification status and safe actions.

```typescript
import { useIdentityDocuments } from "@/hooks/useIdentityDocuments"
import { createDisplayModel, getStatusBadgeClass, getStatusIcon } from "@/domain/identity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/domain/identity"

export function PlayerIdentitySection({ playerId, citizenship }) {
  const { data: documents, isLoading } = useIdentityDocuments(playerId)
  
  if (isLoading) return <div>Loading identity documents...</div>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identitas & Kewarganegaraan</CardTitle>
        <CardDescription>Informasi dokumen identitas yang terverifikasi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Citizenship Display */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Kewarganegaraan</span>
          <span className="text-sm">
            {citizenship === "INDONESIAN" ? "Indonesia" : "Asing"}
          </span>
        </div>
        
        {/* Football ID - Always Present */}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm font-medium">ID Sepak Bola</span>
          <span className="font-mono text-sm">FB-{playerId}</span>
        </div>
        
        {/* Identity Documents */}
        {documents && documents.length > 0 ? (
          <div className="border-t pt-4 space-y-3">
            {documents.map((doc) => {
              const display = createDisplayModel(doc)
              return (
                <div key={doc.id} className="space-y-2 pb-3 border-b last:border-b-0">
                  
                  {/* Document Type & Masked Number */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {doc.documentType === "NIK" && "NIK"}
                      {doc.documentType === "PASSPORT" && "Paspor"}
                      {doc.documentType === "KITAS" && "KITAS"}
                    </span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {display.maskedNumber}
                    </code>
                  </div>
                  
                  {/* Issuing Country */}
                  {display.issuingCountry && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Negara Penerbit</span>
                      <span>{display.issuingCountry}</span>
                    </div>
                  )}
                  
                  {/* Dates */}
                  {display.issuedAt && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Tanggal Terbit</span>
                      <span>{formatDate(display.issuedAt)}</span>
                    </div>
                  )}
                  
                  {display.expiresAt && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Berlaku Hingga</span>
                      <span className={display.isExpired ? "text-red-600 font-medium" : ""}>
                        {formatDate(display.expiresAt)}
                      </span>
                    </div>
                  )}
                  
                  {/* Verification Status & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Badge className={getStatusBadgeClass(display.verificationStatus)}>
                      {getStatusIcon(display.verificationStatus)}{" "}
                      {getStatusText(display.verificationStatus)}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {canEditDocument(display.verificationStatus) && (
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-600">
                        Hapus
                      </Button>
                    </div>
                  </div>
                  
                  {/* Safeguarding Note for U-18 */}
                  {age < 18 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
                      ⚠️ Pemain di bawah 18 tahun. Data identitas dilindungi khusus.
                    </div>
                  )}
                  
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            Belum ada dokumen identitas terdaftar
          </div>
        )}
        
      </CardContent>
    </Card>
  )
}
```

**Add to Player Profile View:**

```typescript
// In: src/routes/pemain.$id.tsx (or existing player detail component)

import { PlayerIdentitySection } from "@/components/player-identity-section"

export function PlayerDetailView() {
  const { playerId, player } = usePlayer()
  
  return (
    <div className="space-y-6">
      <BasicPlayerInfo player={player} />
      <StatisticsSection player={player} />
      
      {/* ADD THIS */}
      <PlayerIdentitySection 
        playerId={playerId} 
        citizenship={player.citizenship}
        age={player.age}
      />
      
      <ActivitySection player={player} />
    </div>
  )
}
```

---

### 3️⃣ IDENTITY DOCUMENT MODALS

**Files:** 
- `src/components/modals/identity-document-modal.tsx` (Create/Edit)
- `src/components/modals/identity-delete-confirmation.tsx` (Delete)

#### Create/Edit Modal

```typescript
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { useCreateIdentityDocument, useUpdateIdentityDocument } from "@/hooks/useIdentityDocuments"
import { validateIdentityDocument } from "@/domain/identity"
import { toast } from "sonner"

export function IdentityDocumentModal({ 
  playerId, 
  document,  // undefined for create, populated for edit
  isOpen, 
  onClose 
}) {
  const createMutation = useCreateIdentityDocument()
  const updateMutation = useUpdateIdentityDocument()
  const form = useForm({
    defaultValues: document || {
      documentType: "PASSPORT",
      documentNumber: "",
      issuingCountry: "",
      issuedAt: "",
      expiresAt: ""
    }
  })
  
  async function onSubmit(values) {
    try {
      // Validate
      const validation = validateIdentityDocument(
        values.documentType,
        values.documentNumber,
        values.issuingCountry,
        values.expiresAt
      )
      
      if (!validation.isValid) {
        toast.error(validation.error)
        return
      }
      
      // Create or update
      if (document) {
        await updateMutation.mutateAsync({
          id: document.id,
          ...values
        })
        toast.success("Dokumen berhasil diperbarui")
      } else {
        await createMutation.mutateAsync({
          playerId,
          clubId: getCurrentClubId(), // Get from context
          ...values
        })
        toast.success("Dokumen berhasil ditambahkan")
      }
      
      onClose()
    } catch (error) {
      if (error.message.includes("duplicate")) {
        toast.error("Nomor dokumen sudah terdaftar")
      } else {
        toast.error(error.message)
      }
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {document ? "Edit Dokumen Identitas" : "Tambah Dokumen Identitas"}
          </DialogTitle>
          <DialogDescription>
            {document ? "Perbarui informasi dokumen" : "Tambahkan dokumen identitas pemain"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Document Type Select */}
          <FormField name="documentType" />
          
          {/* Number Input */}
          <FormField name="documentNumber" />
          
          {/* Country Input */}
          <FormField name="issuingCountry" />
          
          {/* Issued Date */}
          <FormField name="issuedAt" />
          
          {/* Expires Date */}
          <FormField name="expiresAt" />
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {document ? "Perbarui" : "Tambahkan"}
            </Button>
          </div>
          
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

#### Delete Confirmation Modal

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteIdentityDocument } from "@/hooks/useIdentityDocuments"
import { toast } from "sonner"

export function DeleteIdentityDocumentDialog({
  document,
  isOpen,
  onClose
}) {
  const deleteMutation = useDeleteIdentityDocument()
  
  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(document.id)
      toast.success("Dokumen berhasil dihapus")
      onClose()
    } catch (error) {
      toast.error("Gagal menghapus dokumen")
    }
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Dokumen Identitas?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Dokumen identitas akan dihapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2">
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## Priority Order

### Phase 1: Foundation (1-2 hours)
1. Player Form - add citizenship selector + conditional NIK input
2. Test with demo data - verify validation works
3. Verify form submits correctly

### Phase 2: Display (1-2 hours)
4. Player Identity Section - display masked documents
5. Add to player profile view
6. Verify masking works correctly

### Phase 3: CRUD (2-3 hours)
7. Create Identity Document Modal
8. Edit modal (using same component)
9. Delete confirmation dialog
10. Wire all mutations to player identity section buttons

### Phase 4: Refinement (1 hour)
11. Add error handling & toast messages
12. Test all validation error messages
13. Mobile responsive check
14. Dark mode verification

### Phase 5: Testing & Cleanup (1-2 hours)
15. Manual CRUD flow testing
16. Duplicate detection testing
17. Expiration status testing
18. Accessibility audit (keyboard nav, screen readers)
19. Build & compile check

---

## File Location Reference

```
src/
  components/
    player-form.tsx                    ← Modify (add citizenship + identity fields)
    player-identity-section.tsx        ← Create (NEW)
    modals/
      identity-document-modal.tsx      ← Create (NEW)
      identity-delete-confirmation.tsx ← Create (NEW)
  
  routes/
    pemain.$id.tsx                     ← Modify (add identity section to profile)
  
  hooks/
    useIdentityDocuments.tsx           ✅ Already complete
  
  domain/
    identity/                          ✅ Already complete
  
  repositories/                        ✅ Already complete
```

---

## Implementation Tips

### ✅ What's Already Done
- All validation rules
- All masking/display logic
- All query hooks
- All demo data
- Repository pattern
- TypeScript types

### ⚠️ What Needs Attention
- Real-time validation feedback UI
- Duplicate error handling UX
- Conditional field visibility
- Form state management
- Modal state management
- Error message styling
- Toast/notification placement

### 🎯 Testing Focus
- Validation error messages appear correctly
- Masking shows only last 4 chars
- Full numbers never visible
- Duplicate detection blocks submissions
- Expiration dates update status automatically
- Mobile form is usable
- Dark mode readable

---

## Success Criteria

✅ All CRUD operations work in form  
✅ Player identity section displays correctly  
✅ Masking never shows full numbers  
✅ Validation error messages helpful  
✅ Duplicate detection prevents resubmission  
✅ Edit/delete buttons functional  
✅ TypeScript 0 errors  
✅ Build passes  
✅ Mobile responsive  
✅ Dark mode works  
✅ All 22 requirements from original brief validated  

