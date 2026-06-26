"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  Smartphone,
  Bot,
  Sparkles,
  Globe,
  Truck,
  Plug,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IntegrationStatus, IntegrationState } from "@/lib/admin/integrations";
import {
  testIntegrationAction,
  saveIntegrationConfigAction,
} from "@/app/admin/settings/integration-actions";

const ICON_MAP: Record<string, LucideIcon> = {
  zarinpal: CreditCard,
  kavenegar: Smartphone,
  "ai-anthropic": Bot,
  "ai-openai": Bot,
  "ai-google": Sparkles,
  "google-verification": Globe,
  shipping: Truck,
};

type FieldDef = { label: string; field: string; placeholder: string; secret: boolean };
const FIELDS: Record<string, FieldDef[]> = {
  zarinpal: [{ label: "Merchant ID", field: "merchantId", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", secret: false }],
  kavenegar: [{ label: "API Key", field: "apiKey", placeholder: "کلید API کاوه‌نگار", secret: true }],
  "ai-anthropic": [{ label: "API Key", field: "apiKey", placeholder: "sk-ant-...", secret: true }],
  "ai-openai": [{ label: "API Key", field: "apiKey", placeholder: "sk-...", secret: true }],
  "ai-google": [{ label: "API Key", field: "apiKey", placeholder: "AIza...", secret: true }],
  "google-verification": [{ label: "Verification Code", field: "code", placeholder: "کد تأیید Google", secret: false }],
};

type TestState = "idle" | "testing" | "ok" | "fail";
type SaveState = "idle" | "saving" | "ok" | "fail";

function StatusDot({ envState, testState }: { envState: IntegrationState; testState: TestState }) {
  if (testState === "testing")
    return <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-dz-a-warning" />;
  if (testState === "ok")
    return <span className="size-2.5 shrink-0 rounded-full bg-dz-a-success" />;
  if (testState === "fail")
    return <span className="size-2.5 shrink-0 rounded-full bg-dz-a-error" />;
  if (envState === "connected")
    return <span className="size-2.5 shrink-0 rounded-full bg-dz-a-success" />;
  if (envState === "pending")
    return <span className="size-2.5 shrink-0 rounded-full bg-dz-a-warning" />;
  return <span className="size-2.5 shrink-0 rounded-full bg-dz-a-primary-200 dark:bg-dz-a-night-border" />;
}

function FieldInput({
  def,
  isSet,
  integrationKey,
  onSaved,
}: {
  def: FieldDef;
  isSet: boolean;
  integrationKey: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const [showText, setShowText] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    if (!value.trim()) return;
    setSaveState("saving");
    startTransition(async () => {
      const result = await saveIntegrationConfigAction(integrationKey, def.field, value);
      setSaveState(result.ok ? "ok" : "fail");
      setSaveMsg(result.message);
      if (result.ok) {
        setValue("");
        onSaved();
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-muted">
          {def.label}
        </label>
        {isSet && (
          <span className="flex items-center gap-1 rounded-full bg-dz-a-success/10 px-2 py-0.5 text-[10px] font-medium text-dz-a-success">
            <span className="size-1.5 rounded-full bg-dz-a-success" />
            تنظیم شده
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={def.secret && !showText ? "password" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isSet ? "برای تغییر وارد کنید…" : def.placeholder}
            className="focus-ring w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2 text-sm text-dz-a-primary-800 placeholder:text-dz-a-primary-300 focus:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-faint dark:focus:border-dz-a-primary-400"
          />
          {def.secret && (
            <button
              type="button"
              onClick={() => setShowText((v) => !v)}
              aria-label={showText ? "پنهان کردن" : "نمایش"}
              className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-dz-a-primary-300 hover:text-dz-a-primary-500 dark:text-dz-a-night-faint"
            >
              {showText ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!value.trim() || saveState === "saving"}
          aria-label="ذخیره"
          className="focus-ring flex items-center gap-1.5 rounded-xl bg-dz-a-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dz-a-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveState === "saving" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
        </button>
      </div>
      {saveState === "ok" && (
        <p className="flex items-center gap-1 text-xs text-dz-a-success">
          <CheckCircle2 className="size-3.5" /> {saveMsg}
        </p>
      )}
      {saveState === "fail" && (
        <p className="flex items-center gap-1 text-xs text-dz-a-error">
          <XCircle className="size-3.5" /> {saveMsg}
        </p>
      )}
    </div>
  );
}

function IntegrationDialog({
  integration,
  configStatus,
  testState,
  testMessage,
  onTest,
  onClose,
  onConfigSaved,
}: {
  integration: IntegrationStatus;
  configStatus: Record<string, boolean>;
  testState: TestState;
  testMessage: string;
  onTest: () => void;
  onClose: () => void;
  onConfigSaved: () => void;
}) {
  const Icon = ICON_MAP[integration.key] ?? Plug;
  const fields = FIELDS[integration.key] ?? [];
  const canTest = integration.state !== "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-dz-a-night-elevated">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-dz-a-primary-100 p-5 dark:border-dz-a-night-border">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300">
              <Icon className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                {integration.label}
              </h3>
              <span className="text-[11px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
                {integration.group}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="focus-ring rounded-lg p-1.5 text-dz-a-primary-400 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-600 dark:hover:bg-white/5"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* Config fields */}
          {fields.length > 0 && (
            <div className="flex flex-col gap-3 rounded-xl bg-dz-a-primary-50/50 p-3 dark:bg-white/5">
              <p className="text-xs font-medium text-dz-a-primary-500 dark:text-dz-a-night-faint">
                تنظیمات اتصال
              </p>
              {fields.map((def) => (
                <FieldInput
                  key={def.field}
                  def={def}
                  isSet={configStatus[def.field] ?? false}
                  integrationKey={integration.key}
                  onSaved={onConfigSaved}
                />
              ))}
            </div>
          )}

          {/* Status note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-dz-a-primary-50/50 p-3 dark:bg-white/5">
            <StatusDot envState={integration.state} testState={testState} />
            <p className="text-sm leading-5 text-dz-a-primary-600 dark:text-dz-a-night-muted">
              {testState !== "idle" && testMessage ? testMessage : integration.note}
            </p>
          </div>

          {testState === "ok" && (
            <p className="flex items-center gap-1.5 text-sm text-dz-a-success">
              <CheckCircle2 className="size-4" /> اتصال موفق
            </p>
          )}
          {testState === "fail" && (
            <p className="flex items-center gap-1.5 text-sm text-dz-a-error">
              <XCircle className="size-4" /> اتصال ناموفق
            </p>
          )}

          {canTest && (
            <button
              type="button"
              onClick={onTest}
              disabled={testState === "testing"}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dz-a-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testState === "testing" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال تست اتصال…
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  تست اتصال
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function IntegrationStatusList({
  integrations,
  configStatus,
}: {
  integrations: IntegrationStatus[];
  configStatus: Record<string, Record<string, boolean>>;
}) {
  const [selected, setSelected] = useState<IntegrationStatus | null>(null);
  const [testStates, setTestStates] = useState<Record<string, { state: TestState; message: string }>>({});
  const [, startTransition] = useTransition();

  const getTestState = (key: string): TestState => testStates[key]?.state ?? "idle";
  const getTestMessage = (key: string): string => testStates[key]?.message ?? "";

  const runTest = (key: string) => {
    setTestStates((prev) => ({ ...prev, [key]: { state: "testing", message: "" } }));
    startTransition(async () => {
      const result = await testIntegrationAction(key);
      setTestStates((prev) => ({
        ...prev,
        [key]: { state: result.ok ? "ok" : "fail", message: result.message },
      }));
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        {integrations.map((it, i) => {
          const Icon = ICON_MAP[it.key] ?? Plug;
          const ts = getTestState(it.key);
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setSelected(it)}
              className={`focus-ring flex w-full items-center gap-3 px-5 py-4 text-start transition-colors hover:bg-dz-a-primary-50/60 dark:hover:bg-white/3 ${
                i < integrations.length - 1
                  ? "border-b border-dz-a-primary-50 dark:border-dz-a-night-line"
                  : ""
              }`}
            >
              <Icon className="size-5 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  {it.label}
                </span>
                <span className="text-[11px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
                  {it.group}
                </span>
              </div>
              <StatusDot envState={it.state} testState={ts} />
            </button>
          );
        })}
      </div>

      {selected && (
        <IntegrationDialog
          integration={selected}
          configStatus={configStatus[selected.key] ?? {}}
          testState={getTestState(selected.key)}
          testMessage={getTestMessage(selected.key)}
          onTest={() => runTest(selected.key)}
          onClose={() => setSelected(null)}
          onConfigSaved={() => setSelected(null)}
        />
      )}
    </>
  );
}
