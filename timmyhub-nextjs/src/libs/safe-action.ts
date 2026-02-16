import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  // Can add global error handling here
  handleServerError(e) {
    console.error("Action error:", e.message);
    return "Something went wrong. Please try again later.";
  },
});
