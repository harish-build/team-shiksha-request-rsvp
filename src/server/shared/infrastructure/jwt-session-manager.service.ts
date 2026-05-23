import jwt, { type SignOptions } from "jsonwebtoken";
import type {
  BaseSessionPayload,
  SessionManager,
} from "../domain/interfaces/session-manager.service";

export class JwtSessionManager<T extends BaseSessionPayload = BaseSessionPayload>
  implements SessionManager<T>
{
  private readonly secret: string;
  private readonly accessTokenExpiry: SignOptions["expiresIn"];

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    this.secret = secret;
    this.accessTokenExpiry = (process.env.JWT_ACCESS_EXPIRY ?? "1h") as SignOptions["expiresIn"];
  }

  async createSession(payload: Omit<T, "iat" | "exp">): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: this.accessTokenExpiry });
  }

  async validateSession(token: string): Promise<T | null> {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (!decoded || typeof decoded === "string") {
        return null;
      }
      return decoded as T;
    } catch {
      return null;
    }
  }
}
