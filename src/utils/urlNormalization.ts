/**
 * URL Normalization Utility
 *
 * Ensures consistent base URLs for the n8n API regardless of user input format.
 * This prevents HTTP redirects caused by URL format mismatches (e.g., trailing slashes,
 * duplicate /api/v1 suffixes, protocol mismatches) which can lead to silent
 * POST→GET downgrades in axios.
 *
 * @see https://github.com/salacoste/mcp-n8n-workflow-builder/issues/13
 */

/**
 * Normalizes a user-provided n8n host URL into a consistent baseURL
 * suitable for axios. The returned URL always ends with `/api/v1`
 * and never contains a trailing slash.
 *
 * Handles the following input variations:
 *  - `http://localhost:5678`
 *  - `http://localhost:5678/`
 *  - `http://localhost:5678///`
 *  - `http://localhost:5678/api/v1`
 *  - `http://localhost:5678/api/v1/`
 *  - `https://n8n.example.com/api/v1///`
 *
 * @param rawHost - The raw N8N_HOST value from configuration
 * @returns A normalized base URL ending with `/api/v1`
 */
export function normalizeBaseUrl(rawHost: string): string {
  if (!rawHost || typeof rawHost !== 'string') {
    throw new Error('N8N_HOST must be a non-empty string');
  }

  let url = rawHost.trim();

  // Step 1: Ensure the URL has a protocol
  if (!url.match(/^https?:\/\//i)) {
    url = `http://${url}`;
  }

  // Step 2: Parse with URL constructor for reliable normalization
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid N8N_HOST URL: "${rawHost}". Must be a valid URL (e.g., http://localhost:5678)`);
  }

  // Step 3: Reconstruct the origin (protocol + host + port) — no trailing slash
  let base = parsed.origin;

  // Step 4: Normalize the pathname
  //   - Collapse consecutive slashes (e.g., `///api///v1` → `/api/v1`)
  //   - Remove trailing slashes
  //   - Remove /api/v1 suffix if already present (backward compatibility)
  let pathname = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');

  // Remove /api/v1 variants (case-insensitive, with optional trailing components)
  pathname = pathname.replace(/\/api\/v1$/i, '');

  // Remove any remaining trailing slashes after stripping /api/v1
  pathname = pathname.replace(/\/+$/, '');

  // Step 5: Append the cleaned pathname (if any, e.g., for sub-path deployments)
  if (pathname && pathname !== '/') {
    base += pathname;
  }

  // Step 6: Append /api/v1
  base += '/api/v1';

  return base;
}

/**
 * Normalizes a request path to prevent trailing-slash redirects.
 * Some HTTP servers redirect `/api/v1/workflows/` → `/api/v1/workflows`
 * via 301, which can cause POST→GET downgrades.
 *
 * @param path - The request path (e.g., `/workflows/`)
 * @returns The path without a trailing slash
 */
export function normalizeRequestPath(path: string): string {
  if (!path || typeof path !== 'string') {
    return path;
  }

  // Collapse consecutive slashes (e.g., `//workflows//` → `/workflows/`)
  let normalized = path.replace(/\/{2,}/g, '/');

  // Remove trailing slashes but preserve root `/`
  normalized = normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized;

  return normalized;
}

/**
 * Checks whether a URL was modified by normalization.
 * Useful for logging warnings when user configuration contains
 * problematic URL formats that would cause redirects.
 *
 * @param original - The raw user-provided URL
 * @param normalized - The result of normalizeBaseUrl()
 * @returns A human-readable description of what changed, or null if no change
 */
export function describeUrlChanges(original: string, normalized: string): string | null {
  if (!original || !normalized) return null;

  const issues: string[] = [];

  if (/\/\/$/.test(original) || /\/{2,}/.test(original.replace(/^https?:\/\//, ''))) {
    issues.push('contained double slashes');
  }
  if (/\/+$/.test(original.replace(/^https?:\/\/[^/]+/, ''))) {
    issues.push('had trailing slash(es)');
  }
  if (/\/api\/v1\/?$/i.test(original)) {
    issues.push('included /api/v1 suffix (now auto-appended)');
  }
  if (!original.match(/^https?:\/\//i)) {
    issues.push('missing protocol (defaulted to http://)');
  }

  if (issues.length === 0) return null;
  return `N8N_HOST "${original}" ${issues.join(', ')}. Normalized to: ${normalized}`;
}
