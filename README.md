# CineVerse — Explorador de Séries

CineVerse é uma aplicação web acadêmica para explorar séries de televisão. A interface permite pesquisar títulos, consultar informações e episódios e organizar séries favoritas.

## Funcionalidades

- Pesquisa de séries por nome usando a API pública TVmaze.
- Sugestões de séries populares ao abrir a aplicação.
- Exibição de capa, ano de estreia, avaliação e gêneros nos resultados.
- Detalhes da série, incluindo descrição, idioma e status.
- Temporadas e episódios, com data, duração e imagens quando disponíveis.
- Cadastro e remoção de séries favoritas, armazenadas no Supabase.
- Mensagens de carregamento, erro e ausência de resultados.
- Interface responsiva com tema escuro e detalhes roxos.

> Cadastro de usuário e login não estão implementados na versão atual. O Supabase é usado pelo código para persistir favoritos.

## Tecnologias

- HTML, CSS e JavaScript.
- [TVmaze API](https://www.tvmaze.com/api) para dados de séries e episódios.
- Supabase para persistência dos favoritos.
- Vitest para testes automatizados.
- GitHub Actions para executar os testes em Pull Requests e atualizações na branch `main`.
- Docker e Nginx para servir o site em um container.

## Estrutura do projeto

```text
cineverse/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── app.js
│   ├── services/
│   │   ├── supabase.js
│   │   └── tvmaze.js
│   ├── utils/
│   │   └── format.js
│   └── utils.js
├── styles/
│   └── style.css
├── tests/
│   └── utils.test.js
├── .dockerignore
├── .gitignore
├── Dockerfile
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Executar localmente

1. Instale o [Node.js](https://nodejs.org/) e o Git.
2. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/guilhermelemoss-lang/cineverse.git
   cd cineverse
   ```

3. Sirva os arquivos com um servidor local. Por exemplo, com a extensão Live Server do Visual Studio Code, abra `index.html` usando **Open with Live Server**. Como alternativa, se Python estiver instalado:

   ```bash
   python -m http.server 8000
   ```

   Acesse `http://localhost:8000` no navegador. Servir a página por HTTP evita limitações que podem ocorrer ao abrir diretamente o arquivo HTML.

O site consulta TVmaze e Supabase pela internet. O funcionamento dessas integrações depende da disponibilidade desses serviços e da configuração existente do projeto.

## Testes automatizados

Na pasta do projeto, instale as dependências e execute os testes:

```bash
npm install
npm test
```

## Docker

Baixe a imagem publicada e inicie o container:

```bash
docker pull astrinho21/cineversee:latest
docker run -d -p 8080:80 --name cineverse-site astrinho21/cineversee:latest
```

O site ficará disponível em `http://localhost:8080`.

Para parar e remover o container:

```bash
docker stop cineverse-site
docker rm cineverse-site
```

## Integração contínua

O workflow em `.github/workflows/ci.yml` é executado em Pull Requests direcionados à branch `main` e em atualizações nessa branch. Ele configura o Node.js, instala as dependências com `npm ci` e executa `npm test`.

## Links do projeto

- Repositório GitHub: [guilhermelemoss-lang/cineverse](https://github.com/guilhermelemoss-lang/cineverse)
- Docker Hub: [astrinho21/cineversee](https://hub.docker.com/r/astrinho21/cineversee)

Não incluí um endereço do GitHub Pages porque não encontrei um endereço publicado ou configuração que permitisse confirmá-lo nos arquivos do projeto.
