#!/usr/bin/env bash
# Runs the reproduction in both modes and prints the exit codes.
# Buggy mode is expected to crash (non-zero exit); fixed mode exits 0.
set -u
cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════"
echo "  BUGGY — current devel behavior (expected: CRASH)"
echo "═══════════════════════════════════════════════════════"
node repro.js buggy
echo "exit code: $?"
echo

echo "═══════════════════════════════════════════════════════"
echo "  FIXED — with try/catch (expected: survives)"
echo "═══════════════════════════════════════════════════════"
node repro.js fixed
echo "exit code: $?"
