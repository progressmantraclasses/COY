"use client";

import Image from "next/image";
import { useState } from "react";
import { colorSlot } from "@/lib/api";

interface Props {
  name: string;
  photo?: string;
  size?: "md" | "lg";
  label?: string;
}

/** Round avatar: photo when it loads, otherwise Coy-style coloured initials. */
export default function Avatar({ name, photo, size = "md", label }: Props) {
  const [failed, setFailed] = useState(false);
  const slot = colorSlot(name) + 1;
  const px = size === "lg" ? 104 : 46;
  return (
    <span className={`avatar c${slot} ${size === "lg" ? "lg" : ""}`} aria-label={label} role={label ? "img" : undefined}>
      {photo && !failed ? (
        <Image src={photo} alt="" fill sizes={`${px}px`} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden>{name.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}
