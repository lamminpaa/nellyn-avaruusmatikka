# Nellyn Avaruusmatikka 🚀

Dynaaminen 3D-matikkapeli jossa planeetat generoidaan pelaajan edistymisen mukaan.

## Ominaisuudet

- **Adaptiivinen oppiminen**: Planeetat ja tehtävät mukautuvat pelaajan taitojen mukaan
- **3D-ympäristö**: Interaktiivinen avaruusseikkailu Three.js:llä
- **Dynaaminen planeettageneraatio**: Uusia planeettoja luodaan lennossa
- **Älykkäät avaruusmerirosvot**: Syövät älypölyä ja vaikeuttavat peliä
- **Gravitaatiosysteemi**: Visuaalinen vaikeustasojen esitys

## Teknologiat

- HTML5 + CSS3 + JavaScript (ES6)
- Three.js (3D-grafiikka)
- Tween.js (animaatiot)

## Käyttö

Avaa `index.html` selaimessa tai käynnistä paikallinen palvelin:

```bash
python3 -m http.server 8080
```

## Pelimekaniikka

1. **Aloitus**: Peli alkaa yhdestä planeetasta
2. **Edistyminen**: Oikeat vastaukset generoivat uusia planeettoja
3. **Adaptointi**: Vaikeus mukautuu pelaajan suoritukseen
4. **Haasteet**: Avaruusmerirosvot ja älypölyn suojelu

## Cloudflare Workers

Peli on optimoitu Cloudflare Workers -ympäristöön staattisena sivustona.