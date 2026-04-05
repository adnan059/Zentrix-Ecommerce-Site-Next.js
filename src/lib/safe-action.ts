import { auth } from "@/auth";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred";
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in");
  return next({ ctx: { userId: session.user.id, user: session.user } });
});
