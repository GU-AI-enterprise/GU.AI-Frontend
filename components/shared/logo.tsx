import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  href?: string;
}

export default function Logo({ className, iconOnly = false, href = "/" }: LogoProps) {
  const content = (
    <div className={cn("select-none", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/main_logo.png"
        alt="GU.AI"
        className={iconOnly ? "h-9 w-9 object-contain" : "h-9 w-auto max-w-[160px] object-contain"}
      />
    </div>
  );

  if (href) {
    return <Link href={href} className="focus:outline-none">{content}</Link>;
  }

  return content;
}
