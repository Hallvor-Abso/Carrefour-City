# Procédures du magasin

Petit site interne qui regroupe les procédures de l'équipe. Chaque procédure est un fichier
Markdown : pas de base de données, pas d'interface d'administration, pas de coût d'hébergement.

- Next.js (App Router), déployé sur Vercel
- Accès protégé par un mot de passe partagé
- Recherche instantanée, rendu mobile, fiches imprimables
- Non indexé par les moteurs de recherche

## Déploiement sur Vercel

1. Sur [vercel.com/new](https://vercel.com/new), importer ce dépôt GitHub.
2. Laisser tous les réglages de build par défaut (Vercel détecte Next.js).
3. Avant de cliquer sur **Deploy**, ouvrir **Environment Variables** et ajouter :

   | Nom | Valeur |
   | --- | --- |
   | `SITE_PASSWORD` | le mot de passe que l'équipe utilisera |
   | `AUTH_SECRET` | une longue chaîne aléatoire (voir ci-dessous) |

   Pour générer `AUTH_SECRET` :

   ```bash
   openssl rand -base64 32
   ```

4. Déployer. Le site est en ligne sur `https://<nom-du-projet>.vercel.app`.

### Changer le mot de passe plus tard

Modifier `SITE_PASSWORD` dans **Settings → Environment Variables**, puis redéployer
(**Deployments → … → Redeploy**). Tout le monde est déconnecté et devra saisir le nouveau
mot de passe : c'est voulu, c'est ce qui permet de couper l'accès à quelqu'un qui part.

## Ajouter ou modifier une procédure

Une procédure = un fichier `.md` dans `content/`. Le nom du fichier devient l'adresse de la page
(`content/ouverture-du-magasin.md` → `/procedures/ouverture-du-magasin`).

```markdown
---
title: Ouverture du magasin
category: Ouverture et fermeture
order: 10
updated: 2026-08-18
summary: Une phrase qui apparaît sous le titre dans la liste.
---

## Première étape

1. Faire ceci
2. Puis cela
```

| Champ | Rôle |
| --- | --- |
| `title` | Titre affiché |
| `category` | Regroupe les fiches sur la page d'accueil |
| `order` | Ordre d'affichage, croissant. Les catégories sont classées par leur plus petit `order` |
| `updated` | Date `AAAA-MM-JJ`, affichée sur la fiche |
| `summary` | Résumé d'une ligne |

Une fois le fichier ajouté et poussé sur GitHub, Vercel redéploie tout seul en une minute environ.

Pour insérer une photo : la déposer dans `public/images/`, puis l'appeler depuis le Markdown avec
`![Description](/images/mon-fichier.jpg)`.

## Développement local

```bash
npm install
cp .env.example .env
# renseigner SITE_PASSWORD et AUTH_SECRET dans .env
npm run dev
```

Le site tourne sur http://localhost:3000.
