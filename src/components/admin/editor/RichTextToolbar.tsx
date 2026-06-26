"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { type Editor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Leaf,
  ListChecks,
  Ban,
  Quote,
  MessageSquareQuote,
  MessageCircle,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  BookOpen,
  BookText,
  HelpCircle,
  Clock,
  Table as TableIcon,
  CreditCard,
  Megaphone,
  Rocket,
  MousePointerClick,
  Salad,
  Stethoscope,
  FlaskConical,
  ScrollText,
  ShieldAlert,
  Link as LinkIcon,
  Unlink,
  Minus,
  Eraser,
  Undo2,
  Redo2,
  ChevronDown,
  Image as ImageIcon,
  Images,
  Shapes,
  Wand2,
} from "lucide-react";
import { CALLOUT_LABELS, type CalloutType } from "@/lib/richtext/sanitize";
import type { CardVariant } from "./structured-extensions";

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-dz-primary-100 text-dz-primary-800 dark:bg-dz-primary-500/25 dark:text-dz-night-fg"
          : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-6 w-px shrink-0 self-center bg-dz-primary-100 dark:bg-dz-night-border" aria-hidden />;
}

/** Toolbar dropdown (popover) — keeps the bar uncluttered. */
function ToolbarMenu({
  label,
  icon,
  highlight,
  children,
}: {
  label: string;
  icon: ReactNode;
  highlight?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        className={`focus-ring inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors ${
          highlight
            ? "bg-dz-primary-600 text-white hover:bg-dz-primary-700"
            : "text-dz-primary-700 hover:bg-dz-primary-50 dark:text-dz-night-fg dark:hover:bg-white/5"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown className="size-3.5 opacity-70" />
      </button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className="absolute start-0 z-50 mt-1 max-h-[60vh] w-56 overflow-auto rounded-xl border border-dz-primary-100 bg-white p-1 shadow-lg dark:border-dz-night-border dark:bg-dz-night-card"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  active,
  icon,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-xs transition-colors ${
        active
          ? "bg-dz-primary-100 text-dz-primary-800 dark:bg-dz-primary-500/25 dark:text-dz-night-fg"
          : "text-dz-primary-700 hover:bg-dz-primary-50 dark:text-dz-night-fg dark:hover:bg-white/5"
      }`}
    >
      <span className="shrink-0 text-dz-primary-500 dark:text-dz-night-muted">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

function MenuHeading({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-dz-primary-400 dark:text-dz-night-faint">
      {children}
    </p>
  );
}

type BlockKey =
  | "quote-heritage"
  | "quote-speech"
  | "quote-editorial"
  | `callout-${CalloutType}`
  | "list-leaf"
  | "list-check"
  | "list-cross"
  | "list-steps"
  | "table"
  | "timeline"
  | "faq"
  | `card-${CardVariant}`;

// Recommended blocks per article type — surfaced first in «بلوک‌های این نوع مقاله».
const RECOMMENDED: Record<string, BlockKey[]> = {
  CASE_FILE: ["timeline", "card-culture", "callout-source", "callout-experience", "quote-heritage", "faq"],
  TASTE_STORY: ["quote-speech", "quote-heritage", "card-origin", "callout-experience"],
  FOOD_CULTURE: ["timeline", "callout-source", "quote-heritage", "card-culture", "table"],
  DID_YOU_KNOW: ["callout-quick-fact", "callout-myth", "callout-fact", "faq", "list-check"],
  BRAND_UPDATE: ["card-announcement", "card-launch", "card-cta", "callout-note"],
  TRICKS: ["list-steps", "list-check", "list-cross", "callout-mistake", "callout-tip"],
  ENCYCLOPEDIA: ["callout-definition", "table", "faq", "list-leaf"],
  DIET_LIFESTYLE: ["callout-nutrition", "callout-warning", "callout-source", "table"],
  HEALTH_MEDICAL: ["callout-medical", "callout-consult", "callout-evidence", "callout-source"],
};

// Always-available common blocks (general «بلوک‌های دشت‌زاد»).
const COMMON: BlockKey[] = [
  "quote-heritage",
  "quote-speech",
  "quote-editorial",
  "callout-note",
  "callout-warning",
  "callout-tip",
  "callout-experience",
  "list-leaf",
  "list-check",
  "table",
  "timeline",
  "faq",
  "card-origin",
];

export function RichTextToolbar({ editor, articleType }: { editor: Editor; articleType?: string | null }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 1 })
        ? "h1"
        : e.isActive("heading", { level: 2 })
          ? "h2"
          : e.isActive("heading", { level: 3 })
            ? "h3"
            : e.isActive("heading", { level: 4 })
              ? "h4"
              : e.isActive("heading", { level: 5 })
                ? "h5"
                : e.isActive("heading", { level: 6 })
                  ? "h6"
                  : "paragraph",
      isBold: e.isActive("bold"),
      isItalic: e.isActive("italic"),
      isUnderline: e.isActive("underline"),
      isBullet:
        e.isActive("bulletList") &&
        !e.isActive("bulletList", { dzVariant: "leaf" }) &&
        !e.isActive("bulletList", { dzVariant: "check" }) &&
        !e.isActive("bulletList", { dzVariant: "cross" }),
      isOrdered: e.isActive("orderedList") && !e.isActive("orderedList", { dzVariant: "steps" }),
      isLink: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      // bump so the registry's editor.isActive reads re-run on every change
      _v: e.state.selection.from + (e.isEmpty ? 0 : 1),
    }),
  });

  const chain = () => editor.chain().focus();

  const applyBlock = useCallback(
    (value: string) => {
      const c = editor.chain().focus();
      if (value === "paragraph") c.setNode("paragraph").run();
      else c.setNode("heading", { level: Number(value.slice(1)) }).run();
    },
    [editor],
  );

  const toggleBulletVariant = useCallback(
    (variant: "leaf" | "check" | "cross") => {
      const c = editor.chain().focus();
      if (editor.isActive("bulletList", { dzVariant: variant })) c.toggleBulletList().run();
      else if (editor.isActive("bulletList")) c.updateAttributes("bulletList", { dzVariant: variant }).run();
      else c.toggleBulletList().updateAttributes("bulletList", { dzVariant: variant }).run();
    },
    [editor],
  );

  const toggleOrderedSteps = useCallback(() => {
    const c = editor.chain().focus();
    if (editor.isActive("orderedList", { dzVariant: "steps" })) c.toggleOrderedList().run();
    else if (editor.isActive("orderedList")) c.updateAttributes("orderedList", { dzVariant: "steps" }).run();
    else c.toggleOrderedList().updateAttributes("orderedList", { dzVariant: "steps" }).run();
  }, [editor]);

  const toggleBulletPlain = useCallback(() => {
    const c = editor.chain().focus();
    if (editor.isActive("bulletList")) c.toggleBulletList().run();
    else c.toggleBulletList().updateAttributes("bulletList", { dzVariant: null }).run();
  }, [editor]);

  const setQuote = useCallback(
    (variant: "heritage" | "editorial") => {
      const c = editor.chain().focus();
      if (editor.isActive("blockquote", { dzQuoteVariant: variant })) c.toggleBlockquote().run();
      else if (editor.isActive("blockquote")) c.updateAttributes("blockquote", { dzQuoteVariant: variant }).run();
      else c.toggleBlockquote().updateAttributes("blockquote", { dzQuoteVariant: variant }).run();
    },
    [editor],
  );

  const toggleCallout = useCallback(
    (type: CalloutType) => {
      editor.chain().focus().toggleWrap("callout", { type }).run();
    },
    [editor],
  );

  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("نشانی پیوند (https://…)", previous ?? "https://");
    if (input === null) return;
    const url = input.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(() => editor.chain().focus().insertContent({ type: "dzImage" }).run(), [editor]);
  const insertGallery = useCallback(
    (layout?: "grid-2" | "grid-3" | "featured" | "scroll-mobile") =>
      editor.chain().focus().insertContent({ type: "dzGallery", ...(layout ? { attrs: { layout } } : {}) }).run(),
    [editor],
  );
  const insertTable = useCallback(
    () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    [editor],
  );
  const insertTimeline = useCallback(
    () => editor.chain().focus().insertContent({ type: "dzTimeline", attrs: { items: [{ label: "", text: "" }] } }).run(),
    [editor],
  );
  const insertFaq = useCallback(
    () => editor.chain().focus().insertContent({ type: "dzFaq", attrs: { items: [{ q: "", a: "" }] } }).run(),
    [editor],
  );
  const insertCard = useCallback(
    (variant: CardVariant) => editor.chain().focus().insertContent({ type: "dzCard", attrs: { variant } }).run(),
    [editor],
  );

  // Block registry — single source for both the common and type-specific menus.
  type Entry = { label: string; icon: ReactNode; run: () => void; active?: boolean };
  const reg = (key: BlockKey): Entry => {
    if (key.startsWith("callout-")) {
      const type = key.slice("callout-".length) as CalloutType;
      const iconByType: Partial<Record<CalloutType, ReactNode>> = {
        note: <Lightbulb className="size-4" />,
        warning: <AlertTriangle className="size-4" />,
        tip: <Sparkles className="size-4" />,
        experience: <BookOpen className="size-4" />,
        definition: <BookText className="size-4" />,
        "quick-fact": <Sparkles className="size-4" />,
        myth: <Ban className="size-4" />,
        fact: <ListChecks className="size-4" />,
        mistake: <AlertTriangle className="size-4" />,
        nutrition: <Salad className="size-4" />,
        medical: <ShieldAlert className="size-4" />,
        consult: <Stethoscope className="size-4" />,
        evidence: <FlaskConical className="size-4" />,
        source: <ScrollText className="size-4" />,
      };
      return {
        label: CALLOUT_LABELS[type],
        icon: iconByType[type] ?? <Lightbulb className="size-4" />,
        run: () => toggleCallout(type),
        active: editor.isActive("callout", { type }),
      };
    }
    switch (key) {
      case "quote-heritage":
        return { label: "نقل‌قول میراثی", icon: <Quote className="size-4" />, run: () => setQuote("heritage"), active: editor.isActive("blockquote", { dzQuoteVariant: "heritage" }) };
      case "quote-speech":
        return { label: "نقل‌قول نویسنده", icon: <MessageCircle className="size-4" />, run: () => editor.chain().focus().toggleWrap("dzSpeechQuote").run(), active: editor.isActive("dzSpeechQuote") };
      case "quote-editorial":
        return { label: "نقل‌قول ادیتوریال", icon: <MessageSquareQuote className="size-4" />, run: () => setQuote("editorial"), active: editor.isActive("blockquote", { dzQuoteVariant: "editorial" }) };
      case "list-leaf":
        return { label: "بولت برگ‌دار", icon: <Leaf className="size-4" />, run: () => toggleBulletVariant("leaf"), active: editor.isActive("bulletList", { dzVariant: "leaf" }) };
      case "list-check":
        return { label: "فهرست تیک‌دار (بکنید)", icon: <ListChecks className="size-4" />, run: () => toggleBulletVariant("check"), active: editor.isActive("bulletList", { dzVariant: "check" }) };
      case "list-cross":
        return { label: "فهرست ضربدری (نکنید)", icon: <Ban className="size-4" />, run: () => toggleBulletVariant("cross"), active: editor.isActive("bulletList", { dzVariant: "cross" }) };
      case "list-steps":
        return { label: "فهرست گام‌به‌گام", icon: <ListOrdered className="size-4" />, run: toggleOrderedSteps, active: editor.isActive("orderedList", { dzVariant: "steps" }) };
      case "table":
        return { label: "جدول مقایسه", icon: <TableIcon className="size-4" />, run: insertTable };
      case "timeline":
        return { label: "خط زمان", icon: <Clock className="size-4" />, run: insertTimeline };
      case "faq":
        return { label: "پرسش‌های پرتکرار", icon: <HelpCircle className="size-4" />, run: insertFaq };
      case "card-origin":
        return { label: "کارت خاستگاه", icon: <CreditCard className="size-4" />, run: () => insertCard("origin") };
      case "card-culture":
        return { label: "کارت فرهنگی", icon: <CreditCard className="size-4" />, run: () => insertCard("culture") };
      case "card-announcement":
        return { label: "کارت اعلان", icon: <Megaphone className="size-4" />, run: () => insertCard("announcement") };
      case "card-launch":
        return { label: "کارت معرفی", icon: <Rocket className="size-4" />, run: () => insertCard("launch") };
      case "card-cta":
        return { label: "فراخوان (CTA)", icon: <MousePointerClick className="size-4" />, run: () => insertCard("cta") };
      default:
        return { label: key, icon: <Shapes className="size-4" />, run: () => {} };
    }
  };

  const recommended = articleType ? RECOMMENDED[articleType] : undefined;

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {/* block format — paragraph + h1…h6 */}
      <select
        value={s.block}
        onChange={(e) => applyBlock(e.target.value)}
        title="قالب بلوک"
        aria-label="قالب بلوک متن"
        className="focus-ring h-8 shrink-0 rounded-lg border border-dz-primary-200 bg-white px-2 text-xs font-medium text-dz-primary-700 outline-none transition-colors hover:border-dz-primary-300 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
      >
        <option value="paragraph">پاراگراف</option>
        <option value="h1">تیتر ۱</option>
        <option value="h2">تیتر ۲</option>
        <option value="h3">تیتر ۳</option>
        <option value="h4">تیتر ۴</option>
        <option value="h5">تیتر ۵</option>
        <option value="h6">تیتر ۶</option>
      </select>

      <Divider />

      {/* marks */}
      <ToolbarButton title="پررنگ" active={s.isBold} onClick={() => chain().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="کج" active={s.isItalic} onClick={() => chain().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="زیرخط" active={s.isUnderline} onClick={() => chain().toggleUnderline().run()}>
        <Underline className="size-4" />
      </ToolbarButton>

      <Divider />

      {/* lists (common) */}
      <ToolbarButton title="فهرست نقطه‌ای" active={s.isBullet} onClick={toggleBulletPlain}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="فهرست شماره‌دار" active={s.isOrdered} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolbarButton>

      <Divider />

      {/* media dropdown */}
      <ToolbarMenu label="رسانه" icon={<ImageIcon className="size-4" />}>
        <MenuHeading>تصویر</MenuHeading>
        <MenuItem icon={<ImageIcon className="size-4" />} label="تصویر" onClick={insertImage} />
        <MenuItem icon={<ImageIcon className="size-4" />} label="تصویر با کپشن" onClick={insertImage} />
        <MenuHeading>گالری</MenuHeading>
        <MenuItem icon={<Images className="size-4" />} label="گالری / آلبوم" onClick={() => insertGallery("grid-3")} />
        <MenuItem icon={<Images className="size-4" />} label="گالری شبکه‌ای" onClick={() => insertGallery("grid-2")} />
        <MenuItem icon={<Images className="size-4" />} label="گالری با تصویر شاخص" onClick={() => insertGallery("featured")} />
      </ToolbarMenu>

      {/* Dashtzad common blocks dropdown */}
      <ToolbarMenu label="بلوک‌های دشت‌زاد" icon={<Shapes className="size-4" />}>
        {COMMON.map((key) => {
          const e = reg(key);
          return <MenuItem key={key} icon={e.icon} label={e.label} active={e.active} onClick={e.run} />;
        })}
      </ToolbarMenu>

      {/* Type-specific recommended blocks dropdown */}
      {recommended && recommended.length > 0 && (
        <ToolbarMenu label="بلوک‌های این نوع مقاله" icon={<Wand2 className="size-4" />} highlight>
          <MenuHeading>پیشنهاد برای این نوع مقاله</MenuHeading>
          {recommended.map((key) => {
            const e = reg(key);
            return <MenuItem key={key} icon={e.icon} label={e.label} active={e.active} onClick={e.run} />;
          })}
        </ToolbarMenu>
      )}

      <Divider />

      {/* link */}
      <ToolbarButton title="پیوند" active={s.isLink} onClick={setLink}>
        <LinkIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="حذف پیوند" disabled={!s.isLink} onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
        <Unlink className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="خط جداکننده" onClick={() => chain().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="پاک‌سازی قالب" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
        <Eraser className="size-4" />
      </ToolbarButton>

      <Divider />

      {/* history */}
      <ToolbarButton title="واگرد" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="ازنو" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}
