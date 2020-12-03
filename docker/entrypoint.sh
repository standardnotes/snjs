#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local' )
    echo "Prestart Step 1/1 - Build project"
    yarn bundle
    echo "Starting Test Server..."
    yarn start:test-server
    ;;

  'start-web' )
    echo "Starting Test Server..."
    yarn start:test-server
    ;;

  * )
    echo "Unknown command"
    ;;
esac

exec "$@"
