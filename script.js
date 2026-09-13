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


// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Protege textos vindos da API contra HTML indevido.
function escapeHTML(value = "") {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

    }[char]));

}


// Remove tags HTML das descrições.
function cleanSummary(summary = "") {

    const div = document.createElement("div");

    div.innerHTML = summary;

    return div.textContent || "Sem descrição disponível.";

}


// Retorna imagem padrão quando a API não possui uma.
function getImage(url, text = "Sem imagem") {

    return url ||
        `https://placehold.co/300x400/171827/a66cff?text=${encodeURIComponent(text)}`;

}


// ========================================
// EXIBIR CARDS
// ========================================

function renderShows(shows) {

    results.innerHTML = "";

    if (!shows.length) {

        status.textContent =
            "Nenhum título encontrado. Tente outro nome.";

        status.className = "status error";

        resultCount.textContent = "0 resultados";

        return;

    }

    status.textContent = "";

    status.className = "status";

    resultCount.textContent =
        `${shows.length} resultados`;


    shows.forEach(item => {

        const show = item.show || item;

        const image = getImage(
            show.image?.medium
        );

        const year = show.premiered
            ? show.premiered.slice(0, 4)
            : "—";

        const rating = show.rating?.average ?? "N/A";

        const genres = show.genres?.slice(0, 2).join(" • ") ||
            "Geral";


        const card = document.createElement("article");

        card.className = "card";

        card.tabIndex = 0;

        card.setAttribute(
            "aria-label",
            `Ver detalhes de ${show.name}`
        );


        card.innerHTML = `

            <img
                class="card-image"
                src="${image}"
                alt="Capa de ${escapeHTML(show.name)}"
                loading="lazy"
            >

            <div class="card-body">

                <h3 class="card-title">
                    ${escapeHTML(show.name)}
                </h3>

                <div class="card-meta">

                    <span>${year}</span>

                    <span>•</span>

                    <span class="rating">
                        ★ ${rating}
                    </span>

                </div>

                <div class="genres">
                    ${escapeHTML(genres)}
                </div>

            </div>

        `;


        // Clique no card.
        card.addEventListener("click", () => {

            openDetails(show.id);

        });


        // Permite abrir usando Enter ou espaço.
        card.addEventListener("keydown", event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openDetails(show.id);

            }

        });


        results.appendChild(card);

    });

}


// ========================================
// BUSCAR SÉRIES
// ========================================

async function searchShows(term) {

    const query = term.trim();

    if (!query) {

        status.textContent =
            "Digite o nome de uma série para começar.";

        status.className = "status error";

        return;

    }


    status.textContent =
        "Consultando a API e organizando os resultados...";

    status.className = "status";

    resultCount.textContent = "Carregando...";

    results.innerHTML = "";


    try {

        const response = await fetch(
            `${API_URL}/search/shows?q=${encodeURIComponent(query)}`
        );


        if (!response.ok) {

            throw new Error("Falha na resposta da API.");

        }


        const data = await response.json();


        sectionTitle.textContent =
            `Resultados para "${query}"`;


        renderShows(data.slice(0, 12));


    } catch (error) {

        status.textContent =
            "Não foi possível consultar a API agora. " +
            "Verifique sua conexão e tente novamente.";

        status.className = "status error";

        resultCount.textContent = "Erro";

        console.error(error);

    }

}


// ========================================
// SUGESTÕES INICIAIS
// ========================================

async function loadPopular() {

    try {

        const response = await fetch(
            `${API_URL}/shows?page=1`
        );


        if (!response.ok) {

            throw new Error("Falha na resposta da API.");

        }


        const data = await response.json();


        renderShows(data.slice(0, 8));


    } catch (error) {

        status.textContent =
            "Não foi possível carregar as sugestões iniciais. " +
            "Use a busca para tentar novamente.";

        status.className = "status error";

        resultCount.textContent = "Erro";

        console.error(error);

    }

}


// ========================================
// ABRIR DETALHES DA SÉRIE
// ========================================

async function openDetails(showId) {

    modal.classList.add("active");

    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";


    detailsContent.innerHTML = `

        <p class="status">
            Carregando informações, temporadas e episódios...
        </p>

    `;


    try {

        // Busca informações principais da série.
        const showResponse = await fetch(
            `${API_URL}/shows/${showId}`
        );


        // Busca todos os episódios.
        const episodesResponse = await fetch(
            `${API_URL}/shows/${showId}/episodes`
        );


        if (
            !showResponse.ok ||
            !episodesResponse.ok
        ) {

            throw new Error(
                "Não foi possível carregar os detalhes."
            );

        }


        const show = await showResponse.json();

        const episodes = await episodesResponse.json();


        // Organiza os episódios por temporada.
        const seasons = {};


        episodes.forEach(episode => {

            const seasonNumber = episode.season;


            if (!seasons[seasonNumber]) {

                seasons[seasonNumber] = [];

            }


            seasons[seasonNumber].push(episode);

        });


        const image = getImage(
            show.image?.original ||
            show.image?.medium
        );


        let seasonsHTML = "";


        // Cria uma seção para cada temporada.
        Object.keys(seasons)

            .sort((a, b) => Number(a) - Number(b))

            .forEach(season => {

                const seasonEpisodes = seasons[season];


                let episodesHTML = "";


                seasonEpisodes.forEach(episode => {

                    const episodeImage = episode.image?.medium || "";


                    episodesHTML += `

                        <div class="episode">

                            <div class="episode-number">

                                E${episode.number}

                            </div>


                            <div class="episode-info">

                                <h4>
                                    ${escapeHTML(episode.name)}
                                </h4>


                                <p>

                                    ${episode.airdate || "Data desconhecida"}

                                    ${
                                        episode.runtime
                                            ? ` • ${episode.runtime} min`
                                            : ""
                                    }

                                </p>


                                <p>

                                    ${escapeHTML(
                                        cleanSummary(episode.summary)
                                    )}

                                </p>

                            </div>


                            ${
                                episodeImage
                                    ? `
                                        <img
                                            class="episode-image"
                                            src="${episodeImage}"
                                            alt="Imagem do episódio ${episode.number}"
                                            loading="lazy"
                                        >
                                    `
                                    : ""
                            }

                        </div>

                    `;

                });


                seasonsHTML += `

                    <div class="season">

                        <button
                            class="season-title"
                            type="button"
                            aria-expanded="false"
                        >

                            <span>
                                Temporada ${season}
                            </span>

                            <span>
                                ${seasonEpisodes.length} episódios
                                ▼
                            </span>

                        </button>


                        <div class="episodes">

                            ${episodesHTML}

                        </div>

                    </div>

                `;

            });


        detailsContent.innerHTML = `

            <div class="details-header">

                <img
                    src="${image}"
                    alt="Capa de ${escapeHTML(show.name)}"
                >


                <div class="details-info">

                    <h2 id="details-title">
                        ${escapeHTML(show.name)}
                    </h2>


                    <p>
                        ${escapeHTML(
                            cleanSummary(show.summary)
                        )}
                    </p>


                    <p>

                        <strong>Nota:</strong>

                        <span class="rating">
                            ★ ${show.rating?.average ?? "N/A"}
                        </span>

                    </p>


                    <p>

                        <strong>Gêneros:</strong>

                        ${escapeHTML(
                            show.genres?.join(", ") ||
                            "Não informado"
                        )}

                    </p>


                    <p>

                        <strong>Idioma:</strong>

                        ${escapeHTML(
                            show.language ||
                            "Não informado"
                        )}

                    </p>


                    <p>

                        <strong>Status:</strong>

                        ${escapeHTML(
                            show.status ||
                            "Não informado"
                        )}

                    </p>

                </div>

            </div>


            <h2>
                Temporadas e episódios
            </h2>


            <p class="status">

                Clique em uma temporada para ver seus episódios.

            </p>


            ${seasonsHTML || "<p>Nenhum episódio encontrado.</p>"}

        `;


        // Ativa o abrir/fechar das temporadas.
        document.querySelectorAll(".season-title").forEach(button => {

            button.addEventListener("click", () => {

                const episodesContainer =
                    button.nextElementSibling;

                const isOpen =
                    episodesContainer.classList.toggle("open");


                button.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                const arrow =
                    isOpen ? "▲" : "▼";


                const spans = button.querySelectorAll("span");

                spans[1].textContent =
                    spans[1].textContent.replace(/[▼▲]/g, "").trim()
                    + ` ${arrow}`;

            });

        });


    } catch (error) {

        detailsContent.innerHTML = `

            <p class="status error">

                Não foi possível carregar os episódios.
                Tente novamente.

            </p>

        `;

        console.error(error);

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


// Fecha clicando fora da janela.
modal.addEventListener("click", event => {

    if (event.target === modal) {

        closeDetails();

    }

});


// Fecha apertando ESC.
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeDetails();

    }

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


// ========================================
// INICIAR A APLICAÇÃO
// ========================================

loadPopular();