/**
 * Identity Document Modals
 * Handles create, edit, and delete operations for identity documents
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateIdentityDocument, useDeleteIdentityDocument } from "@/hooks/useIdentityDocuments";
import {
  validatePassport,
  validateKITAS,
  normalizeDocumentNumber,
  isExpired,
} from "@/domain/identity";
import type { IdentityDocument } from "@/domain/identity/identity-document";

// ============================================================
// Validation Schema for Edit Form
// ============================================================

const editIdentityDocumentSchema = z.object({
  documentNumber: z.string().min(5, "Nomor dokumen minimal 5 karakter").max(20, "Nomor dokumen maksimal 20 karakter"),
  issuingCountry: z.string().min(1, "Negara penerbit harus diisi"),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
}).refine(
  (data) => {
    // If document type is KITAS, expiresAt is required
    if (data.expiresAt && isExpired(data.expiresAt)) {
      return false;
    }
    return true;
  },
  { message: "Tanggal kedaluwarsa tidak boleh di masa lalu", path: ["expiresAt"] }
);

type EditIdentityDocumentValues = z.infer<typeof editIdentityDocumentSchema>;

// ============================================================
// Edit Identity Document Modal
// ============================================================

interface EditIdentityDocumentModalProps {
  document: IdentityDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditIdentityDocumentModal({
  document,
  isOpen,
  onClose,
}: EditIdentityDocumentModalProps) {
  const updateMutation = useUpdateIdentityDocument();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditIdentityDocumentValues>({
    resolver: zodResolver(editIdentityDocumentSchema),
    defaultValues: {
      documentNumber: "",
      issuingCountry: "",
      issuedAt: "",
      expiresAt: "",
    },
  });

  // Update form when document changes
  useEffect(() => {
    if (document) {
      form.reset({
        documentNumber: document.documentNumber,
        issuingCountry: document.issuingCountry,
        issuedAt: document.issuedAt || "",
        expiresAt: document.expiresAt || "",
      });
    }
  }, [document, form]);

  async function onSubmit(values: EditIdentityDocumentValues) {
    if (!document) return;

    try {
      setIsSubmitting(true);

      // Validate based on document type
      if (document.documentType === "PASSPORT") {
        const validation = validatePassport(values.documentNumber);
        if (!validation.isValid) {
          toast.error(validation.error || "Nomor paspor tidak valid");
          return;
        }
      } else if (document.documentType === "KITAS") {
        const validation = validateKITAS(
          values.documentNumber,
          values.issuingCountry,
          values.expiresAt
        );
        if (!validation.isValid) {
          toast.error(validation.error || "Data KITAS tidak valid");
          return;
        }
      }

      // Update document
      const updateData: any = {
        documentNumber: normalizeDocumentNumber(document.documentType, values.documentNumber),
        issuingCountry: values.issuingCountry,
      };

      if (values.issuedAt) {
        updateData.issuedAt = values.issuedAt;
      }
      if (values.expiresAt) {
        updateData.expiresAt = values.expiresAt;
      }

      await updateMutation.mutateAsync({
        id: document.id,
        data: updateData,
      });

      toast.success("Dokumen berhasil diperbarui");
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Gagal memperbarui dokumen");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!document) return null;

  const getDocumentTypeLabel = (): string => {
    if (document.documentType === "PASSPORT") return "Paspor";
    if (document.documentType === "KITAS") return "KITAS";
    return document.documentType;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Dokumen Identitas</DialogTitle>
          <DialogDescription>
            Perbarui informasi dokumen {getDocumentTypeLabel()} pemain
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Document Type Badge (Read-only) */}
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">Jenis Dokumen</p>
              <Badge variant="secondary">{getDocumentTypeLabel()}</Badge>
            </div>

            {/* Document Number */}
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Dokumen</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        document.documentType === "KITAS" ? "2C98765432" : "M12345678"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>5-20 karakter alfanumerik</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issuing Country */}
            <FormField
              control={form.control}
              name="issuingCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Negara Penerbit</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Malaysia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issued Date */}
            <FormField
              control={form.control}
              name="issuedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Terbit (Opsional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiration Date */}
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tanggal Kedaluwarsa
                    {document.documentType === "KITAS" && (
                      <span className="text-field"> *</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    {document.documentType === "KITAS"
                      ? "Wajib diisi untuk KITAS"
                      : "Opsional"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
              >
                {isSubmitting ? "Menyimpan..." : "Perbarui"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Delete Identity Document Confirmation Dialog
// ============================================================

interface DeleteIdentityDocumentDialogProps {
  document: IdentityDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteIdentityDocumentDialog({
  document,
  isOpen,
  onClose,
}: DeleteIdentityDocumentDialogProps) {
  const deleteMutation = useDeleteIdentityDocument();

  const handleDelete = async () => {
    if (!document) return;

    try {
      await deleteMutation.mutateAsync(document.id);
      toast.success("Dokumen berhasil dihapus");
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Gagal menghapus dokumen");
      }
    }
  };

  if (!document) return null;

  const getDocumentTypeLabel = (): string => {
    if (document.documentType === "PASSPORT") return "Paspor";
    if (document.documentType === "KITAS") return "KITAS";
    return "Dokumen Identitas";
  };

  const getMaskedNumber = (): string => {
    const last4 = document.documentNumber.slice(-4);
    const masked = "•".repeat(Math.max(8, document.documentNumber.length - 4));
    return masked + last4;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Dokumen Identitas?</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2 mt-2">
              <p>Anda akan menghapus:</p>
              <div className="bg-muted/50 rounded p-2 space-y-1 text-sm">
                <p className="font-medium">{getDocumentTypeLabel()}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {getMaskedNumber()}
                </p>
              </div>
              <p className="text-sm">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
