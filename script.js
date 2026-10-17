
import { supabase } from "./supabase.js";

// ========================================
// CONFIGURAÇÕES
// ========================================

const API_URL = "https://api.tvmaze.com";

// ========================================
// ELEMENTOS DO HTML
// ========================================

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");
const results = document.querySelector("#results");
const status = document.querySelector("#status");
const sectionTitle = document.querySelector("#section-title");
const resultCount = document.querySelector("#result-count");

const modal = document.querySelector("#details-modal");
const detailsContent = document.querySelector("#details-content");
const closeModal = document.querySelector("#close-modal");

const favoritesResults = document.querySelector("#favorites-results");
const favoritesStatus = document.querySelector("#favorites-status");
const refreshFavorites = document.querySelector("#refresh-favorites");

let favoriteIds = new Set();
let currentShows = [];

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function cleanSummary(summary = "") {
    const div = document.createElement("div");
    div.innerHTML = summary;
    return div.textContent || "Sem descrição disponível.";
}

function getImage(url, text = "Sem imagem") {
    return url ||
        `https://placehold.co/300x400/171827/a66cff?text=${encodeURIComponent(text)}`;
}

// ========================================
// CRIAR CARD DE SÉRIE
// ========================================

function createShowCard(show, favoriteRowId = null) {
    const image = getImage(show.image?.medium, show.name);
    const year = show.premiered
        ? show.premiered.slice(0, 4)
        : "—";

    const rating = show.rating?.average ?? "N/A";
    const genres = show.genres?.slice(0, 2).join(" • ") || "Geral";
    const isFavorite = favoriteIds.has(Number(show.id));

    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;

    card.innerHTML = `
        <img
            class="card-image"
            src="${escapeHTML(image)}"
            alt="Capa de ${escapeHTML(show.name)}"
            loading="lazy"
        >

        <div class="card-body">
            <h3 class="card-title">${escapeHTML(show.name)}</h3>

            <div class="card-meta">
                <span>${escapeHTML(year)}</span>
                <span>•</span>
                <span class="rating">★ ${escapeHTML(rating)}</span>
            </div>

            <div class="genres">${escapeHTML(genres)}</div>

            <div class="favorite-actions">
                ${
                    favoriteRowId !== null
                        ? `
                            <button
                                type="button"
                                class="favorite-button is-saved"
                                data-action="remove-favorite"
                                data-row-id="${Number(favoriteRowId)}"
                            >
                                ♥ Remover dos favoritos
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="favorite-button ${isFavorite ? "is-saved" : ""}"
                                data-action="toggle-favorite"
                                data-show-id="${Number(show.id)}"
                            >
                                ${isFavorite ? "♥ Favoritada" : "♡ Favoritar"}
                            </button>
                        `
                }
            </div>
        </div>
    `;

    card.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        openDetails(show.id);
    });

    card.addEventListener("keydown", event => {
        if (
            (event.key === "Enter" || event.key === " ") &&
            event.target === card
        ) {
            event.preventDefault();
            openDetails(show.id);
        }
    });

    return card;
}

// ========================================
// MOSTRAR RESULTADOS
// ========================================

function renderShows(shows) {
    currentShows = shows.map(item => item.show || item);
    results.innerHTML = "";

    if (!currentShows.length) {
        status.textContent =
            "Nenhuma série encontrada. Tente outro nome.";
        status.className = "status error";
        resultCount.textContent = "0 resultados";
        return;
    }

    status.textContent = "";
    status.className = "status";
    resultCount.textContent = `${currentShows.length} resultados`;

    currentShows.forEach(show => {
        results.appendChild(createShowCard(show));
    });
}

// ========================================
// PESQUISAR SÉRIES
// ========================================

async function searchShows(term) {
    const query = term.trim();

    if (!query) {
        status.textContent = "Digite o nome de uma série.";
        status.className = "status error";
        return;
    }

    status.textContent = "Pesquisando séries...";
    status.className = "status";
    resultCount.textContent = "Carregando...";
    results.innerHTML = "";
    sectionTitle.textContent = `Resultados para "${query}"`;

    try {
        const response = await fetch(
            `${API_URL}/search/shows?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Falha na consulta à TVmaze.");
        }

        const data = await response.json();

        renderShows(data.slice(0, 20));
    } catch (error) {
        console.error("Erro na pesquisa:", error);
        status.textContent =
            "Não foi possível pesquisar. Verifique a conexão e tente novamente.";
        status.className = "status error";
        resultCount.textContent = "Erro";
    }
}

// ========================================
// SUGESTÕES INICIAIS
// ========================================

async function loadPopular() {
    status.textContent = "Carregando sugestões...";
    resultCount.textContent = "Carregando...";

    try {
        const response = await fetch(`${API_URL}/shows?page=1`);

        if (!response.ok) {
            throw new Error("Falha ao carregar sugestões.");
        }

        const data = await response.json();

        sectionTitle.textContent = "Sugestões para você";
        renderShows(data.slice(0, 8));
    } catch (error) {
        console.error("Erro nas sugestões:", error);
        status.textContent =
            "Não foi possível carregar as sugestões. Tente pesquisar uma série.";
        status.className = "status error";
        resultCount.textContent = "Erro";
    }
}

// ========================================
// ADICIONAR FAVORITO NO SUPABASE
// ========================================

async function addFavorite(showId) {
    const show = currentShows.find(item => Number(item.id) === showId);

    if (!show) {
        alert("Não foi possível encontrar essa série. Pesquise novamente.");
        return;
    }

    if (favoriteIds.has(showId)) {
        alert("Essa série já está nos seus favoritos.");
        return;
    }

    try {
        const { error } = await supabase
            .from("favoritos")
            .insert({
                show_id: show.id,
                nome_item: show.name,
                imagem_url: show.image?.medium ?? null,
                dados_extra: {
                    premiered: show.premiered ?? null,
                    rating: show.rating?.average ?? null,
                    genres: show.genres ?? [],
                    summary: show.summary ?? "",
                    language: show.language ?? null,
                    status: show.status ?? null,
                    url: show.url ?? null
                }
            });

        if (error) throw error;

        favoriteIds.add(showId);

        renderShows(currentShows);
        await loadFavorites();

    } catch (error) {
        console.error("Erro ao favoritar:", error);
        alert(
            "Não foi possível salvar a série. Confira a configuração do Supabase."
        );
    }
}

// ========================================
// CARREGAR LISTA DE FAVORITOS
// ========================================

async function loadFavorites() {
    if (!favoritesResults || !favoritesStatus) return;

    favoritesStatus.textContent = "Carregando favoritos...";
    favoritesStatus.className = "status";

    try {
        const { data, error } = await supabase
            .from("favoritos")
            .select("*")
            .order("criado_em", { ascending: false });

        if (error) throw error;

        favoriteIds = new Set(
            (data || []).map(item => Number(item.show_id))
        );

        favoritesResults.innerHTML = "";

        if (!data || data.length === 0) {
            favoritesStatus.textContent =
                "Você ainda não favoritou nenhuma série. Pesquise uma série e clique em ♡ Favoritar!";
            favoritesStatus.className = "status";
        } else {
            favoritesStatus.textContent =
                `${data.length} série(s) favorita(s).`;
            favoritesStatus.className = "status";

            data.forEach(item => {
                const extra = item.dados_extra || {};

                const show = {
                    id: Number(item.show_id),
                    name: item.nome_item,
                    image: item.imagem_url
                        ? { medium: item.imagem_url }
                        : null,
                    premiered: extra.premiered ?? null,
                    rating: { average: extra.rating ?? null },
                    genres: extra.genres ?? [],
                    summary: extra.summary ?? "",
                    language: extra.language ?? null,
                    status: extra.status ?? null,
                    url: extra.url ?? null
                };

                favoritesResults.appendChild(
                    createShowCard(show, item.id)
                );
            });
        }

        // Atualiza os botões nos resultados da pesquisa.
        if (currentShows.length) {
            renderShows(currentShows);
        }
    } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
        favoritesStatus.textContent =
            "Erro ao carregar favoritos. Confira o Supabase e a tabela favoritos.";
        favoritesStatus.className = "status error";
    }
}

// ========================================
// REMOVER FAVORITO
// ========================================

async function removeFavorite(rowId) {
    try {
        const { data: favorite, error: findError } = await supabase
            .from("favoritos")
            .select("show_id")
            .eq("id", rowId)
            .single();

        if (findError) throw findError;

        const { error } = await supabase
            .from("favoritos")
            .delete()
            .eq("id", rowId);

        if (error) throw error;

        favoriteIds.delete(Number(favorite.show_id));

        await loadFavorites();
    } catch (error) {
        console.error("Erro ao remover favorito:", error);
        alert("Não foi possível remover essa série dos favoritos.");
    }
}

// ========================================
// EVENTOS DOS BOTÕES DE FAVORITOS
// ========================================

document.addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    button.disabled = true;

    try {
        if (action === "toggle-favorite") {
            await addFavorite(Number(button.dataset.showId));
        }

        if (action === "remove-favorite") {
            await removeFavorite(Number(button.dataset.rowId));
        }
    } finally {
        button.disabled = false;
    }
});

// ========================================
// DETALHES, TEMPORADAS E EPISÓDIOS
// ========================================

async function openDetails(showId) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    detailsContent.innerHTML =
        '<p class="status">Carregando detalhes, temporadas e episódios...</p>';

    try {
        const [showResponse, episodesResponse] = await Promise.all([
            fetch(`${API_URL}/shows/${showId}`),
            fetch(`${API_URL}/shows/${showId}/episodes`)
        ]);

        if (!showResponse.ok || !episodesResponse.ok) {
            throw new Error("Não foi possível carregar os detalhes.");
        }

        const show = await showResponse.json();
        const episodes = await episodesResponse.json();

        const seasons = {};

        episodes.forEach(episode => {
            const season = episode.season;
            if (!seasons[season]) seasons[season] = [];
            seasons[season].push(episode);
        });

        let seasonsHTML = "";

        Object.keys(seasons)
            .sort((a, b) => Number(a) - Number(b))
            .forEach(season => {
                const seasonEpisodes = seasons[season];

                const episodesHTML = seasonEpisodes.map(episode => `
                    <div class="episode">
                        <div class="episode-number">
                            E${episode.number ?? "—"}
                        </div>

                        <div class="episode-info">
                            <h4>${escapeHTML(episode.name || "Sem título")}</h4>
                            <p>
                                ${escapeHTML(episode.airdate || "Data desconhecida")}
                                ${episode.runtime ? ` • ${episode.runtime} min` : ""}
                            </p>
                            <p>${escapeHTML(cleanSummary(episode.summary))}</p>
                        </div>

                        ${
                            episode.image?.medium
                                ? `<img class="episode-image"
                                    src="${escapeHTML(episode.image.medium)}"
                                    alt="Imagem do episódio"
                                    loading="lazy">`
                                : ""
                        }
                    </div>
                `).join("");

                seasonsHTML += `
                    <div class="season">
                        <button class="season-title" type="button"
                            aria-expanded="false">
                            <span>Temporada ${season}</span>
                            <span>${seasonEpisodes.length} episódios ▼</span>
                        </button>
                        <div class="episodes">${episodesHTML}</div>
                    </div>
                `;
            });

        const image = getImage(
            show.image?.original || show.image?.medium,
            show.name
        );

        detailsContent.innerHTML = `
            <div class="details-header">
                <img src="${escapeHTML(image)}"
                    alt="Capa de ${escapeHTML(show.name)}">

                <div class="details-info">
                    <h2 id="details-title">${escapeHTML(show.name)}</h2>
                    <p>${escapeHTML(cleanSummary(show.summary))}</p>
                    <p><strong>Nota:</strong> ★ ${show.rating?.average ?? "N/A"}</p>
                    <p><strong>Gêneros:</strong>
                        ${escapeHTML(show.genres?.join(", ") || "Não informado")}
                    </p>
                    <p><strong>Idioma:</strong>
                        ${escapeHTML(show.language || "Não informado")}
                    </p>
                    <p><strong>Status:</strong>
                        ${escapeHTML(show.status || "Não informado")}
                    </p>

                    <button type="button"
                        class="favorite-button ${favoriteIds.has(Number(show.id)) ? "is-saved" : ""}"
                        data-action="toggle-favorite"
                        data-show-id="${Number(show.id)}">
                        ${favoriteIds.has(Number(show.id)) ? "♥ Favoritada" : "♡ Favoritar"}
                    </button>
                </div>
            </div>

            <h2>Temporadas e episódios</h2>
            <p class="status">Clique em uma temporada para ver seus episódios.</p>
            ${seasonsHTML || "<p>Nenhum episódio encontrado.</p>"}
        `;

        detailsContent.querySelectorAll(".season-title").forEach(button => {
            button.addEventListener("click", () => {
                const container = button.nextElementSibling;
                const isOpen = container.classList.toggle("open");

                button.setAttribute("aria-expanded", String(isOpen));

                const spans = button.querySelectorAll("span");
                spans[1].textContent =
                    spans[1].textContent.replace(/[▼▲]/g, "").trim()
                    + (isOpen ? " ▲" : " ▼");
            });
        });
    } catch (error) {
        console.error("Erro nos detalhes:", error);
        detailsContent.innerHTML =
            '<p class="status error">Não foi possível carregar os detalhes. Tente novamente.</p>';
    }
}

// ========================================
// FECHAR MODAL
// ========================================

function closeDetails() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

closeModal.addEventListener("click", closeDetails);

modal.addEventListener("click", event => {
    if (event.target === modal) closeDetails();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDetails();
});

// ========================================
// EVENTOS DE BUSCA
// ========================================

form.addEventListener("submit", event => {
    event.preventDefault();
    searchShows(input.value);
});

document.querySelectorAll("[data-query]").forEach(button => {
    button.addEventListener("click", () => {
        input.value = button.dataset.query;
        searchShows(button.dataset.query);
    });
});

if (refreshFavorites) {
    refreshFavorites.addEventListener("click", loadFavorites);
}

// ========================================
// INICIAR A APLICAÇÃO
// ========================================

async function initializeApp() {
    await loadFavorites();
    await loadPopular();
}

initializeApp();
