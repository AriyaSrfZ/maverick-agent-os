"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Layers, Sliders, RefreshCw, Eye } from "lucide-react";
import Velaris from "@/components/ui/velaris";

const PRESET_PALETTES = [
  {
    name: "Emerald Aurora (Default)",
    bg: "#000000",
    colors: ["#86efac", "#4ade80", "#059669", "#000000"],
  },
  {
    name: "Cyber Neon",
    bg: "#09090b",
    colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#0284c7"],
  },
  {
    name: "Solar Dusk",
    bg: "#0a0a0a",
    colors: ["#fb923c", "#f43f5e", "#a855f7", "#312e81"],
  },
  {
    name: "Deep Ocean",
    bg: "#020617",
    colors: ["#38bdf8", "#0284c7", "#1e40af", "#0f172a"],
  },
];

export default function VelarisMotionDemo() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [speed, setSpeed] = useState(1.5);
  const [grain, setGrain] = useState(0.25);
  const shouldReduceMotion = useReducedMotion();

  const currentPalette = PRESET_PALETTES[paletteIndex];
  const effectiveSpeed = shouldReduceMotion ? 0 : speed;

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl">
      <Velaris
        bg={currentPalette.bg}
        colors={currentPalette.colors}
        speed={effectiveSpeed}
        grain={grain}
        height="620px"
        className="rounded-xl"
      >
        <div className="relative flex h-full w-full flex-col items-center justify-between p-6 sm:p-10">
          {/* Top Bar: Glass Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>WebGL Simplex Noise Shader</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span className="text-white/70">60 FPS Hardware Accelerated</span>
          </motion.div>

          {/* Hero Content with Framer Motion Staggered Entrance */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12, delayChildren: 0.2 },
              },
            }}
            className="flex max-w-2xl flex-col items-center text-center"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 350, damping: 28 },
                },
              }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl"
            >
              Living gradients <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 bg-clip-text text-transparent">
                in perpetual motion
              </span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="mt-4 max-w-lg text-sm text-zinc-300/90 sm:text-base leading-relaxed"
            >
              Real-time WebGL simplex-noise field featuring continuous 4-color
              interpolation, radial vignette occlusion, and procedural film grain.
            </motion.p>

            {/* Interactive Actions with Spring Hover & Tap Gestures */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() =>
                  setPaletteIndex((prev) => (prev + 1) % PRESET_PALETTES.length)
                }
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 shadow-md hover:bg-zinc-100 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Cycle Palette ({currentPalette.name})
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setSpeed((s) => (s === 0 ? 1.5 : 0))}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/15 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                {speed === 0 ? "Resume Flow" : "Pause Motion"}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Bottom Bar: Interactive Glass Control Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex w-full max-w-lg items-center justify-between rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white/80 backdrop-blur-lg"
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-white">Controls:</span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5">
                <span className="text-zinc-400">Speed</span>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.2"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="h-1 w-16 cursor-pointer accent-emerald-400"
                />
              </label>

              <label className="flex items-center gap-1.5">
                <span className="text-zinc-400">Grain</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={grain}
                  onChange={(e) => setGrain(parseFloat(e.target.value))}
                  className="h-1 w-16 cursor-pointer accent-emerald-400"
                />
              </label>
            </div>
          </motion.div>
        </div>
      </Velaris>
    </div>
  );
}
