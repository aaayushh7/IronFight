"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="text-2xl font-bold text-slate-700 mb-2">
          Page not found
        </h1>
        <p className="text-slate-400 font-medium mb-8">
          This page doesn't exist, but your meals do!
        </p>
        <Button asChild variant="pill">
          <Link href="/">Back to home</Link>
        </Button>
      </motion.div>
    </div>
  );
}
