import React, { memo } from "react";
import { motion } from "framer-motion";

const Ray = memo(({ from, delay = 0, duration = 8 }) => (
  <motion.span
    className="absolute -top-10 h-[130%] w-px bg-gradient-to-b from-transparent via-gold-400/25 to-transparent"
    style={{ left: from }}
    initial={{ opacity: 0, rotate: -12 }}
    animate={{ opacity: [0, 0.7, 0], rotate: 14 }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    aria-hidden="true"
  />
));

export default Ray;