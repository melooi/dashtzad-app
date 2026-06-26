"use client";

import { useState, useTransition } from "react";
import {
  X, Phone, MapPin, ShoppingBag, Calendar, ChevronLeft,
  StickyNote, Trash2, Plus, Loader2,
} from "lucide-react";
import { ChatTime } from "@/components/admin/chat/ChatTime";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { addCustomerNoteAction, deleteCustomerNoteAction } from "@/app/admin/chat/actions";
import type { AdminConversationDetail } from "@/lib/chat/types";
import { CUSTOMER_TIER_LABEL } from "@/lib/chat/types";

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغو‌شده",
  RETURNED: "مرجوعی",
};
const ORDER_STATUS_TONE: Record<string, "green" | "blue" | "amber" | "gray" | "red"> = {
  PENDING: "amber",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
  RETURNED: "gray",
};

function formatRial(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export function CustomerProfilePanel({
  cv,
  onClose,
}: {
  cv: AdminConversationDetail;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(cv.customerNotes);
  const [draft, setDraft] = useState("");
  const [, startT] = useTransition();
  const [saving, setSaving] = useState(false);

  const joinDate = cv.userCreatedAt
    ? new Date(cv.userCreatedAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const handleAddNote = () => {
    if (!draft.trim() || !cv.userId) return;
    setSaving(true);
    startT(async () => {
      const res = await addCustomerNoteAction(cv.userId!, draft.trim());
      if (res.ok) {
        setNotes((prev) => [
          { id: Date.now().toString(), body: draft.trim(), authorName: "شما", createdAt: new Date().toISOString() },
          ...prev,
        ]);
        setDraft("");
      }
      setSaving(false);
    });
  };

  const handleDeleteNote = (noteId: string) => {
    startT(async () => {
      const res = await deleteCustomerNoteAction(noteId);
      if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== noteId));
    });
  };

  return (
    <div className="cv-profile-panel">
      {/* header */}
      <div className="cv-profile-header">
        <div className="cv-profile-avatar">{cv.displayName.charAt(0) || "?"}</div>
        <div className="cv-profile-identity">
          <span className="cv-profile-name">{cv.displayName}</span>
          {cv.isGuest ? (
            <span className="cv-profile-guest">مهمان (بدون حساب)</span>
          ) : (
            <span className="cv-profile-tier">
              {cv.customerTier ? CUSTOMER_TIER_LABEL[cv.customerTier] : "مشتری"}
            </span>
          )}
          {joinDate && <span className="cv-profile-join">عضو از {joinDate}</span>}
        </div>
        <button className="cv-profile-close" onClick={onClose} title="بستن پروفایل">
          <X size={16} />
        </button>
      </div>

      <div className="cv-profile-body">
        {/* stats row */}
        {!cv.isGuest && (
          <div className="cv-profile-stats">
            <div className="cv-profile-stat">
              <span className="cv-profile-stat-value">{new Intl.NumberFormat("fa-IR").format(cv.totalOrderCount)}</span>
              <span className="cv-profile-stat-label">سفارش کل</span>
            </div>
            <div className="cv-profile-stat-divider" />
            <div className="cv-profile-stat">
              <span className="cv-profile-stat-value">{formatRial(cv.totalPurchaseRial)}</span>
              <span className="cv-profile-stat-label">مجموع خرید</span>
            </div>
            {cv.lastOrderAt && (
              <>
                <div className="cv-profile-stat-divider" />
                <div className="cv-profile-stat">
                  <span className="cv-profile-stat-value"><ChatTime iso={cv.lastOrderAt} /></span>
                  <span className="cv-profile-stat-label">آخرین خرید</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* contact */}
        <div className="cv-profile-section">
          <div className="cv-profile-section-title">اطلاعات تماس</div>
          {cv.phone && (
            <div className="cv-profile-info-row">
              <Phone size={13} className="cv-profile-info-icon" />
              <span dir="ltr">{cv.phone}</span>
            </div>
          )}
          {cv.userCity && (
            <div className="cv-profile-info-row">
              <MapPin size={13} className="cv-profile-info-icon" />
              <span>{cv.userCity}</span>
            </div>
          )}
          {cv.customerTier && !cv.isGuest && (
            <div className="cv-profile-info-row">
              <Calendar size={13} className="cv-profile-info-icon" />
              <span>سطح وفاداری: {CUSTOMER_TIER_LABEL[cv.customerTier]}</span>
            </div>
          )}
          {!cv.phone && !cv.userCity && cv.isGuest && (
            <p className="cv-profile-empty">اطلاعات تماسی ثبت نشده</p>
          )}
        </div>

        {/* orders */}
        {cv.orders.length > 0 && (
          <div className="cv-profile-section">
            <div className="cv-profile-section-title">
              <ShoppingBag size={13} /> تاریخچهٔ سفارش‌ها
            </div>
            <div className="cv-profile-orders">
              {cv.orders.map((o) => (
                <div key={o.id} className="cv-profile-order-row">
                  <div className="cv-profile-order-main">
                    <a
                      href={`/admin/collections/orders/${o.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-profile-order-code"
                    >
                      {o.code}
                      <ChevronLeft size={11} />
                    </a>
                    <span className="cv-profile-order-time"><ChatTime iso={o.createdAt} /></span>
                  </div>
                  <div className="cv-profile-order-meta">
                    <span className="cv-profile-order-items">{new Intl.NumberFormat("fa-IR").format(o.itemCount)} قلم</span>
                    <span className="cv-profile-order-amount">{formatRial(o.totalRial)}</span>
                    <AdminStatusBadge tone={ORDER_STATUS_TONE[o.status] ?? "gray"}>
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </AdminStatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* internal notes — only for registered users */}
        {!cv.isGuest && cv.userId && (
          <div className="cv-profile-section">
            <div className="cv-profile-section-title">
              <StickyNote size={13} /> یادداشت داخلی
            </div>
            <div className="cv-profile-note-composer">
              <textarea
                className="cv-profile-note-input"
                placeholder="یادداشت داخلی برای تیم..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
              />
              <button
                className="cv-profile-note-btn"
                onClick={handleAddNote}
                disabled={!draft.trim() || saving}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                ثبت
              </button>
            </div>
            {notes.length > 0 ? (
              <div className="cv-profile-notes-list">
                {notes.map((n) => (
                  <div key={n.id} className="cv-profile-note-item">
                    <p className="cv-profile-note-body">{n.body}</p>
                    <div className="cv-profile-note-footer">
                      <span>{n.authorName} · <ChatTime iso={n.createdAt} /></span>
                      <button
                        className="cv-profile-note-del"
                        onClick={() => handleDeleteNote(n.id)}
                        title="حذف یادداشت"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cv-profile-empty">یادداشتی ثبت نشده</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
