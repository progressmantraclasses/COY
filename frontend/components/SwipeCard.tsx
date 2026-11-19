"use client";

import Image from "next/image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { animate, motion, PanInfo, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { GraduationCap, MapPin } from "lucide-react";
import { colorSlot, type Profile, type SwipeAction } from "@/lib/api";

export interface SwipeCardHandle {
  swipe: (action: SwipeAction) => void;
}

interface Props {
  profile: Profile;
  depth: number; // 0 = top card, 1 = peeking behind, 2 = preloaded
  onSwiped: (action: SwipeAction) => void;
}

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 650;

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ profile, depth, onSwiped }, ref) {
  const isTop = depth === 0;
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [24, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-110, -24], [1, 0]);
  const committed = useRef(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  async function fly(action: SwipeAction) {
    if (committed.current) return;
    committed.current = true;
    const dir = action === "like" ? 1 : -1;
    if (reduceMotion) {
      await animate(x, dir * 120, { duration: 0.12 });
    } else {
      // Pass through the stamp zone first so button swipes show LIKE/NOPE too.
      if (Math.abs(x.get()) < SWIPE_DISTANCE) await animate(x, dir * 130, { duration: 0.14, ease: "easeOut" });
      const off = (typeof window !== "undefined" ? window.innerWidth : 600) + 240;
      await animate(x, dir * off, { duration: 0.3, ease: [0.4, 0, 0.2, 1] });
    }
    onSwiped(action);
  }

  useImperativeHandle(ref, () => ({ swipe: fly }));

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) return void fly("like");
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) return void fly("pass");
    animate(x, 0, { type: "spring", stiffness: 520, damping: 32 });
  }

  const slot = colorSlot(profile.name) + 1;

  return (
    <motion.article
      className={`card ${isTop ? "top" : "behind"}`}
      style={isTop ? { x, rotate, zIndex: 10 } : { zIndex: 10 - depth }}
      initial={false}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 1 ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      drag={isTop ? "x" : false}
      dragMomentum={false}
      onDragEnd={isTop ? onDragEnd : undefined}
      aria-hidden={!isTop}
      aria-label={isTop ? `${profile.name}, ${profile.age}` : undefined}
    >
      {isTop && (
        <>
          <motion.div className="stamp like" style={{ opacity: likeOpacity }} aria-hidden>Like</motion.div>
          <motion.div className="stamp nope" style={{ opacity: nopeOpacity }} aria-hidden>Nope</motion.div>
        </>
      )}

      <div className="card-photo">
        {!photoFailed ? (
          <Image
            src={profile.photo}
            alt={`Photo of ${profile.name}`}
            fill
            sizes="(max-width: 480px) 100vw, 440px"
            priority={depth < 2}
            draggable={false}
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className={`photo-fallback avatar c${slot}`} style={{ borderRadius: 0, width: "100%", height: "100%" }} aria-hidden>
            {profile.name[0]}
          </div>
        )}
        {profile.college && (
          <span className="card-chip">
            <GraduationCap size={14} strokeWidth={2.4} aria-hidden />
            {profile.college}
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="card-name">
          <h2>{profile.name}</h2>
          <span className="age">{profile.age}</span>
        </div>
        <div className="card-meta">
          <span>
            <MapPin size={14} strokeWidth={2.4} aria-hidden />
            {profile.city}
          </span>
        </div>
        <p className="card-bio">{profile.bio}</p>
        <ul className="pills" aria-label="Interests">
          {profile.interests.map((it, i) => (
            <li key={it} className={`pill c${i % 5}`}>{it}</li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
});

export default SwipeCard;
