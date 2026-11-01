let inited = false;
let authP: Promise<any> | null = null;

/** Pi.init once. NEXT_PUBLIC_PI_SANDBOX=true for Testnet. Returns null outside Pi Browser. */
export function getPi(): any | null {
  const Pi = typeof window !== "undefined" ? (window as any).Pi : null;
  if (!Pi) return null;
  if (!inited) { Pi.init({ version: "2.0", sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true" }); inited = true; }
  return Pi;
}

export function piAuth(Pi: any) {
  authP ??= Pi.authenticate(["username", "payments"], (payment: any) => {
    fetch("/api/pi/incomplete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payment }) }).catch(() => {});
  }).catch((e: unknown) => { authP = null; throw e; });
  return authP;
}
