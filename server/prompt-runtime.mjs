import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function createPromptRuntime({ root, registryPath = "prompt/registry.json" }) {
  const registry = JSON.parse(readFileSync(join(root, registryPath), "utf8"));
  const records = new Map();
  const promptCache = new Map();

  if (!Array.isArray(registry.prompts)) {
    throw new Error("Prompt registry must include a prompts array.");
  }

  for (const record of registry.prompts) {
    validatePromptRecord({ root, record });
    if (records.has(record.id)) {
      throw new Error(`Duplicate prompt id "${record.id}".`);
    }
    records.set(record.id, record);
  }

  function getPromptRecord(promptId) {
    const record = records.get(promptId);
    if (!record) {
      throw new Error(`Unknown prompt id "${promptId}".`);
    }
    return record;
  }

  function getPromptContent(promptId) {
    if (promptCache.has(promptId)) return promptCache.get(promptId);

    const record = getPromptRecord(promptId);
    const content = readFileSync(join(root, record.file), "utf8");
    promptCache.set(promptId, content);
    return content;
  }

  function buildPromptInput(promptId, payload) {
    return [
      {
        role: "developer",
        content: getPromptContent(promptId),
      },
      {
        role: "user",
        content: JSON.stringify(stripUndefined(payload), null, 2),
      },
    ];
  }

  function getActivePromptRecords() {
    return [...records.values()].filter((record) => record.status === "active");
  }

  return {
    registry,
    getPromptRecord,
    getPromptContent,
    buildPromptInput,
    getActivePromptRecords,
  };
}

function validatePromptRecord({ root, record }) {
  for (const field of ["id", "file", "status", "purpose", "version", "rollback"]) {
    if (!record[field]) {
      throw new Error(`Prompt registry record is missing "${field}".`);
    }
  }

  if (!["active", "draft", "archived"].includes(record.status)) {
    throw new Error(`Prompt "${record.id}" has invalid status "${record.status}".`);
  }

  if (!existsSync(join(root, record.file))) {
    throw new Error(`Prompt "${record.id}" file does not exist: ${record.file}`);
  }

  if (!Array.isArray(record.usedBy)) {
    throw new Error(`Prompt "${record.id}" must declare usedBy.`);
  }

  if (!Array.isArray(record.evals)) {
    throw new Error(`Prompt "${record.id}" must declare evals.`);
  }

  if (record.status === "active") {
    if (record.usedBy.length === 0) {
      throw new Error(`Active prompt "${record.id}" must declare usedBy.`);
    }

    if (record.evals.length === 0) {
      throw new Error(`active prompt "${record.id}" must declare evals.`);
    }
  }

  for (const evalPath of record.evals) {
    if (!existsSync(join(root, evalPath))) {
      throw new Error(`Prompt "${record.id}" eval file does not exist: ${evalPath}`);
    }
  }
}

function stripUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, stripUndefined(entryValue)]),
    );
  }

  return value;
}
