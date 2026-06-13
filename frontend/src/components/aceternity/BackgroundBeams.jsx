import { motion } from 'framer-motion';

export default function BackgroundBeams() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-40 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
          style={{ top: `${15 + i * 14}%`, left: `${5 + i * 12}%` }}
          animate={{ x: [0, 120, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
