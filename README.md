# First Five Years — verkkosivu

Staattinen sivusto. Ei build-vaihetta, ei riippuvuuksia, ei tietokantaa.

**Vaihe:** aloite, jota ei ole vielä perustettu. Sivun tehtävä on herättää kiinnostus,
käynnistää keskusteluja ja löytää perustajat ja rahoittajat. Sivu ei väitä missään
kohtaa, että organisaatio, rahoitus tai data olisi olemassa. Pidä tämä voimassa myös
muokatessasi.

---

## Sisältö

    index.html          Etusivu (osiot 01–07)
    manifesti.html      Manifesti ja allekirjoituslomake
    assets/styles.css   Kaikki tyylit
    assets/main.js      Scroll-efekti ja lomakkeiden lähetys
    assets/kuvat/       Muotokuva tähän

---

## 1. Täytä sisältö ennen julkaisua

Hae tiedostoista hakasulje `[` — jokainen osuma on paikanvaraaja.

**Pakolliset:**

- **Kuka-osio** (index.html): nimi, nykyinen työ, tausta, LinkedIn-osoite
- **Muotokuvan kuvateksti**: nimi ja paikkakunta
- **Ehdotus-osio**: tekoälyvalmentajan kumppanin nimi — varmista lupa julkiseen mainintaan
- **Ilmiö-osio**: kaksi lukua ja lähteet, merkitty kommentilla `TARKISTA`
- **Sähköpostiosoite**: `hei@firstfiveyears.fi` esiintyy neljässä kohdassa
- **LinkedIn-osoite**: vaihda `https://www.linkedin.com/` oikeaksi

**Heron iso nolla** ei ole tilasto vaan väite. Varmista, että pystyt perustelemaan sen
kokouksessa, tai vaihda se varmennettuun lukuun.

---

## 2. Lisää muotokuva

1. Skaalaa kuva noin 1200 × 1500 px, tallenna nimellä `muotokuva.jpg` kansioon `assets/kuvat/`
2. Avaa `index.html`, etsi `portrait-empty`
3. Poista `<!--` ja `-->` `<img>`-rivin ympäriltä
4. Poista koko rivi, joka alkaa `<div class="portrait-empty">`

Kuva harmaasävytetään ja sen päälle ajetaan aksenttiväri automaattisesti, joten lähes
mikä tahansa kuva istuu sivun paletiin. Puhelimella otettu riittää.

---

## 3. Kytke lomakkeet

Staattinen sivusto ei tallenna lomakkeita itse. Ilman endpointia lomakkeet näyttävät
käyttäjälle sähköpostiosoitteen — ne eivät riko sivua, joten voit julkaista ennen tätä.

1. Luo ilmainen tili osoitteessa formspree.io (vaihtoehtoja: Tally, Basin)
2. Kopioi lomakkeen endpoint-osoite
3. Korvaa `LISAA_ENDPOINT_TAHAN` tiedostoista `index.html` ja `manifesti.html`

Kolme lomaketta — yhteydenotto, seuranta, allekirjoitus — käyttävät samaa endpointia.
Ne erottuvat toisistaan kentällä `_lomake`.

Allekirjoittajalista manifesti-sivulla päivitetään toistaiseksi käsin. Kun nimiä
kertyy enemmän kuin on mielekästä ylläpitää, siirry Cloudflare Pages Functions + D1
-ratkaisuun.

---

## 4. Julkaise Cloudflare Pagesiin

**Nopea tapa (raahaus):**

1. Cloudflare → Workers & Pages → Create → Pages → Upload assets
2. Raahaa koko kansio
3. Nimeä projekti → Deploy

**Suositeltu tapa (Git):** muokkaus onnistuu jatkossa selaimessa ilman uudelleenlatausta,
ja saat versiohistorian.

1. Luo GitHub-repo ja lataa kansion sisältö sinne
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git
3. Build command: **tyhjä**. Build output directory: **/**
4. Deploy

**Oma verkkotunnus:** projektin asetuksissa Custom domains → lisää `firstfiveyears.fi`.
Cloudflare ohjeistaa nimipalvelinmuutoksen. HTTPS tulee automaattisesti.

Muokkaus Git-tavalla: avaa tiedosto GitHubissa, klikkaa kynää, muuta teksti, tallenna.
Sivu päivittyy noin minuutissa.

---

## 5. Vielä tekemättä

- `tietosuoja.html` — tarvitaan heti kun lomakkeet ovat käytössä. Alatunniste linkittää
  siihen jo.
- `og.png` (1200 × 630) sivuston juureen. Ilman sitä linkkijaot näyttävät tyhjiltä.
- Englanninkielinen versio: kopioi sivut hakemistoon `/en/`, vaihda `lang="en"` ja
  aktivoi navigaation EN-linkki.

---

## Saavutettavuus

Sivu on rakennettu WCAG 2.2 AA -tasolle. Kontrastit on mitattu, ei arvattu:

- Leipäteksti 15.2:1, vaimennettu teksti 5.2:1, aksentti tekstinä 5.6:1
- Lomakekenttien reunat 3.4:1
- Fokusrengas näkyy sekä vaalealla että tummalla pohjalla
- Kaavion viivealue erottuu viivoituksella, ei pelkällä värillä — toimii
  mustavalkotulosteessa ja punavihersokealla
- `prefers-reduced-motion` ja `prefers-contrast` huomioitu

**Jos muokkaat värejä**, tarkista kontrastit uudelleen. Aksenttiväri on jaettu kahtia:
`--signal` on koristekäyttöön, `--signal-ink` tekstiin ja reunoihin. Älä käytä vaaleaa
amberia tekstinä vaalealla pohjalla.
