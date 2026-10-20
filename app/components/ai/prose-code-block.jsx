// Adapted from Honest AI registry/ai/prose-code-block.tsx (MIT).
// The compact layout keeps the install command and copy control in one inset panel.
"use client";

import * as React from "react";
import { Check as CheckIcon, Copy as CopyIcon } from "honestui/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
export const defaultProseCodeBlockLabels = {
  copy: "Copy code",
  copied: "Copied",
  copyFailed: "Copy failed"
};
const COPIED_MILLISECONDS = 1500;
/**
 * Code examples with copy feedback and an optional compact install-command layout.
 */
function ProseCodeBlock({
  label,
  code,
  compact = false,
  renderLine,
  codeClassName,
  codeProps,
  actions,
  onCopy,
  labels: labelsProp,
  className,
  ...props
}) {
  const labels = {
    ...defaultProseCodeBlockLabels,
    ...labelsProp
  };
  const [copyState, setCopyState] = React.useState("idle");
  const resetTimer = React.useRef(undefined);
  React.useEffect(() => () => window.clearTimeout(resetTimer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      onCopy?.(code);
    } catch {
      setCopyState("failed");
    }
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), COPIED_MILLISECONDS);
  };
  const lines = code.split("\n");
  const copyButton = (
    <Button type="button" variant="ghost" size="icon" className="size-11 rounded border-0 shadow-none" aria-label={labels.copy} onClick={() => void copy()}>
      {copyState === "copied" ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
    </Button>
  );
  return <figure data-slot="prose-code-block"
  // `not-prose` keeps a prose around this figure from restyling its code.
  className={cn("not-prose m-0 w-full min-w-0 rounded-[8px] bg-[var(--hui-color-background-neutral-primary)] p-1 text-[var(--hui-color-foreground-base-primary)]", className)} {...props}>
      <figcaption className={compact ? "sr-only" : "flex min-w-0 items-center gap-2 py-0.5 ps-2.5 pe-0.5"}>
        <span className="min-w-0 truncate font-mono text-xs text-[var(--hui-color-foreground-base-secondary)]">{label}</span>
        {!compact && <div className="ms-auto flex shrink-0 items-center gap-2">{actions}{copyButton}</div>}
      </figcaption>
      <div className={cn("min-w-0 rounded-[5px] bg-[var(--hui-color-background-base-primary)] shadow-[inset_0_0_0_0.5px_var(--hui-color-border-base-primary)]", compact ? "flex items-center p-1" : "mt-1")}>
      {/* Focusable so a keyboard user can scroll long lines. The shell is the frame, so the panel keeps only its hairline. */}
      <pre tabIndex={0} aria-label={label} {...codeProps} className={cn("m-0 min-w-0 flex-1 overflow-x-auto rounded-[5px] px-4 py-3.5 font-mono text-[0.8125rem] leading-[1.65] outline-none focus-visible:[outline:var(--hui-focus-ring)] focus-visible:outline-offset-[var(--hui-focus-ring-offset-inset)]", codeClassName, "[&&]:border-0! [&&]:rounded-[5px]!")}>
        <code className="block w-max min-w-full">
          {lines.map((line, index) => <React.Fragment key={index}>
              {renderLine ? renderLine(line, index) : line}
              {index < lines.length - 1 ? "\n" : null}
            </React.Fragment>)}
        </code>
      </pre>
        {compact && <div className="flex shrink-0 items-center gap-2">{actions}{copyButton}</div>}
      </div>
      <span role="status" className="sr-only">
        {copyState === "copied" ? labels.copied : copyState === "failed" ? labels.copyFailed : ""}
      </span>
      {copyState === "failed" && <p className="m-0 px-2.5 pt-1.5 pb-0.5 text-xs">{labels.copyFailed}</p>}
    </figure>;
}
export { ProseCodeBlock };
