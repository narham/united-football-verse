/**
 * Player Form Component
 * Handles creation and editing of player records with citizenship and identity document support
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatePlayer, useUpdatePlayer } from "@/hooks/usePlayers";
import { useCreateIdentityDocument } from "@/hooks/useIdentityDocuments";
import {
  validateNIK,
  validatePassport,
  validateKITAS,
  normalizeDocumentNumber,
} from "@/domain/identity";
import type { Player } from "@/lib/demo-data";

// ============================================================
// Validation Schema
// ============================================================

const playerFormSchema = z.object({
  // Basic info
  name: z.string().min(2, "Nama harus minimal 2 karakter").max(100, "Nama terlalu panjang"),
  nomor: z.coerce.number().int().min(1, "Nomor harus minimal 1").max(99, "Nomor maksimal 99"),
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi"),
  posisi: z.enum(["GK", "DF", "MF", "FW"], {
    errorMap: () => ({ message: "Pilih posisi yang valid" }),
  }),
  status: z.enum(["Aktif", "Cadangan", "Cedera", "Nonaktif"], {
    errorMap: () => ({ message: "Pilih status yang valid" }),
  }),
  tinggi: z.coerce.number().int().min(140, "Tinggi minimal 140 cm").max(220, "Tinggi maksimal 220 cm"),
  berat: z.coerce.number().int().min(30, "Berat minimal 30 kg").max(150, "Berat maksimal 150 kg"),
  kaki: z.enum(["Kiri", "Kanan"], {
    errorMap: () => ({ message: "Pilih kaki yang dominan" }),
  }),

  // Citizenship & Identity
  citizenship: z.enum(["INDONESIAN", "FOREIGN"], {
    errorMap: () => ({ message: "Pilih kewarganegaraan" }),
  }).optional(),

  // For Indonesian citizens: NIK
  nik: z.string().optional(),

  // For Foreign citizens: Document type & details
  documentType: z.enum(["PASSPORT", "KITAS"]).optional(),
  documentNumber: z.string().optional(),
  issuingCountry: z.string().optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

// ============================================================
// Component Props
// ============================================================

interface PlayerFormProps {
  player?: Player; // If provided, form is in edit mode
  onSuccess?: () => void;
}

// ============================================================
// Player Form Component
// ============================================================

export function PlayerForm({ player, onSuccess }: PlayerFormProps) {
  const navigate = useNavigate();
  const createPlayerMutation = useCreatePlayer();
  const updatePlayerMutation = useUpdatePlayer();
  const createIdentityDocumentMutation = useCreateIdentityDocument();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: player
      ? {
          name: player.name,
          nomor: player.nomor,
          tanggalLahir: player.tanggalLahir,
          posisi: player.posisi,
          status: player.status,
          tinggi: player.tinggi,
          berat: player.berat,
          kaki: player.kaki,
          citizenship: player.citizenship,
        }
      : {
          name: "",
          nomor: 1,
          tanggalLahir: "",
          posisi: "FW",
          status: "Aktif",
          tinggi: 175,
          berat: 70,
          kaki: "Kanan",
          citizenship: undefined,
          nik: "",
          documentType: "PASSPORT",
          documentNumber: "",
          issuingCountry: "",
          issuedAt: "",
          expiresAt: "",
        },
  });

  const citizenship = form.watch("citizenship");
  const documentType = form.watch("documentType");

  // ============================================================
  // Form Submission
  // ============================================================

  async function onSubmit(values: PlayerFormValues) {
    try {
      setIsSubmitting(true);

      // Step 1: Create or update player
      let playerId: string;

      if (player) {
        // Update existing player
        const playerData: any = {
          name: values.name,
          nomor: values.nomor,
          tanggalLahir: values.tanggalLahir,
          posisi: values.posisi,
          status: values.status,
          tinggi: values.tinggi,
          berat: values.berat,
          kaki: values.kaki,
        };
        if (values.citizenship !== undefined) {
          playerData.citizenship = values.citizenship;
        }
        const updated = await updatePlayerMutation.mutateAsync({
          id: player.id,
          data: playerData,
        });
        playerId = updated.id;
        toast.success("Pemain berhasil diperbarui");
      } else {
        // Create new player
        const playerData: any = {
          name: values.name,
          nomor: values.nomor,
          tanggalLahir: values.tanggalLahir,
          posisi: values.posisi,
          status: values.status,
          tinggi: values.tinggi,
          berat: values.berat,
          kaki: values.kaki,
        };
        if (values.citizenship !== undefined) {
          playerData.citizenship = values.citizenship;
        }
        const created = await createPlayerMutation.mutateAsync(playerData);
        playerId = created.id;
        toast.success("Pemain berhasil dibuat");
      }

      // Step 2: Create identity document if provided
      if (citizenship === "INDONESIAN" && values.nik) {
        // Validate NIK
        const validation = validateNIK(values.nik);
        if (!validation.isValid) {
          toast.error(validation.error || "NIK tidak valid");
          setIsSubmitting(false);
          return;
        }

        // Create NIK document
        await createIdentityDocumentMutation.mutateAsync({
          playerId,
          documentType: "NIK",
          documentNumber: normalizeDocumentNumber("NIK", values.nik),
          issuingCountry: "Indonesia",
        });
        toast.success("Dokumen NIK berhasil ditambahkan");
      } else if (citizenship === "FOREIGN" && values.documentNumber && values.documentType) {
        // Validate document
        let validation;
        if (values.documentType === "PASSPORT") {
          validation = validatePassport(values.documentNumber);
        } else if (values.documentType === "KITAS") {
          validation = validateKITAS(
            values.documentNumber,
            values.issuingCountry,
            values.expiresAt
          );
        }

        if (validation && !validation.isValid) {
          toast.error(validation.error || "Dokumen tidak valid");
          setIsSubmitting(false);
          return;
        }

        // Create foreign document
        const docData: any = {
          playerId,
          documentType: values.documentType,
          documentNumber: normalizeDocumentNumber(values.documentType, values.documentNumber),
          issuingCountry: values.issuingCountry || "",
        };
        if (values.issuedAt) {
          docData.issuedAt = values.issuedAt;
        }
        if (values.expiresAt) {
          docData.expiresAt = values.expiresAt;
        }
        await createIdentityDocumentMutation.mutateAsync(docData);
        toast.success("Dokumen identitas berhasil ditambahkan");
      }

      // Navigate back or call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        await navigate({ to: "/pemain/$id", params: { id: playerId } });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      if (error instanceof Error) {
        if (error.message.includes("duplicate")) {
          toast.error("Nomor dokumen sudah terdaftar");
        } else {
          toast.error(error.message || "Terjadi kesalahan");
        }
      } else {
        toast.error("Terjadi kesalahan saat menyimpan");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Biodata Pemain</TabsTrigger>
              <TabsTrigger value="identity">Identitas & Kewarganegaraan</TabsTrigger>
            </TabsList>

            {/* ============================================================ */}
            {/* TAB 1: BASIC PLAYER INFORMATION */}
            {/* ============================================================ */}

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>
                    Data pribadi dan fisik pemain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: Bagas Pratama"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number & Position */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Jersey</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1-99"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="posisi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posisi</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih posisi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GK">Penjaga Gawang (GK)</SelectItem>
                              <SelectItem value="DF">Bek (DF)</SelectItem>
                              <SelectItem value="MF">Gelandang (MF)</SelectItem>
                              <SelectItem value="FW">Penyerang (FW)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Birth Date */}
                  <FormField
                    control={form.control}
                    name="tanggalLahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Pemain</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Cadangan">Cadangan</SelectItem>
                            <SelectItem value="Cedera">Cedera</SelectItem>
                            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tinggi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tinggi Badan (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="175"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="berat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Berat Badan (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="70"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dominant Foot */}
                  <FormField
                    control={form.control}
                    name="kaki"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kaki Dominan</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kaki dominan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kanan">Kanan</SelectItem>
                            <SelectItem value="Kiri">Kiri</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============================================================ */}
            {/* TAB 2: CITIZENSHIP & IDENTITY DOCUMENTS */}
            {/* ============================================================ */}

            <TabsContent value="identity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kewarganegaraan & Identitas</CardTitle>
                  <CardDescription>
                    Informasi dokumen identitas pemain (opsional untuk pendaftaran awal)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Citizenship Selector */}
                  <FormField
                    control={form.control}
                    name="citizenship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kewarganegaraan</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(val) =>
                            field.onChange(val as "INDONESIAN" | "FOREIGN" | undefined)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kewarganegaraan (opsional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INDONESIAN">Indonesia</SelectItem>
                            <SelectItem value="FOREIGN">Asing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Opsional. Jika diisi, dokumen identitas akan dibuat secara otomatis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ============================================================ */}
                  {/* INDONESIAN CITIZEN: NIK */}
                  {/* ============================================================ */}

                  {citizenship === "INDONESIAN" && (
                    <div className="space-y-4 rounded-lg border border-field/20 bg-field/5 p-4">
                      <h4 className="font-medium text-field">Nomor Identitas Nasional (NIK)</h4>

                      <FormField
                        control={form.control}
                        name="nik"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIK (16 digit)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="3271001203080001"
                                maxLength={16}
                                onChange={(e) => {
                                  // Allow only digits
                                  const value = e.target.value.replace(/\D/g, "");
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Masukkan NIK yang valid (16 digit angka)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* FOREIGN CITIZEN: PASSPORT / KITAS */}
                  {/* ============================================================ */}

                  {citizenship === "FOREIGN" && (
                    <div className="space-y-4 rounded-lg border border-energetic/20 bg-energetic/5 p-4">
                      <h4 className="font-medium text-energetic-foreground">
                        Dokumen Identitas Asing
                      </h4>

                      {/* Document Type */}
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jenis Dokumen</FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih jenis dokumen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PASSPORT">Paspor</SelectItem>
                                <SelectItem value="KITAS">KITAS</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                  documentType === "KITAS"
                                    ? "2C98765432"
                                    : "M12345678"
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Format: 5-20 karakter alfanumerik
                            </FormDescription>
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
                              <Input
                                placeholder="Contoh: Malaysia, Inggris, Belanda"
                                {...field}
                              />
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
                            <FormLabel>Tanggal Terbit</FormLabel>
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
                              {documentType === "KITAS" && (
                                <span className="text-field"> *</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              {documentType === "KITAS"
                                ? "Wajib diisi untuk KITAS"
                                : "Opsional"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ============================================================ */}
          {/* FORM ACTIONS */}
          {/* ============================================================ */}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/pemain" })}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                createPlayerMutation.isPending ||
                updatePlayerMutation.isPending ||
                createIdentityDocumentMutation.isPending
              }
            >
              {isSubmitting ? "Menyimpan..." : player ? "Perbarui Pemain" : "Buat Pemain"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
