import "server-only";

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Invoices (notas fiscais) are stored separately from payment receipts so the
// two never get mixed up. They reuse the same Supabase bucket but live under an
// "invoices/" prefix, and fall back to PostgreSQL bytes when Storage is not
// configured — exactly like receipts.
const DEFAULT_BUCKET = "payment-receipts";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MIME_TYPE_BY_EXTENSION = new Map([
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["xml", "application/xml"],
  ["zip", "application/zip"]
]);

export type PreparedPaymentInvoice = {
  data: Uint8Array<ArrayBuffer> | null;
  mimeType: string;
  name: string;
  path: string | null;
  size: number;
};

function getStorageConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET,
    serviceRoleKey,
    url
  };
}

function getStorageClient() {
  const config = getStorageConfig();

  if (!config) {
    throw new Error(
      "Notas fiscais ainda não estão configuradas. Adicione SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    bucket: config.bucket,
    client: createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  };
}

function safeFileName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-120);

  return normalized || "nota-fiscal";
}

export function isPaymentInvoiceStorageConfigured() {
  return Boolean(getStorageConfig());
}

export function validatePaymentInvoice(file: File) {
  if (file.size <= 0) {
    throw new Error("A nota fiscal selecionada está vazia.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A nota fiscal deve ter no máximo 8 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const expectedMimeType = extension ? MIME_TYPE_BY_EXTENSION.get(extension) : null;

  if (!expectedMimeType) {
    throw new Error("Envie a nota fiscal em PDF, XML, PNG, JPG, JPEG, WEBP ou ZIP.");
  }

  // XML and ZIP are reported with inconsistent MIME types across browsers, so we
  // trust the validated extension and only reject when a provided image/pdf type
  // clearly disagrees with the extension.
  if (
    file.type &&
    (expectedMimeType.startsWith("image/") || expectedMimeType === "application/pdf") &&
    file.type !== expectedMimeType
  ) {
    throw new Error("Envie a nota fiscal em PDF, XML, PNG, JPG, JPEG, WEBP ou ZIP.");
  }

  return expectedMimeType;
}

export async function preparePaymentInvoice(
  file: File,
  projectId: string
): Promise<PreparedPaymentInvoice> {
  const mimeType = validatePaymentInvoice(file);
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!isPaymentInvoiceStorageConfigured()) {
    return {
      data: bytes,
      mimeType,
      name: file.name,
      path: null,
      size: file.size
    };
  }

  const { bucket, client } = getStorageClient();
  const path = `invoices/${projectId}/${Date.now()}-${randomBytes(6).toString("hex")}-${safeFileName(file.name)}`;
  const { error } = await client.storage.from(bucket).upload(path, bytes, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false
  });

  if (error) {
    console.error(`[payment-invoices] upload failed (${error.name || "storage-error"})`);
    throw new Error("Não foi possível enviar a nota fiscal para o Storage.");
  }

  return {
    data: null,
    mimeType,
    name: file.name,
    path,
    size: file.size
  };
}

export async function downloadPaymentInvoice(path: string) {
  const { bucket, client } = getStorageClient();
  const { data, error } = await client.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error("Não foi possível carregar a nota fiscal.");
  }

  return data;
}

export async function getPaymentInvoiceBytes(input: {
  data: Uint8Array<ArrayBuffer> | null;
  path: string | null;
}) {
  if (input.path) {
    const file = await downloadPaymentInvoice(input.path);
    return new Uint8Array(await file.arrayBuffer());
  }

  if (input.data) {
    return input.data;
  }

  throw new Error("Nota fiscal não encontrada.");
}

export async function deletePaymentInvoice(path: string) {
  const { bucket, client } = getStorageClient();
  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error("Não foi possível remover a nota fiscal do Storage.");
  }
}

export async function deletePaymentInvoiceSafely(path: string | null | undefined) {
  if (!path || !isPaymentInvoiceStorageConfigured()) {
    return;
  }

  try {
    await deletePaymentInvoice(path);
  } catch (error) {
    console.error(
      `[payment-invoices] cleanup failed (${error instanceof Error ? error.name : "unknown"})`
    );
  }
}
