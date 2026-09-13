# CineVerse — Explorador de Séries

Aplicação web desenvolvida para o desafio individual do Bootcamp.

## Autor

Nome completo: Guilherme Lemos Felipe

Matrícula: 22552371

## Descrição

O CineVerse é uma aplicação web que permite pesquisar séries e visualizar informações sobre diferentes títulos de entretenimento.

O usuário pode pesquisar uma série, consultar seus dados e clicar em um resultado para visualizar suas temporadas e episódios.

A aplicação utiliza uma API pública e apresenta as informações em uma interface moderna, organizada e responsiva.

## API utilizada

TVmaze API

Documentação:

https://www.tvmaze.com/api

Endpoints utilizados:

- Busca de séries:
  https://api.tvmaze.com/search/shows?q=termo

- Lista inicial de séries:
  https://api.tvmaze.com/shows?page=1

- Informações de uma série:
  https://api.tvmaze.com/shows/{id}

- Episódios de uma série:
  https://api.tvmaze.com/shows/{id}/episodes

A API não exige chave de autenticação.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Fetch API
- Git
- GitHub
- GitHub Pages

## Funcionalidades

- Pesquisa de séries por nome.
- Exibição de título, capa, ano de estreia e nota.
- Exibição dos gêneros das séries.
- Sugestões de pesquisa rápida.
- Cards clicáveis.
- Janela de detalhes da série.
- Exibição de temporadas.
- Exibição de episódios.
- Número e nome dos episódios.
- Data de exibição e duração.
- Imagens dos episódios quando disponíveis.
- Abertura e fechamento das temporadas.
- Tratamento de erros de conexão.
- Mensagem quando nenhum resultado é encontrado.
- Layout responsivo para computador e celular.

## Estrutura do projeto

cineverse-app/

├── index.html

├── style.css

├── script.js

└── README.md

### index.html

Arquivo responsável pela estrutura da aplicação.

Contém o cabeçalho, formulário de busca, área de resultados, janela de detalhes, temporadas e rodapé.

### style.css

Arquivo responsável pelo visual da aplicação.

Define cores, espaçamentos, cards, modal, temporadas, episódios e responsividade.

### script.js

Arquivo responsável pela interação do usuário.

Realiza as buscas na API, exibe os resultados e consulta os episódios de cada série.

## Como executar localmente

1. Clone o repositório:

git clone URL_DO_SEU_REPOSITORIO

2. Entre na pasta do projeto:

cd cineverse-app

3. Abra o arquivo index.html no navegador.

Também é possível utilizar a extensão Live Server no Visual Studio Code.

## Como publicar no GitHub Pages

1. Crie um repositório público no GitHub.

2. Envie os arquivos do projeto.

3. Acesse Settings → Pages.

4. Em Source, selecione Deploy from a branch.

5. Escolha a branch main e a pasta /root.

6. Clique em Save.

7. Aguarde a publicação.

O endereço ficará semelhante a:

https://SEU-USUARIO.github.io/cineverse-app/

## Links do projeto

### Aplicação publicada

 https://guilhermelemoss-lang.github.io/cineverse/

### Repositório

https://github.com/guilhermelemoss-lang/cineverse

## Conclusão

O CineVerse demonstra a utilização de tecnologias frontend para desenvolver uma aplicação web funcional.

O projeto utiliza uma API pública para pesquisar séries e exibir informações de temporadas e episódios, apresentando os dados de forma organizada, responsiva e acessível ao usuário.
