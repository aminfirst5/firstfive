# First Five Years

First Five Years on kaksikielinen staattinen verkkosivusto. Sivusto toimii sellaisenaan GitHub Pagesissa tai Cloudflare Pagesissa ilman build-vaihetta, pakettien asennusta tai tietokantaa.

## Kansiorakenne

```text
firstfive/
├── index.html
├── missio.html
├── favicon.ico
├── favicon.png
├── robots.txt
├── sitemap.xml
├── en/
│   ├── index.html
│   └── mission.html
└── assets/
    ├── styles.css
    ├── main.js
    └── kuvat/
        ├── hero-young-people.png
        ├── ai-valmentaja-transparent.png
        ├── amin-hassan.jpg
        └── heikki-leskinen.png
```

## Julkaiseminen GitHubin kautta

1. Lataa yllä olevan rakenteen tiedostot GitHub-repositorion juureen.
2. Yhdistä repository Cloudflare Pagesiin.
3. Jätä build command tyhjäksi.
4. Aseta build output directoryksi repositoryn juuri `/`.
5. Käynnistä julkaisu.

Cloudflare julkaisee uudet muutokset automaattisesti jokaisen GitHub-päivityksen jälkeen.

## Sivut

- `/` – suomenkielinen etusivu
- `/missio.html` – suomenkielinen missio
- `/en/` – englanninkielinen etusivu
- `/en/mission.html` – englanninkielinen missio

## Ylläpito

- Kaikki tyylit ovat tiedostossa `assets/styles.css`.
- Sivuston toiminnallisuus ja lomakevalidointi ovat tiedostossa `assets/main.js`.
- Kuvien tiedostonimien kirjainkoon pitää vastata täsmälleen HTML-tiedostojen polkuja.
- Uutta sisältöä lisättäessä päivitä tarvittaessa molemmat kieliversiot, metatiedot ja `sitemap.xml`.

Yhteydenottolomake lähettää tiedot Formward-palveluun. Endpoint määritellään etusivujen lopussa muuttujassa `window.FFY_FORM_ENDPOINT`.
