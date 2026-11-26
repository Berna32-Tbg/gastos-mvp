#!/usr/bin/env bash
# Guía para construir el historial. Ejecuta cada bloque a medida que avanzas,
# haciendo cambios reales entre commits (no commits vacíos).
set -e
git init -b main
git add . && git commit -m "chore: initial Expo + TypeScript project"
git checkout -b develop
git commit --allow-empty -m "chore: placeholder"   # reemplaza por: eslint, prettier, .env.example

git checkout -b feature/login develop
# commits: supabase client / login screen + zod / encrypted session storage / biometric unlock
git push -u origin feature/login   # Abre PR feature/login -> develop y deja la revisión documentada
git checkout develop && git merge --no-ff feature/login

git checkout -b feature/expenses-crud develop
# commits: encrypted schema / types / repositories / UI list+form / sync
git checkout develop && git merge --no-ff feature/expenses-crud

git checkout -b feature/camera-notifications develop
# commits: camera / 80% alert + weekly reminder / stats chart
git checkout develop && git merge --no-ff feature/camera-notifications

git checkout -b hotfix/negative-amount main
# commit: fix(validation): reject negative amounts
git checkout main && git merge --no-ff hotfix/negative-amount
git checkout develop && git merge --no-ff hotfix/negative-amount
