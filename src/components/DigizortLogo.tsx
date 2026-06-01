import React from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface DigizortLogoProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function DigizortLogo({ scrollContainerRef }: DigizortLogoProps) {
  // Track scroll progress on the parent heroRef wrapper
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // TRANSFORMS TO CONTROL ELEGANT ASSEMBLY ON SCROLL
  // We complete the assembly by 0.55 scroll progress.
  
  // 1. Globe (Top-center, drifts down, stabilizes at center offsets)
  const globeY = useTransform(scrollYProgress, [0, 0.55], [-130, 0]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.4], [0.85, 1.0]);
  const globeScale = useTransform(scrollYProgress, [0, 0.55], [0.8, 1.0]);
  const globeRotate = useTransform(scrollYProgress, [0, 0.55], [-25, 0]);

  // 2. U-Cradle (Wraps the globe, slides in from the left)
  const cradleX = useTransform(scrollYProgress, [0, 0.55], [-150, 0]);
  const cradleY = useTransform(scrollYProgress, [0, 0.55], [40, 0]);
  const cradleOpacity = useTransform(scrollYProgress, [0, 0.4], [0.85, 1.0]);
  const cradleRotate = useTransform(scrollYProgress, [0, 0.55], [45, 0]);

  // 3. Z-Body (Middle "Z" element, slides in from the right)
  const zX = useTransform(scrollYProgress, [0, 0.55], [150, 0]);
  const zY = useTransform(scrollYProgress, [0, 0.55], [-60, 0]);
  const zOpacity = useTransform(scrollYProgress, [0, 0.4], [0.85, 1.0]);
  const zRotate = useTransform(scrollYProgress, [0, 0.55], [-45, 0]);

  // 4. Circuit Tracks (At the bottom, floats up from below)
  const circuitY = useTransform(scrollYProgress, [0, 0.55], [140, 0]);
  const circuitOpacity = useTransform(scrollYProgress, [0, 0.4], [0.85, 1.0]);
  const circuitScale = useTransform(scrollYProgress, [0, 0.55], [0.85, 1.0]);

  // Elegant drop shadow that increases in depth as the logo merges and the radiant glow activates
  const shadowEffect = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    [
      "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.02))",
      "drop-shadow(0 20px 30px rgba(157, 10, 22, 0.25))",
      "drop-shadow(0 25px 35px rgba(157, 10, 22, 0.3))"
    ]
  );

  // DIGIZORT OFFICIAL LOGO COLOUR: Premium Crimson Red
  const brandRed = "#9D0A16";

  // Radiant brand ambient glow matching the official logo - Intensifies beautifully upon mating
  const glowOpacity = useTransform(scrollYProgress, [0.15, 0.55], [0, 0.65]);
  const glowScale = useTransform(scrollYProgress, [0.15, 0.55], [0.75, 1.2]);

  // Subtle background coordinate lines adjustments
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 0.98]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [0.7, 0.3]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
      
      {/* PREMIUM MICRO-GRID DESIGN CANVAS */}
      <motion.div
        style={{
          scale: bgScale,
          opacity: bgOpacity,
          backgroundImage: `
            linear-gradient(to right, rgba(157, 10, 22, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(157, 10, 22, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
        className="absolute inset-x-[-10%] inset-y-[-10%] w-[120%] h-[120%] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_60%)]"
      />

      {/* ULTRA-FINE BACKGROUND ALIGNMENT TRACKS */}
      <div className="absolute inset-0 max-w-7xl mx-auto flex justify-between px-16 h-full opacity-[0.2]">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-[#9D0A16]/40 to-transparent" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-[#9D0A16]/20 to-transparent hidden md:block" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-[#9D0A16]/40 to-transparent" />
      </div>

      {/* RADIANT AMBIENT BACKGROUND GLOW - ACTIVATES NEAR MERGE COMPLETION */}
      <motion.div
        style={{
          opacity: glowOpacity,
          scale: glowScale,
        }}
        className="absolute w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full bg-[#9D0A16] blur-[65px] pointer-events-none -translate-y-4"
      />

      {/* SOLID VECTOR EMBLEM - ASSEMBLED AND PERSISTENT ON SCROLL */}
      <motion.div
        style={{ filter: shadowEffect }}
        className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ==================== PART 1: THE GLOBE ==================== */}
          <motion.g
            style={{
              y: globeY,
              opacity: globeOpacity,
              scale: globeScale,
              rotate: globeRotate,
              transformOrigin: "200px 100px",
            }}
          >
            {/* Outer Ring */}
            <motion.circle
              cx="200"
              cy="100"
              r="45"
              stroke={brandRed}
              strokeWidth="10"
              fill="none"
            />
            {/* Equatorial Axis */}
            <motion.line
              x1="155"
              y1="100"
              x2="245"
              y2="100"
              stroke={brandRed}
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Vertical Meridian Axis */}
            <motion.line
              x1="200"
              y1="55"
              x2="200"
              y2="145"
              stroke={brandRed}
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Longitude Ellipse */}
            <motion.ellipse
              cx="200"
              cy="100"
              rx="22"
              ry="45"
              stroke={brandRed}
              strokeWidth="10"
              fill="none"
            />
            {/* Latitude Ellipse */}
            <motion.ellipse
              cx="200"
              cy="100"
              rx="45"
              ry="22"
              stroke={brandRed}
              strokeWidth="10"
              fill="none"
            />
          </motion.g>

          {/* ==================== PART 2: THE "U" CRADLE ==================== */}
          <motion.g
            style={{
              x: cradleX,
              y: cradleY,
              opacity: cradleOpacity,
              rotate: cradleRotate,
              transformOrigin: "200px 100px",
            }}
          >
            {/* Solid Cradle Body */}
            <motion.path
              d="M 125,55 L 125,100 A 75,75 0 0,0 275,100 L 275,55"
              stroke={brandRed}
              strokeWidth="26"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* ==================== PART 3: THE HIGH-TECH "Z" ==================== */}
          <motion.g
            style={{
              x: zX,
              y: zY,
              opacity: zOpacity,
              rotate: zRotate,
              transformOrigin: "200px 254px",
            }}
          >
            {/* Solid Z-Body in official Crimson Red */}
            <motion.path
              d="M 135,212 L 265,212 L 135,296 L 265,296"
              stroke={brandRed}
              strokeWidth="26"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* ==================== PART 4: CIRCUIT TRACKS & PIN LEADS ==================== */}
          <motion.g
            style={{
              y: circuitY,
              opacity: circuitOpacity,
              scale: circuitScale,
              transformOrigin: "200px 296px",
            }}
          >
            {/* Left Wire Track */}
            <motion.path
              d="M 175,296 L 175,308 L 150,333 L 150,344"
              stroke={brandRed}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.circle cx="150" cy="356" r="16" fill={brandRed} />

            {/* Center Wire Track */}
            <motion.path
              d="M 200,296 L 200,362"
              stroke={brandRed}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.circle cx="200" cy="374" r="16" fill={brandRed} />

            {/* Right Wire Track */}
            <motion.path
              d="M 225,296 L 225,308 L 250,333 L 250,344"
              stroke={brandRed}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.circle cx="250" cy="356" r="16" fill={brandRed} />
          </motion.g>
        </svg>

        {/* ELEGANT GEOMETRIC LAYOUT DEVIATION LINES (Aesthetic brand accents) */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0.4, 0.8], [0, 0.45]) }}
          className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-[#9D0A16]/30"
        />
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0.4, 0.8], [0, 0.25]) }}
          className="absolute w-[260px] h-[260px] rounded-full border border-[#9D0A16]/15"
        />
      </motion.div>
    </div>
  );
}
