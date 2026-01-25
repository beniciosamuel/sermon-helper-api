#!/bin/bash
# Start the server in production mode (NODE_ENV=production, node without file watching)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/start.sh" production
