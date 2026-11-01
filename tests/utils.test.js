import { describe, expect, test, vi } from "vitest";

import {
    escapeHTML,
    getImage,
    getPremieredYear
} from "../src/utils.js";
import { fetchShowSearch } from "../src/services/tvmaze.js";

describe("Testes do CineVerse", () => {
    test("Protege caracteres HTML", () => {
        expect(escapeHTML("<script>")).toBe("&lt;script&gt;");
    });

    test("Retorna imagem padrão", () => {
        expect(getImage(null, "Breaking Bad")).toContain("placehold.co");
    });

    test("Retorna ano de estreia", () => {
        expect(getPremieredYear("2008-01-20")).toBe("2008");
    });

    test("Encerra a busca TVmaze quando o tempo limite é atingido", async () => {
        vi.useFakeTimers();
        vi.stubGlobal(
            "fetch",
            vi.fn((_url, { signal }) => new Promise((resolve, reject) => {
                signal.addEventListener("abort", () => {
                    reject(new DOMException("Aborted", "AbortError"));
                });
            }))
        );

        try {
            const request = fetchShowSearch("Breaking Bad");
            const rejection = expect(request).rejects.toThrow(
                "A consulta à TVmaze excedeu o tempo limite."
            );

            await vi.advanceTimersByTimeAsync(15000);
            await rejection;
        } finally {
            vi.useRealTimers();
            vi.unstubAllGlobals();
        }
    });
});