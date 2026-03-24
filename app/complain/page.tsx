"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Search, Send, Check, Clock, AlertCircle, X, ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { MealConfig, MealType, Complaint, TAG_META } from "@/lib/types";
import { getTimeAgo } from "@/lib/utils";

const MEAL_EMOJI: Record<MealType, string> = {
  morning:      "🌅",
  breakfast:    "🌸",
  lunch:        "🌿",
  eveningSnack: "☁️",
  dinner:       "🌙",
  beforeBed:    "🌙✨",
};

const MEAL_LABEL: Record<MealType, string> = {
  morning:      "Morning Ritual",
  breakfast:    "Breakfast",
  lunch:        "Lunch",
  eveningSnack: "Evening Snack",
  dinner:       "Dinner",
  beforeBed:    "Before Bed",
};

export default function ComplainPage() {
  const [configs, setConfigs] = useState<MealConfig[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [planRes, complaintsRes] = await Promise.all([
        fetch("/api/plan"),
        fetch("/api/complaints?limit=40"),
      ]);
      const [planData, complaintsData] = await Promise.all([
        planRes.json(),
        complaintsRes.json(),
      ]);
      if (planData.configs) setConfigs(planData.configs);
      if (complaintsData.complaints) setComplaints(complaintsData.complaints);
    } catch {
      toast.error("Couldn't load data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedMealConfig = configs.find((c) => c.type === selectedMealType);

  const filteredItems = selectedMealConfig
    ? selectedMealConfig.items.filter((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSubmit = async () => {
    if (!selectedMealType || !selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: selectedMealType,
          itemName: selectedItem,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      setComplaints((prev) => [data.complaint, ...prev]);
      setSelectedItem(null);
      setNote("");
      setSearchQuery("");

      toast.success("Report sent 💌", {
        description: `"${selectedItem}" has been flagged as missing`,
      });
    } catch {
      toast.error("Couldn't submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "resolved" } : c))
      );
      toast.success("Marked as resolved ✓");
    } catch {
      toast.error("Couldn't resolve. Try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-5">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
      </div>
    );
  }

  const openComplaints = complaints.filter((c) => c.status === "open");
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved");

  return (
    <div className="px-4 pt-6 space-y-5 pb-4">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Let them know
        </p>
        <h1 className="text-2xl font-extrabold text-slate-700 tracking-tight">
          Missing Items 💌
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Report anything unavailable or finished
        </p>
      </div>

      {/* Step 1: Choose meal */}
      <div className="glass-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm shadow-purple-200">
            <span className="text-white text-[10px] font-extrabold">1</span>
          </div>
          <p className="font-bold text-slate-700 text-sm">Which meal?</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {configs.map((config) => (
            <motion.button
              key={config.type}
              onClick={() => {
                setSelectedMealType(config.type);
                setSelectedItem(null);
                setSearchQuery("");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all duration-150 ${
                selectedMealType === config.type
                  ? "border-purple-300/80 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-sm shadow-purple-100"
                  : "border-slate-200 bg-white/60 text-slate-600 hover:border-purple-200"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-base">{config.emoji}</span>
              <span>{config.label}</span>
              {selectedMealType === config.type && (
                <Check className="w-3.5 h-3.5 text-purple-500" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Step 2: Choose item */}
      <AnimatePresence>
        {selectedMealType && selectedMealConfig && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="glass-card rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm shadow-purple-200">
                <span className="text-white text-[10px] font-extrabold">2</span>
              </div>
              <p className="font-bold text-slate-700 text-sm">
                What's missing from{" "}
                <span className="text-purple-600">{selectedMealConfig.label}</span>?
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>

            {/* Items with tag indicators */}
            <div className="flex flex-wrap gap-2">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const detail = selectedMealConfig.itemDetails?.find(
                    (d) => d.name === item
                  );
                  const isIronRich = detail?.tags.includes("iron-rich");
                  const isRecovery = detail?.tags.includes("recovery-best");
                  return (
                    <motion.button
                      key={item}
                      onClick={() => setSelectedItem(item)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all duration-150 ${
                        selectedItem === item
                          ? "border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 shadow-sm shadow-rose-100"
                          : "border-slate-200 bg-white/60 text-slate-600 hover:border-rose-200"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isIronRich && (
                        <span className="text-[10px] opacity-70">🩸</span>
                      )}
                      {isRecovery && !isIronRich && (
                        <span className="text-[10px] opacity-70">💖</span>
                      )}
                      {item}
                    </motion.button>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 py-2">No items found</p>
              )}
            </div>

            {/* Custom item */}
            {searchQuery &&
              !filteredItems.some(
                (i) => i.toLowerCase() === searchQuery.toLowerCase()
              ) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedItem(searchQuery)}
                  className="flex items-center gap-2 text-sm text-purple-600 font-bold"
                >
                  <span className="w-5 h-5 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center text-xs">
                    +
                  </span>
                  Report "{searchQuery}" as custom item
                </motion.button>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Note + submit */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="glass-card rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm shadow-purple-200">
                <span className="text-white text-[10px] font-extrabold">3</span>
              </div>
              <p className="font-bold text-slate-700 text-sm">Add a note</p>
              <span className="text-xs text-slate-400 font-medium">(optional)</span>
            </div>

            {/* Selected summary pill */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-50 rounded-2xl border border-rose-100">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-sm font-bold text-rose-700">{selectedItem}</span>
              <span className="text-xs text-rose-400">·</span>
              <span className="text-xs text-rose-400 font-semibold">
                {MEAL_LABEL[selectedMealType!]}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="ml-auto text-rose-300 hover:text-rose-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='e.g. "dal finished", "no amla today", "roti unavailable"'
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100"
            />

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-2xl"
            >
              {isSubmitting ? (
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send report 💌
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaint history */}
      {complaints.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest w-full"
          >
            <span>
              Report history
              {openComplaints.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-500 rounded-full text-[10px] font-bold">
                  {openComplaints.length} open
                </span>
              )}
            </span>
            <motion.div
              animate={{ rotate: showHistory ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="space-y-2.5 overflow-hidden"
              >
                {openComplaints.map((complaint, i) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">
                            {MEAL_EMOJI[complaint.mealType] ?? "🍽️"}
                          </span>
                          <span className="font-bold text-slate-700 text-sm">
                            {complaint.itemName}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs font-bold">
                            {MEAL_LABEL[complaint.mealType] ?? complaint.mealType}
                          </span>
                        </div>
                        {complaint.note && (
                          <p className="text-xs text-slate-400 mt-1 font-medium italic">
                            "{complaint.note}"
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-xs text-slate-400 font-medium">
                            {getTimeAgo(complaint.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResolve(complaint.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex-shrink-0"
                      >
                        <Check className="w-3 h-3" />
                        Resolve
                      </button>
                    </div>
                  </motion.div>
                ))}

                {resolvedComplaints.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mb-2">
                      Resolved
                    </p>
                    {resolvedComplaints.slice(0, 5).map((complaint) => (
                      <div
                        key={complaint.id}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/40 mb-2 opacity-55"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm text-slate-500 font-medium">
                          {complaint.itemName}
                        </span>
                        <span className="text-xs text-slate-400">
                          · {MEAL_LABEL[complaint.mealType] ?? complaint.mealType}
                        </span>
                        <span className="ml-auto text-xs text-slate-400">
                          {getTimeAgo(complaint.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {complaints.length === 0 && (
        <div className="text-center py-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl mb-3"
          >
            ✨
          </motion.div>
          <p className="font-bold text-slate-500">Nothing to report yet</p>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">
            All items available? Keep it up! 💖
          </p>
        </div>
      )}
    </div>
  );
}
