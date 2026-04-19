/**
 * JWT Utility - Decode and validate JWT tokens
 */

export class JwtUtility {
  /**
   * Decode JWT token and extract payload
   * @param token JWT token string
   * @returns Decoded payload or null if invalid
   */
  static decodeToken(token: string | null): any {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time in milliseconds (Unix timestamp * 1000)
   * @param token JWT token string
   * @returns Expiration time in milliseconds or null if invalid
   */
  static getTokenExpiration(token: string | null): number | null {
    const decoded = this.decodeToken(token);
    if (decoded && decoded.exp) {
      return decoded.exp * 1000; // Convert to milliseconds
    }
    return null;
  }

  /**
   * Check if token is expired
   * @param token JWT token string
   * @param bufferSeconds Buffer time in seconds (check expiration before actual expiry)
   * @returns True if token is expired or will expire within buffer time
   */
  static isTokenExpired(token: string | null, bufferSeconds: number = 0): boolean {
    const expirationMs = this.getTokenExpiration(token);
    if (!expirationMs) {
      return true; // Consider invalid token as expired
    }

    const currentTimeMs = Date.now();
    const bufferMs = bufferSeconds * 1000;

    return currentTimeMs >= (expirationMs - bufferMs);
  }

  /**
   * Get remaining time until token expiration in seconds
   * @param token JWT token string
   * @returns Seconds remaining, or -1 if already expired
   */
  static getTokenRemainingSeconds(token: string | null): number {
    const expirationMs = this.getTokenExpiration(token);
    if (!expirationMs) {
      return -1;
    }

    const currentTimeMs = Date.now();
    const remainingMs = expirationMs - currentTimeMs;

    return remainingMs > 0 ? Math.floor(remainingMs / 1000) : -1;
  }

  /**
   * Get token claim value
   * @param token JWT token string
   * @param claimName Claim name to extract
   * @returns Claim value or null
   */
  static getTokenClaim(token: string | null, claimName: string): any {
    const decoded = this.decodeToken(token);
    if (decoded) {
      return decoded[claimName] || null;
    }
    return null;
  }
}

