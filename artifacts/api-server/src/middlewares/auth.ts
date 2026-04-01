import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.sub !== "string") {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const exp = payload.exp as number | undefined;
  if (exp && exp * 1000 < Date.now()) {
    res.status(401).json({ error: "Token expired" });
    return;
  }

  req.userId = payload.sub;
  req.userEmail = typeof payload.email === "string" ? payload.email : undefined;
  next();
}
