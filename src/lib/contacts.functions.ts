import { createServerFn } from "@tanstack/react-start";
import type { PublicContacts } from "@/lib/contacts.server";

export const getPublicContacts = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicContacts> => {
    const { fetchPublicContacts } = await import("@/lib/contacts.server");
    return fetchPublicContacts();
  },
);
