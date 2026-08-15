import React from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { motion as Motion } from "framer-motion";

const FloatingContactButtons = () => {
  return (
    <>
      <Motion.a
        href="https://wa.me/919342830199"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ y: 0 }}
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="fixed bottom-4 left-3 z-50 bg-black border border-amber-300 text-amber-300 p-3 overflow-hidden rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <FaWhatsapp size={18} />
      </Motion.a>

      <Motion.a
        href="tel:+919342830199"
        initial={{ y: 0 }}
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="fixed bottom-20 left-3  z-50 border bg-black text-amber-300 border-amber-300 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <FaPhoneAlt size={18} />
      </Motion.a>
    </>
  );
};

export default FloatingContactButtons;
