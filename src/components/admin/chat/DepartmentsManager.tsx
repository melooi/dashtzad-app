"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, Users, MessagesSquare } from "lucide-react";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/app/admin/chat/actions";
import { toPersianNumbers } from "@/lib/price";
import type { DepartmentAdminRow } from "@/lib/chat/service";

type Operator = { id: string; name: string };

function OperatorPicker({
  operators,
  selected,
  onToggle,
}: {
  operators: Operator[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (operators.length === 0) {
    return <p className="text-xs text-dz-primary-400 dark:text-dz-night-faint">اپراتوری یافت نشد.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {operators.map((o) => {
        const on = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              on
                ? "border-dz-primary-600 bg-dz-primary-600 text-white"
                : "border-dz-primary-200 text-dz-primary-600 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
            }`}
          >
            <Users className="size-3.5" aria-hidden />
            {o.name}
          </button>
        );
      })}
    </div>
  );
}

function DepartmentCard({
  dept,
  operators,
}: {
  dept: DepartmentAdminRow;
  operators: Operator[];
}) {
  const router = useRouter();
  const [name, setName] = useState(dept.name);
  const [color, setColor] = useState(dept.color ?? "#4a6340");
  const [isActive, setIsActive] = useState(dept.isActive);
  const [ops, setOps] = useState<string[]>(dept.operatorIds);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleOp = (id: string) => setOps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = () =>
    start(async () => {
      setError(null);
      const res = await updateDepartmentAction(dept.id, { name, color, isActive, operatorIds: ops });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });

  const remove = () =>
    start(async () => {
      const res = await deleteDepartmentAction(dept.id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });

  return (
    <div className="rounded-2xl border border-dz-primary-100 bg-white p-4 shadow-xs dark:border-dz-night-border dark:bg-dz-night-card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-40 flex-1 rounded-xl border border-dz-primary-200 bg-white px-3 py-2 text-sm text-dz-primary-800 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
          aria-label="نام دپارتمان"
        />
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#4a6340"}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-dz-primary-200 dark:border-dz-night-border"
          aria-label="رنگ"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-dz-primary-600 dark:text-dz-night-muted">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-dz-primary-600" />
          فعال
        </label>
        <span className="inline-flex items-center gap-1 text-xs text-dz-primary-400 dark:text-dz-night-faint">
          <MessagesSquare className="size-3.5" aria-hidden />
          {toPersianNumbers(dept.conversationCount)}
        </span>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-dz-primary-500 dark:text-dz-night-muted">اپراتورهای این دپارتمان</p>
        <OperatorPicker operators={operators} selected={ops} onToggle={toggleOp} />
      </div>

      {error && <p className="mt-2 text-xs text-dz-error dark:text-dz-error-300">{error}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-error/30 px-3 py-1.5 text-xs font-medium text-dz-error transition-colors hover:bg-dz-error/10 dark:text-dz-error-300"
        >
          <Trash2 className="size-3.5" aria-hidden />
          حذف
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-dz-primary-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-dz-primary-700 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Save className="size-3.5" aria-hidden />}
          ذخیره
        </button>
      </div>
    </div>
  );
}

export function DepartmentsManager({
  departments,
  operators,
}: {
  departments: DepartmentAdminRow[];
  operators: Operator[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4a6340");
  const [ops, setOps] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleOp = (id: string) => setOps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const add = () =>
    start(async () => {
      setError(null);
      if (!name.trim()) {
        setError("نام دپارتمان الزامی است.");
        return;
      }
      const res = await createDepartmentAction({ name, color, isActive: true, operatorIds: ops });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setName("");
      setOps([]);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-4">
      {/* new department */}
      <div className="rounded-2xl border border-dashed border-dz-primary-200 bg-dz-primary-50/40 p-4 dark:border-dz-night-border dark:bg-white/5">
        <p className="mb-2.5 flex items-center gap-2 text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">
          <Plus className="size-4" aria-hidden />
          دپارتمان جدید
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام دپارتمان (مثلاً فروش، پشتیبانی فنی)"
            className="min-w-48 flex-1 rounded-xl border border-dz-primary-200 bg-white px-3 py-2 text-sm text-dz-primary-800 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg dark:placeholder:text-dz-night-faint"
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-dz-primary-200 dark:border-dz-night-border"
            aria-label="رنگ"
          />
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-dz-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dz-primary-700 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
            افزودن
          </button>
        </div>
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-dz-primary-500 dark:text-dz-night-muted">اپراتورها</p>
          <OperatorPicker operators={operators} selected={ops} onToggle={toggleOp} />
        </div>
        {error && <p className="mt-2 text-xs text-dz-error dark:text-dz-error-300">{error}</p>}
      </div>

      {/* existing */}
      {departments.length === 0 ? (
        <p className="rounded-2xl border border-dz-primary-100 bg-white p-6 text-center text-sm text-dz-primary-400 dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-night-muted">
          هنوز دپارتمانی تعریف نشده است.
        </p>
      ) : (
        departments.map((d) => <DepartmentCard key={d.id} dept={d} operators={operators} />)
      )}
    </div>
  );
}
