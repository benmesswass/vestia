# VESTIA

Le vestiaire digital des lieux à fort débit — clubs, bars, restaurants, salles
de concert et événements. VESTIA remplace le ticket papier : dépôt en quelques
secondes, ticket QR envoyé au client, restitution scannée et pilotage de la
soirée en temps réel.

> **Démonstration produit.** Toutes les données sont fictives et générées côté
> client. Aucun backend, aucune authentification réelle, aucun message envoyé.

---

## Démarrer

```bash
npm install
npm run dev
```

L'application est servie sur http://localhost:3000.

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Le scénario de démonstration

La soirée est préchargée : **samedi 12 septembre 2026, 23 h 12**, au club
« Le Sonar » (Paris 11e). 96 dépôts depuis l'ouverture à 19 h 30, un vestiaire
de 132 positions rempli à ~59 %, 4 incidents dont 2 ouverts.

Le dépôt scénarisé est le ticket **`V-4821`** :

| | |
|---|---|
| Client | Thomas Martin — 06 12 34 56 78 |
| Affaires | 1 manteau noir, 1 sac noir |
| Emplacement | Zone B · Rack 24 · Position 8 |
| Heure | 22:43 |
| Statut | Actif |

Il est retrouvable depuis le tableau de bord, la recherche globale, le scan, la
liste des dépôts, le plan du vestiaire et la fiche client.

### Parcours à dérouler devant un client

1. **`/`** — la promesse produit, puis « Ouvrir la démonstration ».
2. **`/dashboard`** — l'état de la soirée en un écran.
3. **`/deposits/new`** — Manteau + Sac → emplacement attribué → ticket + QR.
4. **`/ticket/V-4821`** — le ticket côté client, sur mobile.
5. **`/scan`** — « Simuler un scan » ouvre `V-4821` → « Restituer les affaires ».
6. **`/dashboard`** — les compteurs ont bougé.

`Paramètres → Réinitialiser` remet la soirée dans son état initial entre deux
démonstrations.

## Routes

| Route | Rôle |
|---|---|
| `/` | Page de présentation |
| `/login` | Connexion (identifiants pré-remplis) |
| `/dashboard` | Tableau de bord opérationnel |
| `/deposits` | Liste des dépôts — recherche, filtres, pagination |
| `/deposits/new` | Création d'un dépôt en 4 étapes |
| `/deposits/[id]` | Fiche dépôt — client, objets, emplacement, QR, historique |
| `/scan` | Scan d'un ticket et restitution |
| `/customers`, `/customers/[id]` | Clients et historique de leurs dépôts |
| `/analytics` | Affluence, occupation, objets, durées de garde |
| `/incidents` | Tickets perdus, objets, emplacements |
| `/plan` | Plan interactif du vestiaire |
| `/settings` | Configuration et réinitialisation de la démo |
| `/ticket/[id]` | Ticket client (mobile) |
| `/retrieve/[id]` | Confirmation de retrait par le client |

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript strict**
- **Tailwind CSS 4** — jetons de design déclarés dans `app/globals.css`
- **lucide-react** (icônes) · **recharts** (graphiques) · **qrcode.react** (QR)

Aucune autre dépendance : les animations sont en CSS, l'état vit dans un
`useReducer` partagé par contexte.

## Architecture

```
app/
  (staff)/          Interface staff (sidebar, rail tablette, onglets mobile)
    dashboard/ deposits/ scan/ customers/ analytics/ incidents/ plan/ settings/
  ticket/[id]/      Ticket client, pensé mobile
  retrieve/[id]/    Confirmation de retrait
  login/  page.tsx  Connexion et page de présentation
components/
  ui/               Button, Badge, Card, Modal, Toast, champs, états
  domain/           KPI, plan du vestiaire, QR, timeline, tableau, modales
  layout/           Shell applicatif, navigation, recherche globale
lib/
  types.ts          Modèle de domaine
  demo-data.ts      Jeu de données déterministe (générateur à graine fixe)
  store.tsx         État applicatif + actions
  stats.ts          Indicateurs et séries pour les graphiques
  cloakroom.ts      Plan, occupation, attribution des emplacements
  format.ts         Dates, durées, emplacements — sans dépendance au fuseau
legacy/             Maquettes HTML de la première version
```

### Deux partis pris qui expliquent le reste du code

**Les horodatages sont des chaînes ISO locales « naïves »** (`2026-09-12T22:43:00`)
formatées par découpage de chaîne, jamais via une API sensible au fuseau. Le
serveur et le navigateur produisent donc exactement le même HTML, ce qui élimine
toute une classe d'erreurs d'hydratation.

**Le jeu de données est généré, pas écrit à la main**, par un générateur
congruentiel à graine fixe. Les 96 dépôts de la soirée sont donc identiques à
chaque rendu, côté serveur comme côté client, tout en restant crédibles
(affluence, durées de garde, taux de restitution).

## Accessibilité

Navigation au clavier et anneaux de focus visibles, libellés ARIA sur les
contrôles, contrastes conformes, et `prefers-reduced-motion` respecté —
l'ensemble des animations est neutralisé pour qui le demande.

Les deux séries de couleurs utilisées dans les graphiques ont été validées pour
la vision des couleurs (ΔE 32,7 en deutéranopie, bien au-dessus du seuil de 8).
