import { redirect } from "next/navigation";

import { DEFAULT_REDIRECT_BY_ROLE } from "@/constants/routes";

export default function AdminIndexPage() {
  redirect(DEFAULT_REDIRECT_BY_ROLE.admin);
}
