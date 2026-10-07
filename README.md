# Les meves faltes

Web personal per portar el registre de faltes i retards per projecte (curs 2026-27).

- Cada projecte permet faltar el **15%** de les seves hores.
- Cada **retard** suma **⅓ h** de falta al seu projecte (2 retards = ⅔ h).
- Les dades es guarden al navegador (`localStorage`). Fes servir *Exportar còpia* per guardar-les o passar-les a un altre dispositiu.

Fitxers:
- `data.js` — temporització (hores de cada projecte per dia) i festius.
- `app.js` — càlculs i interfície.

## Publicar a GitHub Pages (gratis)

1. GitHub → **Settings** → **Pages**.
2. *Source*: **Deploy from a branch**.
3. *Branch*: `claude/absence-calculator-projects-ek4hwh`, carpeta `/ (root)` → **Save**.
4. En 1-2 minuts la web és a `https://lluc1996.github.io/App-Faltes/`.

Cada `push` a aquesta branca actualitza la web automàticament.
