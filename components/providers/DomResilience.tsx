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
  }, []);

  return null;
}
