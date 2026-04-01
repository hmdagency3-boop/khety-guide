import { motion } from "framer-motion";

export function LoadingScarab({ message = "Unearthing secrets..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
      <div className="relative mb-6">
        {/* Outer glow pulse */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse scale-125" />

        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-20 h-20"
        >
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="56 170"
              strokeLinecap="round"
              className="text-primary"
            />
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
            />
          </svg>
        </motion.div>

        {/* Center avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg shadow-primary/20"
          >
            <img
              src="/khety-avatar.png"
              alt="Loading"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Dots animation */}
      <div className="flex items-center gap-2 mb-3">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        ))}
      </div>

      <p className="text-primary/70 font-semibold tracking-widest text-xs uppercase">
        {message}
      </p>
    </div>
  );
}
