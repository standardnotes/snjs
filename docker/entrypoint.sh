#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local' )
    echo "Prestart Step 1/2 - Install dependencies"
    npm ci
    echo "Prestart Step 2/2 - Build project"
    npm run bundle
    echo "Starting Test Server..."
    npm run start:test-server
    ;;

  'start-web' )
    echo "Starting Test Server..."
    npm run start:test-server
    ;;

  * )
    echo "Unknown command"
    ;;
esac

exec "$@"
