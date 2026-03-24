"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealConfig, MealItemDetail, ItemTag, TAG_META } from "@/lib/types";
import { Button } from "./ui/button";

interface MealCompleteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  config: MealConfig;
  onComplete: (items: string[], notes?: string) => Promise<void>;
  existingItems?: string[];
  onConfettiTrigger?: () => void;
}

// ─── Smart suggestion logic ───────────────────────────────────────────────────
function getSuggestion(
  selectedItems: Set<string>,
  itemDetails: MealItemDetail[]
): string | null {
  const selected = itemDetails.filter((i) => selectedItems.has(i.name));
  const hasIron = selected.some((i) => i.tags.includes("iron-rich"));
  const hasVitC = selected.some((i) => i.tags.includes("vitamin-c"));
  const hasProtein = selected.some((i) => i.tags.includes("protein"));

  if (hasIron && !hasVitC && selected.length >= 2) {
    return "Add lemon or amla — they help absorb 3× more iron 🍋";
  }
  if (!hasIron && selected.length >= 3) {
    return "Try adding dal, palak, or chana for iron recovery 💖";
  }
  if (!hasProtein && selected.length >= 3) {
    return "Adding a protein source (eggs, paneer, dal) helps recovery 💪";
  }
  if (hasIron && hasVitC && selected.length >= 3) {
    return "Perfect combo! Iron + Vitamin C = maximum absorption 🌟";
  }
  return null;
}

// Tag pill component
function TagPill({ tag }: { tag: ItemTag }) {
  const meta = TAG_META[tag];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border",
        meta.bg,
        meta.color
      )}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

export function MealCompleteSheet({
  isOpen,
  onClose,
  config,
  onComplete,
  existingItems = [],
  onConfettiTrigger,
}: MealCompleteSheetProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(existingItems)
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const itemDetailMap = useMemo(() => {
    const map = new Map<string, MealItemDetail>();
    for (const d of config.itemDetails ?? []) {
      map.set(d.name, d);
    }
    return map;
  }, [config.itemDetails]);

  const suggestion = useMemo(
    () => getSuggestion(selectedItems, config.itemDetails ?? []),
    [selectedItems, config.itemDetails]
  );

  const toggleItem = (item: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const handleComplete = async () => {
    if (selectedItems.size === 0) return;
    setIsLoading(true);
    try {
      await onComplete(Array.from(selectedItems), notes || undefined);
      onConfettiTrigger?.();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const selectAll = () => setSelectedItems(new Set(config.items));
  const clearAll = () => setSelectedItems(new Set());

  // Priority: recovery-best items shown first
  const sortedItems = useMemo(() => {
    return [...config.items].sort((a, b) => {
      const aTags = itemDetailMap.get(a)?.tags ?? [];
      const bTags = itemDetailMap.get(b)?.tags ?? [];
      const aScore = aTags.includes("recovery-best")
        ? 2
        : aTags.includes("iron-rich")
        ? 1
        : 0;
      const bScore = bTags.includes("recovery-best")
        ? 2
        : bTags.includes("iron-rich")
        ? 1
        : 0;
      return bScore - aScore;
    });
  }, [config.items, itemDetailMap]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/25 backdrop-blur-[6px] z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 42 }}
          >
            <div className="max-w-md mx-auto bg-white/96 backdrop-blur-2xl rounded-t-[2rem] shadow-2xl shadow-purple-300/25 border-t border-white/80">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              <div className="px-6 pb-8 pt-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${config.color}30` }}
                    >
                      {config.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 text-lg leading-tight">
                        {config.label}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Select what you had today
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Select all / clear */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={selectAll}
                    className="text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    Select all
                  </button>
                  <span className="text-slate-200">·</span>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedItems.size}/{config.items.length}
                    </span>
                    {selectedItems.size > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Smart suggestion banner */}
                <AnimatePresence>
                  {suggestion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-100">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Items grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto pr-0.5">
                  {sortedItems.map((item) => {
                    const isSelected = selectedItems.has(item);
                    const detail = itemDetailMap.get(item);
                    const primaryTags = (detail?.tags ?? []).slice(0, 2);
                    const isRecoveryBest = detail?.tags.includes("recovery-best");

                    return (
                      <motion.button
                        key={item}
                        onClick={() => toggleItem(item)}
                        className={cn(
                          "flex flex-col gap-1.5 p-3 rounded-2xl border transition-all duration-150 text-left relative overflow-hidden",
                          isSelected
                            ? "border-purple-300/70 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm shadow-purple-100"
                            : "border-slate-100 bg-white/70 hover:border-purple-200 hover:bg-white"
                        )}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Recovery best glow dot */}
                        {isRecoveryBest && !isSelected && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-pink-400 opacity-70" />
                        )}

                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 border",
                              isSelected
                                ? "bg-gradient-to-br from-purple-400 to-pink-400 border-transparent shadow-sm"
                                : "border-slate-200 bg-white"
                            )}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[13px] font-semibold leading-tight",
                              isSelected ? "text-purple-700" : "text-slate-600"
                            )}
                          >
                            {item}
                          </span>
                        </div>

                        {/* Tags row */}
                        {primaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 ml-7">
                            {primaryTags.map((tag) => (
                              <TagPill key={tag} tag={tag} />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes? (optional)"
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100 transition-all"
                  />
                </div>

                {/* Complete button */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleComplete}
                    disabled={selectedItems.size === 0 || isLoading}
                    className="w-full h-13 text-base rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-200/60 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Mark meal done
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
