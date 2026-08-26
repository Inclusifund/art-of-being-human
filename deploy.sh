#!/usr/bin/env bash
# Deploy ./_build to the GitHub Pages repo.
#
# WHY THIS EXISTS AS A SCRIPT: the deploy is an rsync --delete into a clone of
# Inclusifund/art-of-being-human, and there are two files in that repo which do
# NOT exist in _build and must survive every push:
#
#   CNAME      — written by GitHub when the custom domain is set in Settings >
#                Pages. Delete it and the custom domain silently detaches; the
#                site keeps working on github.io, so nothing looks broken until
#                someone types theartofbeinghuman.life. This is the failure the
#                go-live runbook warns about, and a --delete rsync is exactly
#                how it happens. Excluded here so it cannot.
#   README.md  — repo housekeeping, never served.
#
# Usage: ./deploy.sh "commit message"
set -euo pipefail
cd "$(dirname "$0")"
MSG="${1:?usage: ./deploy.sh \"commit message\"}"
REPO=git@github.com:Inclusifund/art-of-being-human.git
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

./build-preview.sh

git clone -q "$REPO" "$WORK/repo"
rsync -a --delete \
      --exclude '.git' --exclude 'README.md' --exclude 'CNAME' --exclude '.gitignore' \
      ./_build/ "$WORK/repo/"

cd "$WORK/repo"
if [ -z "$(git status --porcelain)" ]; then echo "nothing to deploy"; exit 0; fi
git add -A && git commit -q -m "$MSG" && git push -q origin main
SHA=$(git rev-parse --short HEAD)
echo "deployed $SHA"
[ -f CNAME ] && echo "CNAME preserved: $(cat CNAME)" || echo "CNAME: none yet (custom domain not set)"
echo "verify:  https://inclusifund.github.io/art-of-being-human/"
