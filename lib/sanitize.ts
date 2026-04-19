/**
 * Input sanitization utilities for user-generated content
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * For now, we escape all HTML. In the future, consider using a library like DOMPurify
 * if you need to support rich text.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeText(input: string): string {
  // Remove null bytes and control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\./, '_')
    .substring(0, 255);
}

/**
 * Sanitize organization/user name
 */
export function sanitizeName(name: string): string {
  return sanitizeText(name).trim().substring(0, 200);
}

/**
 * Sanitize multiline text (announcements, descriptions)
 */
export function sanitizeMultilineText(text: string): string {
  return sanitizeText(text).trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize object by applying appropriate sanitization to all string fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  config?: {
    html?: string[];
    text?: string[];
    multiline?: string[];
  }
): T {
  const result: Record<string, any> = { ...obj };

  Object.keys(result).forEach((key) => {
    if (typeof result[key] === 'string') {
      if (config?.html?.includes(key)) {
        result[key] = sanitizeHtml(result[key]);
      } else if (config?.multiline?.includes(key)) {
        result[key] = sanitizeMultilineText(result[key]);
      } else if (config?.text?.includes(key)) {
        result[key] = sanitizeText(result[key]);
      }
    } else if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) =>
        item && typeof item === 'object' ? sanitizeObject(item, config) : item
      );
    } else if (result[key] && typeof result[key] === 'object') {
      result[key] = sanitizeObject(result[key], config);
    }
  });

  return result as T;
}
