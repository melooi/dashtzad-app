"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

/**
 * In-editor view for the Dashtzad speech-author quote (dz-quote--speech-author).
 * The quote body is editable (NodeViewContent); the author name + role/source are
 * optional node attributes edited inline through the figcaption inputs. No fake
 * author/avatar data — the avatar shows the real author's initial, or a neutral
 * quote glyph when no name is given.
 *
 * The PUBLIC markup is produced by the node's renderHTML (semantic
 * figure > blockquote > figcaption), not by this view.
 */
export function SpeechQuoteView({ node, updateAttributes, editor }: NodeViewProps) {
  const author = typeof node.attrs.author === "string" ? node.attrs.author : "";
  const role = typeof node.attrs.role === "string" ? node.attrs.role : "";
  const initial = author.trim() ? Array.from(author.trim())[0] : "";
  const editable = editor.isEditable;

  return (
    <NodeViewWrapper as="figure" className="dz-quote dz-quote--speech-author" dir="rtl">
      <blockquote>
        <NodeViewContent />
      </blockquote>
      <figcaption className="dz-quote__meta-edit" contentEditable={false}>
        <span className="dz-quote__avatar" data-empty={initial ? undefined : "true"} aria-hidden>
          {initial}
        </span>
        <span className="dz-quote__fields">
          <input
            type="text"
            value={author}
            disabled={!editable}
            onChange={(e) => updateAttributes({ author: e.target.value })}
            placeholder="نام (اختیاری)"
            aria-label="نام نویسندهٔ نقل‌قول"
            className="dz-quote__input dz-quote__input--author"
          />
          <input
            type="text"
            value={role}
            disabled={!editable}
            onChange={(e) => updateAttributes({ role: e.target.value })}
            placeholder="نقش یا منبع (اختیاری)"
            aria-label="نقش یا منبع نقل‌قول"
            className="dz-quote__input dz-quote__input--role"
          />
        </span>
      </figcaption>
    </NodeViewWrapper>
  );
}
