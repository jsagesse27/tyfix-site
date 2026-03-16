'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Logo Container */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" } 
              }}
              className="relative z-10"
            >
              <Image
                src="/tyfix-logo.png"
                alt="TyFix Auto Sales"
                width={200}
                height={64}
                className="h-16 w-auto"
                priority
              />
            </motion.div>

            {/* Glowing effect behind logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 2, 
                opacity: 0.15,
                transition: { delay: 0.3, duration: 1.2, ease: "easeOut" } 
              }}
              className="absolute inset-0 bg-primary blur-3xl rounded-full"
            />
          </div>

          {/* Progress loader */}
          <div className="absolute bottom-20 w-48 h-[2px] bg-slate-100 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ 
                x: "100%",
                transition: { duration: 1.5, repeat: Infinity, ease: "linear" } 
              }}
              className="w-full h-full bg-primary"
            />
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.5, duration: 0.5 } 
            }}
            className="absolute bottom-12 text-[10px] uppercase tracking-[0.3em] font-black text-slate-400"
          >
            Houston's Cash Car Specialist
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
