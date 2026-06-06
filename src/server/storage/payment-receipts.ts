import "server-only";

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "payment-receipts";
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MIME_TYPE_BY_EXTENSION = new Map([
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["webp", "image/webp"]
]);

export type PreparedPaymentReceipt = {
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
      "Comprovantes ainda não estão configurados. Adicione SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
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

  return normalized || "comprovante";
}

export function isPaymentReceiptStorageConfigured() {
  return Boolean(getStorageConfig());
}

export function validatePaymentReceipt(file: File) {
  if (file.size <= 0) {
    throw new Error("O comprovante selecionado está vazio.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("O comprovante deve ter no máximo 4 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const expectedMimeType = extension ? MIME_TYPE_BY_EXTENSION.get(extension) : null;

  if (!expectedMimeType || (file.type && file.type !== expectedMimeType)) {
    throw new Error("Envie um comprovante em PDF, PNG, JPG, JPEG ou WEBP.");
  }

  return expectedMimeType;
}

export async function preparePaymentReceipt(
  file: File,
  projectId: string
): Promise<PreparedPaymentReceipt> {
  const mimeType = validatePaymentReceipt(file);
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!isPaymentReceiptStorageConfigured()) {
    return {
      data: bytes,
      mimeType,
      name: file.name,
      path: null,
      size: file.size
    };
  }

  const { bucket, client } = getStorageClient();
  const path = `${projectId}/${Date.now()}-${randomBytes(6).toString("hex")}-${safeFileName(file.name)}`;
  const { error } = await client.storage.from(bucket).upload(path, bytes, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false
  });

  if (error) {
    console.error(`[payment-receipts] upload failed (${error.name || "storage-error"})`);
    throw new Error("Não foi possível enviar o comprovante para o Storage.");
  }

  return {
    data: null,
    mimeType,
    name: file.name,
    path,
    size: file.size
  };
}

export async function downloadPaymentReceipt(path: string) {
  const { bucket, client } = getStorageClient();
  const { data, error } = await client.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error("Não foi possível carregar o comprovante.");
  }

  return data;
}

export async function getPaymentReceiptBytes(input: {
  data: Uint8Array<ArrayBuffer> | null;
  path: string | null;
}) {
  if (input.path) {
    const file = await downloadPaymentReceipt(input.path);
    return new Uint8Array(await file.arrayBuffer());
  }

  if (input.data) {
    return input.data;
  }

  throw new Error("Comprovante não encontrado.");
}

export async function deletePaymentReceipt(path: string) {
  const { bucket, client } = getStorageClient();
  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error("Não foi possível remover o comprovante do Storage.");
  }
}

export async function deletePaymentReceiptSafely(path: string | null | undefined) {
  if (!path || !isPaymentReceiptStorageConfigured()) {
    return;
  }

  try {
    await deletePaymentReceipt(path);
  } catch (error) {
    console.error(
      `[payment-receipts] cleanup failed (${error instanceof Error ? error.name : "unknown"})`
    );
  }
}
