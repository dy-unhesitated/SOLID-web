# SOLID Collective — Brand

Vastgestelde merkkeuzes. Leidend boven andere docs bij conflict.

## Stack

Plain HTML / CSS / JS (zelfde opzet als Zneb Website). Geen Next.js.
Animatie: GSAP + ScrollTrigger, Lenis. Three.js alleen waar het verhaal het vraagt.
Vendor libs in `js/vendor/`. Lokale server: `python3 serve.py` (poort 8091).

## Kleuren

| Token        | Hex       | Gebruik                              |
|--------------|-----------|--------------------------------------|
| `--orange`   | `#E26536` | Accent — exact kleur logo-blokje      |
| `--black`    | `#090909` | Basis donker                          |
| `--white`    | `#FAFAFA` | Basis licht                           |

Eén accentkleur. Oranje spaarzaam inzetten.

## Typografie

- Headers / titels: **Impact** — `fonts/impact.woff2`
- Accent (sporadisch, 1 groot woord/moment): **Impacted** (distressed hoofdletters) — `fonts/impacted.woff2`. Bevat geen €-teken.
- Tekst / body: **Instrument Sans** (variabel 400–700) — `fonts/instrument-sans-var.woff2`, self-hosted
- Bronbestanden `.ttf` blijven in `fonts/` als master.

## Logo

- `images/logos/solid-logo-black.png` — op lichte achtergrond
- `images/logos/solid-logo-white.png` — op donkere achtergrond
- Bijgesneden versies (1281×551, transparant). Originelen `Logo Black.png` / `Logo White.png` bewaard.
- SVG-versie gewenst (scherpte + los animeren oranje blokje) — nog niet aangeleverd.

## Motief

Het oranje blokje uit het logo = de "punt" (`.dot`) achter titels, de cursor, bullets, kaartmarker en preloader.

## Site-opbouw

- Pagina's: `index.html`, `kalender.html`, `podcast.html`, `studio-huren.html`, `achter-de-schermen.html`, `solid-flex.html`
- Header, menu en footer staan in elke pagina (zelfde markup) — wijziging = in alle 6 aanpassen.
- Placeholders: `<div class="ph" data-label="...">` binnen `.media` → vervangen door `<img>` / `<video>`.
- Secties kleuren de pagina via `data-theme="dark|light|orange"`.
- Google Maps API-key (optioneel, voor volledig gestylede kaart): `js/config.js`.
