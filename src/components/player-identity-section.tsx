/**
 * Player Identity Section Component
 * Displays identity documents with verification status on player profile
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldAlert, CheckCircle, Clock, XCircle } from "lucide-react";
import { useIdentityDocuments } from "@/hooks/useIdentityDocuments";
import {
  createDisplayModel,
  getStatusBadgeClass,
  getStatusIcon,
  formatDate,
  canEditDocument,
  canDeleteDocument,
  getWarningMessage,
} from "@/domain/identity";
import {
  EditIdentityDocumentModal,
  DeleteIdentityDocumentDialog,
} from "@/components/modals/identity-document-modals";
import type { IdentityDocument } from "@/domain/identity/identity-document";
import type { Player } from "@/lib/demo-data";

interface PlayerIdentitySectionProps {
  player: Player;
  onEditDocument?: (documentId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
}

export function PlayerIdentitySection({
  player,
  onEditDocument,
  onDeleteDocument,
}: PlayerIdentitySectionProps) {
  const { data: documents = [], isLoading } = useIdentityDocuments(player.id);
  const [editingDocument, setEditingDocument] = useState<IdentityDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<IdentityDocument | null>(null);

  // Helper function to get document type label
  function getDocumentTypeLabel(
    docType: "NIK" | "PASSPORT" | "KITAS"
  ): string {
    const labels: Record<string, string> = {
      NIK: "NIK",
      PASSPORT: "Paspor",
      KITAS: "KITAS",
    };
    return labels[docType] || docType;
  }

  // Helper function to calculate age
  function calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  const playerAge = calculateAge(player.tanggalLahir);
  const isMinor = playerAge < 18;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identitas & Kewarganegaraan</CardTitle>
        <CardDescription>
          Informasi dokumen identitas yang terverifikasi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Citizenship Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Kewarganegaraan</span>
          {player.citizenship ? (
            <Badge variant="outline">
              {player.citizenship === "INDONESIAN" ? "🇮🇩 Indonesia" : "🌍 Asing"}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">Tidak diisi</span>
          )}
        </div>

        {/* Football ID */}
        <div className="border-t pt-4 flex items-center justify-between">
          <span className="text-sm font-medium">ID Sepak Bola</span>
          <span className="font-mono text-sm bg-field/10 text-field px-2 py-1 rounded">
            {player.football_id}
          </span>
        </div>

        {/* Safeguarding Notice for Minors */}
        {isMinor && (
          <div className="border-t pt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium">Perlindungan Data Pemain Muda</p>
              <p className="text-xs mt-1">
                Pemain berusia di bawah 18 tahun. Data identitas dilindungi sesuai regulasi anak.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="border-t pt-4 text-center py-4 text-sm text-muted-foreground">
            Memuat dokumen identitas...
          </div>
        )}

        {/* No Documents State */}
        {!isLoading && documents.length === 0 && (
          <div className="border-t pt-4 text-center py-4 text-sm text-muted-foreground">
            Belum ada dokumen identitas terdaftar
          </div>
        )}

        {/* Documents List */}
        {!isLoading && documents.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            {documents.map((doc) => {
              const display = createDisplayModel(doc);

              return (
                <div
                  key={doc.id}
                  className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  {/* Document Header: Type & Masked Number */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {getDocumentTypeLabel(doc.documentType)}
                    </span>
                    <code className="text-xs bg-muted px-2.5 py-1.5 rounded font-mono">
                      {display.maskedNumber}
                    </code>
                  </div>

                  {/* Issuing Country */}
                  {display.issuingCountry && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Negara Penerbit</span>
                      <span>{display.issuingCountry}</span>
                    </div>
                  )}

                  {/* Issue Date */}
                  {display.issuedAt && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tanggal Terbit</span>
                      <span>{formatDate(display.issuedAt)}</span>
                    </div>
                  )}

                  {/* Expiration Date */}
                  {display.expiresAt && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Berlaku Hingga</span>
                      <span
                        className={
                          display.isExpired
                            ? "font-medium text-loss"
                            : "text-muted-foreground"
                        }
                      >
                        {formatDate(display.expiresAt)}
                      </span>
                    </div>
                  )}

                  {/* Verification Status Badge & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Badge className={getStatusBadgeClass(display.verificationStatus)}>
                      <span className="mr-1.5">{getStatusIcon(display.verificationStatus)}</span>
                      {getStatusText(display.verificationStatus)}
                    </Badge>

                    <div className="flex gap-2">
                      {canEditDocument(display.verificationStatus) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDocument(doc)}
                          className="h-7 text-xs"
                        >
                          Edit
                        </Button>
                      )}
                      {canDeleteDocument(display.verificationStatus) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingDocument(doc)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Warning Message for Expired/Pending */}
                  {(display.verificationStatus === "EXPIRED" ||
                    display.verificationStatus === "PENDING") && (
                    <div className="text-xs bg-amber-50 border border-amber-200 rounded p-2 mt-2 text-amber-900">
                      {display.verificationStatus === "EXPIRED"
                        ? "⏰ Dokumen identitas telah kedaluwarsa. Silakan perbarui."
                        : "⏳ Dokumen sedang menunggu verifikasi oleh admin."}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Modals */}
      <EditIdentityDocumentModal
        document={editingDocument}
        isOpen={!!editingDocument}
        onClose={() => setEditingDocument(null)}
      />
      <DeleteIdentityDocumentDialog
        document={deletingDocument}
        isOpen={!!deletingDocument}
        onClose={() => setDeletingDocument(null)}
      />
    </Card>
  );
}

/**
 * Helper: Get verification status text in Indonesian
 */
function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    UNVERIFIED: "Belum Verifikasi",
    PENDING: "Menunggu Verifikasi",
    VERIFIED: "Terverifikasi",
    REJECTED: "Ditolak",
    EXPIRED: "Kedaluwarsa",
  };
  return texts[status] || status;
}
