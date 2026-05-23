import { cookies } from "next/headers";
import { POS_CART_COOKIE_KEY } from "../constants/pos.constants";

export async function getPosCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(POS_CART_COOKIE_KEY)?.value ?? null;
}

export async function setPosCartIdCookie(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(POS_CART_COOKIE_KEY, cartId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearPosCartIdCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(POS_CART_COOKIE_KEY);
}
