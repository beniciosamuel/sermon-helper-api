/**
 * Cookie Utility Functions
 *
 * Helper functions for managing cookies in the browser.
 * Used for storing authentication tokens and other client-side data.
 */

/**
 * Set a cookie with optional expiration
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration (optional)
 */
export function setCookie(name: string, value: string, days?: number): void {
  // Cookie names should not be encoded, only values should be encoded
  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  // Set cookie attributes
  cookieString += `; path=/`;
  cookieString += `; sameSite=strict`;

  // Set secure flag in production (HTTPS required)
  if (process.env.NODE_ENV === 'production') {
    cookieString += `; secure`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 *
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  // Cookie names are not encoded in document.cookie
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 *
 * @param name - Cookie name
 */
export function deleteCookie(name: string): void {
  // Set expiration date in the past to delete the cookie
  // Cookie names should not be encoded
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; sameSite=strict`;
}
