"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  emoji: string;
  delay: number;
  duration: number;
  size: number;
}

const EMOJIS = ["🌸", "💖", "✨", "🌿", "💫", "🎀", "🌺", "💕", "⭐", "🍀"];

interface ConfettiProps {
  show: boolean;
  onDone?: () => void;
}

export function Confetti({ show, onDone }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      delay: Math.random() * 0.4,
      duration: 1.2 + Math.random() * 0.8,
      size: 14 + Math.floor(Math.random() * 12),
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onDone?.();
    }, 2400);

    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute bottom-0"
              style={{ left: `${p.x}%`, fontSize: p.size }}
              initial={{ y: 0, opacity: 1, scale: 0.6 }}
              animate={{
                y: -(typeof window !== "undefined" ? window.innerHeight * 0.85 : 600),
                opacity: [1, 1, 0.8, 0],
                scale: [0.6, 1.1, 1, 0.8],
                rotate: [0, Math.random() > 0.5 ? 30 : -30, 0],
              }}
              transition={{
                delay: p.delay,
                duration: p.duration,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
