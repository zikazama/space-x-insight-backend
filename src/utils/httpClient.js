const { log } = require("./logger");

async function fetchWithRetry(url, options = {}, maxRetries = 3, timeoutMs = 30000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      log("DEBUG", "API fetch attempt", { attempt: attempt + 1, url });

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        log("INFO", "API fetch success", { attempt: attempt + 1, status: response.status });
        return response;
      }

      if (response.status >= 500 || response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        log("WARN", "API returned retryable error, waiting", {
          status: response.status,
          retryIn: delay,
        });
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err.name === "AbortError") {
        log("WARN", "API fetch timeout", { attempt: attempt + 1, timeoutMs });
      } else {
        log("WARN", "API fetch error", { attempt: attempt + 1, error: err.message });
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  log("ERROR", "API fetch failed after retries", { maxRetries, error: lastError?.message });
  throw lastError || new Error("Max retries exceeded");
}

module.exports = { fetchWithRetry };
