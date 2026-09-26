#!/usr/bin/env bash
# Creates a NEW private GitHub repository and publishes this site on Vercel.
# Run on your own authenticated machine. No tokens belong in this file or chat.
set -euo pipefail
cd "$(dirname "$0")/.."
OWNER="${ENAMPLIFY_OWNER:-amirgulubayli}"
REPO="${ENAMPLIFY_REPO:-enamplify}"
PROJECT="${ENAMPLIFY_PROJECT:-enamplify}"
SCOPE="${ENAMPLIFY_VERCEL_SCOPE:-amirgulubaylis-projects}"
for command in node npm git gh; do
  command -v "$command" >/dev/null || { echo "Required command missing: $command. Install Node.js 22+, Git, and GitHub CLI before continuing."; exit 1; }
done
if ! gh auth status >/dev/null 2>&1; then gh auth login; fi
LOGIN="$(gh api user --jq .login)"
if [ "$LOGIN" != "$OWNER" ]; then
  echo "Authenticated GitHub user is $LOGIN, not the intended owner $OWNER. No changes made."
  exit 1
fi
npx --yes vercel@latest whoami >/dev/null 2>&1 || npx --yes vercel@latest login

# Refuse to repurpose another repository or project.
if [ -d .git ]; then
  ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
  if [ -n "$ORIGIN" ]; then
    case "$ORIGIN" in
      "https://github.com/$OWNER/$REPO"|"https://github.com/$OWNER/$REPO.git"|"git@github.com:$OWNER/$REPO.git"|"ssh://git@github.com/$OWNER/$REPO.git") ;;
      *) echo "This folder is linked to a different repository. Refusing to change it: $ORIGIN"; exit 1 ;;
    esac
  fi
fi
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1 && [ -z "${ORIGIN:-}" ]; then
  echo "$OWNER/$REPO already exists. Choose a new ENAMPLIFY_REPO name, or intentionally link the correct existing repository first."; exit 1
fi
if [ ! -f .vercel/project.json ] && npx --yes vercel@latest project inspect "$PROJECT" --scope "$SCOPE" >/dev/null 2>&1; then
  echo "Vercel project $PROJECT already exists. Refusing to select it silently. Run 'vercel link' yourself to verify the right project, then rerun."; exit 1
fi

npm run assets:sync
npm run check
if [ ! -d .git ]; then git init -b main; fi
if ! git config user.name >/dev/null; then git config user.name "$(gh api user --jq '.name // .login')"; fi
if ! git config user.email >/dev/null; then git config user.email "$(gh api user --jq .id)+${LOGIN}@users.noreply.github.com"; fi
git add .
if ! git diff --cached --quiet; then git commit -m "Build the Enamplify editorial website"; fi
if [ -z "${ORIGIN:-}" ]; then
  gh repo create "$OWNER/$REPO" --private --source=. --remote=origin --push --description "Enamplify · AI education and advisory"
else
  git push -u origin HEAD
fi

npx --yes vercel@latest link --yes --project "$PROJECT" --scope "$SCOPE"
DEPLOYMENT="$(npx --yes vercel@latest --prod --yes --scope "$SCOPE")"
printf '\nVercel deployment output:\n%s\n' "$DEPLOYMENT"
if ! npx --yes vercel@latest git connect --yes --scope "$SCOPE"; then
  echo "The deployment command completed, but automatic Git deployment could not be connected. Review the Vercel Git integration."
fi
printf '\nRepository: https://github.com/%s/%s\n' "$OWNER" "$REPO"
echo 'No domain was purchased, no plan was upgraded, and no DNS records were changed.'
echo 'Before directing customers here: verify the live form mode, founder portrait, domain and contracting details.'
