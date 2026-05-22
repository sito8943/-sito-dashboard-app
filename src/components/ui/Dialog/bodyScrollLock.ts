let lockCount = 0;
let previousOverflow: string | null = null;

const hasBody = () => typeof document !== "undefined" && !!document.body;

/**
 * Locks body scroll while preserving previous inline overflow style.
 * Multiple callers can lock concurrently; body is restored on final unlock.
 */
export const lockBodyScroll = () => {
  if (!hasBody()) return;

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  lockCount += 1;
};

/**
 * Releases one body scroll lock.
 * Restores previous overflow only when all locks are released.
 */
export const unlockBodyScroll = () => {
  if (!hasBody()) return;
  if (lockCount === 0) return;

  lockCount -= 1;

  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? "";
    previousOverflow = null;
  }
};

/**
 * Test-only helper to reset lock state between specs.
 */
export const resetBodyScrollLockForTests = () => {
  lockCount = 0;
  previousOverflow = null;

  if (hasBody()) {
    document.body.style.overflow = "";
  }
};
