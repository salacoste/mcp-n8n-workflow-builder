/**
 * Response Validation Utility
 *
 * Validates that HTTP responses match expectations for the original request
 * method. This is a defense-in-depth measure: if a redirect somehow slips
 * through and silently converts a POST→GET, the response body will be
 * structurally different from what we expect (e.g., an HTML page instead
 * of a JSON object, or a list instead of a created resource).
 *
 * @see https://github.com/salacoste/mcp-n8n-workflow-builder/issues/13
 */

import { AxiosResponse } from 'axios';

/**
 * Validates that the response is consistent with the original HTTP method.
 * Returns a warning string if the response looks suspicious, or null if OK.
 *
 * Heuristics:
 * - POST/PUT/PATCH with an empty body may indicate a redirected GET
 * - POST/PUT/PATCH returning HTML instead of JSON may indicate a redirect
 *   to a web UI page
 * - Response URL differing from request URL may indicate a redirect occurred
 *
 * @param response - The axios response object
 * @param originalMethod - The original HTTP method (e.g., 'POST', 'PUT')
 * @returns A warning message string, or null if the response looks valid
 */
export function validateApiResponse(
  response: AxiosResponse,
  originalMethod?: string
): string | null {
  if (!originalMethod) {
    return null;
  }

  const method = originalMethod.toUpperCase();

  // Only validate mutation methods — GET/DELETE/HEAD/OPTIONS are fine as-is
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return null;
  }

  // Check 1: Detect HTML responses (likely redirect to web UI)
  const contentType = response.headers?.['content-type'] || '';
  if (contentType.includes('text/html')) {
    return (
      `${method} request returned Content-Type: text/html instead of application/json. ` +
      `This usually indicates a redirect to the n8n web UI. ` +
      `Check that N8N_HOST points to the API endpoint, not the web UI.`
    );
  }

  // Check 2: Detect empty body on mutation requests
  // A POST that creates a resource should return the created resource.
  // An empty body likely means the POST was redirected to a GET on a
  // collection endpoint that returned nothing useful.
  if (
    response.data === '' ||
    response.data === null ||
    response.data === undefined
  ) {
    return (
      `${method} request returned an empty response body. ` +
      `This may indicate the request was silently redirected and converted to GET. ` +
      `Check that N8N_HOST is configured correctly.`
    );
  }

  // Check 3: Detect response URL mismatch (redirect occurred)
  // axios stores the final response URL in response.request?.res?.responseUrl
  // (Node.js) or response.request?.responseURL (browser)
  const responseUrl =
    response.request?.res?.responseUrl ||
    response.request?.responseURL;

  if (responseUrl && response.config?.url) {
    const requestedBase = response.config.baseURL || '';
    const requestedPath = response.config.url || '';
    const requestedFull = requestedBase + requestedPath;

    // Simple check: if the response URL is significantly different from
    // what was requested, a redirect likely occurred
    if (
      responseUrl !== requestedFull &&
      !responseUrl.startsWith(requestedFull)
    ) {
      return (
        `${method} request to "${requestedFull}" was served from "${responseUrl}". ` +
        `A redirect may have occurred, potentially converting ${method} to GET. ` +
        `Check that N8N_HOST is configured correctly.`
      );
    }
  }

  return null;
}
