import { useEffect, useRef, useCallback } from "react";

// types
import { DropdownPropsType } from "./types";

// styles
import "./styles.css";

export const Dropdown = (props: DropdownPropsType) => {
  const { children, open, onClose } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current;
      if (!open || !el) return;
      if (!el.contains(e.target as Node)) onClose();
    },
    [open, onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!open) return;
    // focus container for immediate Escape handling
    setTimeout(() => containerRef.current?.focus(), 0);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handlePointerDown, handleKeyDown]);

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-hidden={!open}
      tabIndex={-1}
      className={`dropdown-main ${open ? "opened" : "closed"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};
