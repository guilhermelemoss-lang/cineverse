export function escapeHTML(value = "") {
    return String(value).replace(/[&<>\"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

export function getImage(url, text = "Sem imagem") {
    return url ||
        `https://placehold.co/300x400/171827/a66cff?text=${encodeURIComponent(text)}`;
}

export function getPremieredYear(premiered) {
    return premiered ? String(premiered).slice(0, 4) : "—";
}