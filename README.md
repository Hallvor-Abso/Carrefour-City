# Procédures du magasin

Petit site interne qui regroupe les procédures de l'équipe. Chaque procédure est un fichier
Markdown : pas de base de données, pas d'interface d'administration, pas de coût d'hébergement.

- Next.js (App Router), déployé sur Vercel
- Deux niveaux d'accès : l'équipe, et le responsable
- Éditeur intégré : le responsable crée et modifie les fiches depuis le site
- Recherche instantanée, rendu mobile, fiches imprimables
- Non indexé par les moteurs de recherche

## Les deux niveaux d'accès

| Niveau | Mot de passe | Ce qu'il ouvre |
| --- | --- | --- |
| Équipe | `SITE_PASSWORD` | Les procédures de `content/` |
| Responsable | `ADMIN_PASSWORD` | Tout ce qui précède, plus `/admin` et les fiches de `content-admin/` |

Le mot de passe responsable ouvre aussi le reste du site : pas besoin de se reconnecter pour
passer d'un espace à l'autre. L'inverse est faux, et l'équipe ne voit aucun lien vers `/admin`.

Les fiches réservées vivent sous `/admin/procedures/…`, une adresse que le middleware refuse
sans le cookie responsable. Elles ne sont pas simplement masquées à l'affichage : leur contenu
n'est jamais envoyé à un navigateur qui n'a que le niveau équipe.

Si `ADMIN_PASSWORD` n'est pas défini, l'espace responsable n'existe tout simplement pas.

## Déploiement sur Vercel

1. Sur [vercel.com/new](https://vercel.com/new), importer ce dépôt GitHub.
2. Laisser tous les réglages de build par défaut (Vercel détecte Next.js).
3. Avant de cliquer sur **Deploy**, ouvrir **Environment Variables** et ajouter :

   | Nom | Valeur |
   | --- | --- |
   | `SITE_PASSWORD` | le mot de passe que l'équipe utilisera |
   | `ADMIN_PASSWORD` | ton mot de passe de responsable, différent du précédent |
   | `AUTH_SECRET` | une longue chaîne aléatoire (voir ci-dessous) |
   | `GITHUB_TOKEN` | un jeton GitHub, pour l'éditeur intégré (voir plus bas) |
   | `GITHUB_REPO` | `Hallvor-Abso/Carrefour-City` |

   Pour générer `AUTH_SECRET` :

   ```bash
   openssl rand -base64 32
   ```

4. Déployer. Le site est en ligne sur `https://<nom-du-projet>.vercel.app`.

### Changer un mot de passe plus tard

Modifier `SITE_PASSWORD` ou `ADMIN_PASSWORD` dans **Settings → Environment Variables**, puis
redéployer (**Deployments → … → Redeploy**). Tout le monde est déconnecté du niveau concerné et
devra saisir le nouveau mot de passe : c'est voulu, c'est ce qui permet de couper l'accès à
quelqu'un qui part.

## Modifier les procédures depuis le site

Le responsable dispose d'un éditeur à l'adresse `/admin/fiches` : créer, modifier, déplacer d'un
espace à l'autre, supprimer. Pas besoin de connaître GitHub.

Le système de fichiers de Vercel étant en lecture seule, l'éditeur n'écrit pas sur le serveur : il
**écrit dans le dépôt** via l'API GitHub. Chaque enregistrement est donc un commit — l'historique
montre qui a changé quelle règle et quand — et Vercel reconstruit le site tout seul. Compte environ
une minute entre l'enregistrement et le moment où l'équipe voit la nouvelle version. La liste de
`/admin/fiches`, elle, lit directement le dépôt : ce que tu viens d'enregistrer y apparaît tout de
suite.

### Créer le jeton GitHub

Attention : il s'agit des réglages **du compte**, pas de ceux du dépôt. Le plus direct est
d'ouvrir <https://github.com/settings/personal-access-tokens/new>. Sinon : avatar en haut à
droite → **Settings** → tout en bas de la colonne de gauche → **Developer settings** →
**Personal access tokens** → **Fine-grained tokens**.

1. **Repository access** : *Only select repositories*, puis ce dépôt uniquement.
2. **Permissions → Repository permissions → Contents** : *Read and write*. Rien d'autre.
3. Générer le jeton et le copier immédiatement : GitHub ne le réaffiche jamais.
4. Le coller dans `GITHUB_TOKEN` sur Vercel, avec `GITHUB_REPO`.

Sans ces deux variables le site fonctionne normalement, mais l'éditeur s'affiche désactivé et les
fiches se modifient uniquement sur GitHub.

Un jeton fine-grained expire (12 mois au maximum). À l'expiration, l'éditeur affichera que GitHub
refuse le jeton : il suffit d'en générer un nouveau et de remplacer la variable.

## Modifier les procédures depuis GitHub

Une procédure = un fichier `.md`. Le nom du fichier devient l'adresse de la page.

- `content/` → visible par l'équipe, à `/procedures/<nom-du-fichier>`
- `content-admin/` → réservé au responsable, à `/admin/procedures/<nom-du-fichier>`

Déplacer un fichier d'un dossier à l'autre suffit à changer qui peut le lire.

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
# renseigner SITE_PASSWORD, ADMIN_PASSWORD et AUTH_SECRET dans .env
npm run dev
```

Le site tourne sur http://localhost:3000.
