import { redirect } from "next/navigation";
import { getCurrentIdentity } from "@/services/auth.service";

export default async function ReviewPage() {
  const identity = await getCurrentIdentity();
  redirect(identity?.profile.role === "trainer" ? "/trainer" : "/projects");
}
