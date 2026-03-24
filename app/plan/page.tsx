"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Edit3, Plus, X, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { MealConfig, MealType } from "@/lib/types";
import { formatTime } from "@/lib/meal-schedule";

export default function PlanPage() {
  const [configs, setConfigs] = useState<MealConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<MealType | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);

  // Edit state
  const [editForm, setEditForm] = useState<{
    startTime: string;
    endTime: string;
    items: string[];
    newItem: string;
  }>({ startTime: "", endTime: "", items: [], newItem: "" });

  const [isSaving, setIsSaving] = useState(false);

  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch("/api/plan");
      const data = await res.json();
      if (data.configs) setConfigs(data.configs);
    } catch {
      toast.error("Couldn't load plan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const startEdit = (config: MealConfig) => {
    setEditForm({
      startTime: config.startTime,
      endTime: config.endTime,
      items: [...config.items],
      newItem: "",
    });
    setEditingMeal(config.type);
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setEditForm({ startTime: "", endTime: "", items: [], newItem: "" });
  };

  const addItem = () => {
    const item = editForm.newItem.trim();
    if (!item || editForm.items.includes(item)) return;
    setEditForm((prev) => ({
      ...prev,
      items: [...prev.items, item],
      newItem: "",
    }));
  };

  const removeItem = (item: string) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i !== item),
    }));
  };

  const saveEdit = async () => {
    if (!editingMeal) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: editingMeal,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          items: editForm.items,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.configs) setConfigs(data.configs);
      cancelEdit();
      toast.success("Meal plan updated ✓");
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-5 pb-4">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Customize
        </p>
        <h1 className="text-2xl font-bold text-slate-700">Meal Plan</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Edit meal times and food items
        </p>
      </div>

      {configs.map((config, index) => {
        const isEditing = editingMeal === config.type;
        const isExpanded = expandedMeal === config.type || isEditing;

        return (
          <motion.div
            key={config.type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            {/* Header row */}
            <button
              className="w-full p-5 flex items-center gap-3 text-left"
              onClick={() => {
                if (!isEditing) {
                  setExpandedMeal(isExpanded ? null : config.type);
                }
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${config.color}40` }}
              >
                {config.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-700">{config.label}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatTime(config.startTime)} – {formatTime(config.endTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(config);
                      setExpandedMeal(config.type);
                    }}
                    className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {!isEditing && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                )}
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100/60 pt-4">
                    {isEditing ? (
                      <>
                        {/* Time inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                              Start time
                            </label>
                            <input
                              type="time"
                              value={editForm.startTime}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  startTime: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                              End time
                            </label>
                            <input
                              type="time"
                              value={editForm.endTime}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  endTime: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100"
                            />
                          </div>
                        </div>

                        {/* Items editor */}
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-2 block">
                            Food items
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {editForm.items.map((item) => (
                              <span
                                key={item}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-sm text-slate-600"
                              >
                                {item}
                                <button
                                  onClick={() => removeItem(item)}
                                  className="text-slate-300 hover:text-red-400 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editForm.newItem}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  newItem: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => e.key === "Enter" && addItem()}
                              placeholder="Add item..."
                              className="flex-1 px-4 py-2.5 bg-slate-50 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100"
                            />
                            <button
                              onClick={addItem}
                              className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 hover:bg-purple-200 transition-colors flex-shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={isSaving}
                            className="flex-1"
                          >
                            {isSaving ? (
                              <motion.div
                                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                              />
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {config.items.map((item) => (
                          <span
                            key={item}
                            className="px-3 py-1.5 bg-white/60 rounded-full border border-slate-100 text-sm text-slate-600 font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Info note */}
      <div className="glass-card rounded-2xl p-4 flex gap-3">
        <span className="text-xl">💡</span>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Changes to meal times and items take effect immediately. Your daily
          completion history is preserved.
        </p>
      </div>
    </div>
  );
}
