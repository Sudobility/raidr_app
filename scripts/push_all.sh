#!/bin/bash

# push_all.sh - Project-specific configuration for push_projects.sh
#
# This script defines the list of projects to process and sources the
# reusable push_projects.sh script from the workflows repo.
#
# Usage:
#   ./push_all.sh                              # Update deps and process only projects with changes
#   ./push_all.sh --force                      # Force version bump on all projects
#   ./push_all.sh --subpackages                # Also process sub-packages in /packages directories
#   ./push_all.sh --starting-project <name>    # Skip projects until reaching <name>
#   ./push_all.sh --help                       # Show help message

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Define projects in dependency order with wait times
# Format: "relative_path:wait_after_in_seconds"
#
# Wait times are used for packages that need CI/CD to complete publishing
# before dependent packages can fetch the new version from npm.
#
# raidr dependency graph:
#   raidr_types -> raidr_processor -> raidr_client -> raidr_lib -> raidr_app
#   raidr_cli needs processor; raidr_crawler needs types + processor + cli
#   (it imports raidr_cli's reconstruct), so cli is published, and waited for,
#   before the crawler; raidr_extension needs processor; raidr_api needs
#   types; raidr_web depends on nothing.
#   raidr agent: raidr_agent_types -> raidr_agent_client -> raidr_agent_lib;
#   raidr_agent_api needs raidr_types + raidr_agent_types; raidr_agent_app_rn
#   depends on nothing yet.
PROJECTS=(
    "../raidr_types:0"
    "../raidr_agent_types:60"
    "../raidr_mcp_types:0"
    "../raidr_processor:60"
    "../raidr_api:0"
    "../raidr_client:0"
    "../raidr_mcp_api:0"
    "../raidr_mcp_client:0"
    "../raidr_agent_api:0"
    "../raidr_agent_client:60"
    "../raidr_lib:0"
    "../raidr_mcp_lib:0"
    "../raidr_agent_lib:60"
    "../raidr_cli:180"
    "../raidr_crawler:0"
    "../raidr_extension:0"
    "../raidr_app:0"
    "../raidr_mcp_app:0"
    "../raidr_web:0"
    "../raidr_agent_app_rn:0"
)

# Source reusable script: prefer local workflows repo, fall back to GitHub
LOCAL_SCRIPT="$(cd "$BASE_DIR" && pwd)/../workflows/scripts/push_projects.sh"
if [ -f "$LOCAL_SCRIPT" ]; then
    source "$LOCAL_SCRIPT"
else
    PUSH_SCRIPT=$(mktemp)
    trap "rm -f $PUSH_SCRIPT" EXIT
    if ! curl -fsSL "https://raw.githubusercontent.com/johnqh/workflows/main/scripts/push_projects.sh" -o "$PUSH_SCRIPT"; then
        echo "Error: Failed to download push_projects.sh from GitHub"
        exit 1
    fi
    source "$PUSH_SCRIPT"
fi

# Parse command-line arguments
parse_args "$@"

# Run the push process
run_push_projects "$BASE_DIR" "${PROJECTS[@]}"
