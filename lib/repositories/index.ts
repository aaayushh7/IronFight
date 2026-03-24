/**
 * Repository index — Upstash Redis is the sole data provider.
 * To switch providers in the future, replace the imports below.
 */

export {
  getMealCompletionsForDate,
  getMealCompletion,
  upsertMealCompletion,
  deleteMealCompletion,
  getCompletionsForDateRange,
  getMealPlanConfig,
  saveMealPlanConfig,
  resetDay,
} from "./upstash-meals";

export {
  createComplaint,
  getComplaints,
  resolveComplaint,
  getMostMissedItems,
} from "./upstash-complaints";
