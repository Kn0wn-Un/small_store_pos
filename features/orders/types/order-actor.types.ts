export type CreateOrderActorContext = {
  /** User performing the action (audit log). */
  actorUserId: string;
  /** POS cashier attribution; null for ecommerce self-checkout. */
  cashierUserId?: string | null;
};
