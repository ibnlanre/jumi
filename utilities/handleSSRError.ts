/**
 * Handles errors that may occur during Server-Side Rendering (SSR) in Next.js.
 * If the error message contains "Warning: Text content did not match", it logs the message "Warning: Text content did not match".
 * Otherwise, it logs an error message along with the error.
 *
 * @param {unknown} error The error object or value.
 * @param {string} [message="Error:"] The custom warning message to be logged along with the error. Defaults to "Error:".
 * @returns {void}
 */
export function handleSSRError(error: unknown, message: string = "Error:"): void {
  if (
    (error as Error).message.includes("Warning: Text content did not match")
  ) {
    console.warn("Warning: Text content did not match");
  } else {
    console.error(message, error);
  }
}
