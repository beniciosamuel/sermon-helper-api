#!/bin/bash
# Start the server in development mode (NODE_ENV=development, nodemon for hot reload)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/start.sh" development
