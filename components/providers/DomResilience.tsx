"use client";

import { useEffect } from "react";

// Browser extensions (Grammarly, some translate extensions, etc.) modify the DOM
// by moving/replacing text nodes, which breaks React's insertBefore and removeChild
// calls during reconciliation. This patch makes those calls no-ops instead of crashes.
let patched = false;

export function DomResilience() {
  useEffect(() => {
    if (patched) return;
    patched = true;

    const origInsertBefore = Node.prototype.insertBefore;
    // @ts-expect-error — generic override
    Node.prototype.insertBefore = function (newNode, ref) {
      if (ref && ref.parentNode !== this) {
        return this.appendChild(newNode);
      }
      return origInsertBefore.call(this, newNode, ref);
    };

    const origRemoveChild = Node.prototype.removeChild;
    // @ts-expect-error — generic override
    Node.prototype.removeChild = function (child) {
      if (child.parentNode !== this) {
        return child;
      }
      return origRemoveChild.call(this, child);
    };

    // Suppress React 19 next-themes script tag warning
    const origError = console.error;
    console.error = function (...args) {
      if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
        return;
      }
      origError.apply(console, args);
    };
  }, []);

  return null;
}
