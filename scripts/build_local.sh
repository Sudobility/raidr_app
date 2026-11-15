#!/usr/bin/env bash
#
# build_local.sh — LOCAL build-and-copy for the unpublished @sudobility/raidr_ui.
#
# raidr_app's other @sudobility deps are published, so a normal `bun install`
# resolves them. Only @sudobility/raidr_ui is local (the shared presentational UI
# extracted from this app and consumed by both raidr_app and raidr_mcp_app). It
# is not published yet, so this script:
#   (1) temporarily strips @sudobility/raidr_ui from package.json,
#   (2) runs `bun install` to fetch everything else,
#   (3) restores package.json,
#   (4) builds the sibling ../raidr_ui,
#   (5) copies its dist/ + package.json into node_modules/@sudobility/raidr_ui.
#
# Usage:
#   ./scripts/build_local.sh                # install + build + copy (full)
#   ./scripts/build_local.sh --skip-install # rebuild raidr_ui + recopy only (fast)
#   ./scripts/build_local.sh --help
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKSPACE="$(cd "${APP_DIR}/.." && pwd)"
UI_DIR="${WORKSPACE}/raidr_ui"

SKIP_INSTALL=0
for arg in "$@"; do
    case "$arg" in
        --skip-install) SKIP_INSTALL=1 ;;
        -h | --help)
            awk 'NR==1 {next} /^#/ {sub(/^# ?/, ""); print; next} {exit}' "${BASH_SOURCE[0]}"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg (see --help)" >&2
            exit 2
            ;;
    esac
done

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die() {
    printf '\033[1;31mError:\033[0m %s\n' "$*" >&2
    exit 1
}

[ -d "$UI_DIR" ] || die "missing sibling repo: $UI_DIR"

# Restore package.json if we stripped it, even on failure.
RESTORE=""
cleanup() { [ -n "$RESTORE" ] && [ -f "$RESTORE" ] && mv -f "$RESTORE" "${RESTORE%.local.bak}"; }
trap cleanup EXIT

if [ "$SKIP_INSTALL" -eq 0 ]; then
    pkg="${APP_DIR}/package.json"
    bak="${pkg}.local.bak"
    cp "$pkg" "$bak"
    RESTORE="$bak"
    node -e '
      const fs = require("fs");
      const p = process.argv[1];
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      for (const k of ["dependencies","devDependencies","peerDependencies","optionalDependencies"]) {
        if (j[k]) delete j[k]["@sudobility/raidr_ui"];
      }
      fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
    ' "$pkg"
    log "installing (without @sudobility/raidr_ui)"
    (cd "$APP_DIR" && bun install) || die "bun install failed (is @sudobility auth configured?)"
    mv -f "$bak" "$pkg"
    RESTORE=""
fi

log "building raidr_ui"
if [ "$SKIP_INSTALL" -eq 0 ]; then (cd "$UI_DIR" && bun install); fi
(cd "$UI_DIR" && bun run build) || die "raidr_ui build failed"

[ -d "$UI_DIR/dist" ] || die "raidr_ui has no dist/ after build"
target="${APP_DIR}/node_modules/@sudobility/raidr_ui"
rm -rf "$target"
mkdir -p "$target"
cp -R "$UI_DIR/dist" "$target/dist"
cp "$UI_DIR/package.json" "$target/package.json"
log "copied raidr_ui -> raidr_app/node_modules/@sudobility/raidr_ui"
log "done — verify with: bun run typecheck"
