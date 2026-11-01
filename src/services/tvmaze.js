export const API_URL = "https://api.tvmaze.com";

const REQUEST_TIMEOUT_MS = 15000;

async function fetchJSON(url, errorMessage) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
    );

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("A consulta à TVmaze excedeu o tempo limite.");
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export function fetchPopularShows() {
    return fetchJSON(
        `${API_URL}/shows?page=1`,
        "Falha ao carregar sugestões."
    );
}

export function fetchShowSearch(query) {
    return fetchJSON(
        `${API_URL}/search/shows?q=${encodeURIComponent(query)}`,
        "Falha na consulta à TVmaze."
    );
}

export function fetchShowDetails(showId) {
    return fetchJSON(
        `${API_URL}/shows/${showId}`,
        "Não foi possível carregar os detalhes."
    );
}

export function fetchShowEpisodes(showId) {
    return fetchJSON(
        `${API_URL}/shows/${showId}/episodes`,
        "Não foi possível carregar os episódios."
    );
}