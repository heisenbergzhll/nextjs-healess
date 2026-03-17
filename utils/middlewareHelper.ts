export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader
    ?.split(';')
    .forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  return cookies;
}

/**
 * Edge-safe marketplace flag for middleware.
 * Uses environment variable instead of heavy client libraries.
 */
export const isMarketplaceEnable = async (): Promise<boolean> => {
  const raw =
    process.env.NEXT_PUBLIC_MARKETPLACE_IS_ACTIVE ??
    process.env.MARKETPLACE_IS_ACTIVE ??
    'true';

  return raw === 'true' || raw === '1';
};

