#!/bin/sh
set -e

# Default values for current Redis
CURRENT_REDIS_HOST_EFFECTIVE="${REDIS_HOST:-localhost}"
CURRENT_REDIS_PORT_EFFECTIVE="${REDIS_PORT:-6379}"
CURRENT_REDIS_PASSWORD_CLI_ARG=""

# Values for old Redis (must be set if SYNC_ON_EMPTY is true)
OLD_REDIS_HOST_EFFECTIVE="${OLD_REDIS_HOST}"
OLD_REDIS_PORT_EFFECTIVE="${OLD_REDIS_PORT:-6379}"
OLD_REDIS_AUTH_ARG=""

# Construct password arguments for redis-cli
if [ -n "$REDIS_PASSWORD" ]; then
  CURRENT_REDIS_PASSWORD_CLI_ARG="-a $REDIS_PASSWORD"
fi

# For MIGRATE command, password for the source is part of the MIGRATE arguments
if [ -n "$OLD_REDIS_PASSWORD" ]; then
  OLD_REDIS_AUTH_ARG="AUTH $OLD_REDIS_PASSWORD"
fi

echo "Entrypoint script started."

if [ "$SYNC_ON_EMPTY" = "true" ]; then
  echo "SYNC_ON_EMPTY is true. Checking Redis status."

  if ! command -v redis-cli > /dev/null; then
    echo "Error: redis-cli command not found. Please ensure it is installed in the Docker image." >&2
    exit 1
  fi

  if [ -z "$OLD_REDIS_HOST_EFFECTIVE" ]; then
    echo "Warning: SYNC_ON_EMPTY is true, but OLD_REDIS_HOST is not set. Skipping sync." >&2
  else
    echo "Connecting to current Redis at $CURRENT_REDIS_HOST_EFFECTIVE:$CURRENT_REDIS_PORT_EFFECTIVE to check DBSIZE."
    
    if ! redis-cli -h "$CURRENT_REDIS_HOST_EFFECTIVE" -p "$CURRENT_REDIS_PORT_EFFECTIVE" $CURRENT_REDIS_PASSWORD_CLI_ARG PING > /dev/null 2>&1; then
        echo "Error: Could not connect to current Redis at $CURRENT_REDIS_HOST_EFFECTIVE:$CURRENT_REDIS_PORT_EFFECTIVE. Please check connection details and network." >&2
        echo "Proceeding to start the application without sync."
    else
        DBSIZE=$(redis-cli -h "$CURRENT_REDIS_HOST_EFFECTIVE" -p "$CURRENT_REDIS_PORT_EFFECTIVE" $CURRENT_REDIS_PASSWORD_CLI_ARG DBSIZE)
        echo "Current Redis DBSIZE: $DBSIZE"

        if [ "$DBSIZE" -eq 0 ]; then
          echo "Current Redis is empty. Attempting to sync from old Redis at $OLD_REDIS_HOST_EFFECTIVE:$OLD_REDIS_PORT_EFFECTIVE."
          
          MIGRATE_ARGS="$OLD_REDIS_HOST_EFFECTIVE $OLD_REDIS_PORT_EFFECTIVE \"\"\" 0 5000 COPY REPLACE" # key="", target_db=0, timeout=5000ms
          if [ -n "$OLD_REDIS_AUTH_ARG" ]; then
            MIGRATE_ARGS="$MIGRATE_ARGS $OLD_REDIS_AUTH_ARG"
          fi
          
          echo "Executing migration..."
          if redis-cli -h "$CURRENT_REDIS_HOST_EFFECTIVE" -p "$CURRENT_REDIS_PORT_EFFECTIVE" $CURRENT_REDIS_PASSWORD_CLI_ARG MIGRATE $MIGRATE_ARGS; then
            echo "Data sync completed successfully."
          else
            echo "Error during data sync. Check logs for details. The application will still start." >&2
          fi
        else
          echo "Current Redis is not empty (DBSIZE=$DBSIZE). Skipping sync."
        fi
    fi
  fi
else
  echo "SYNC_ON_EMPTY is not 'true'. Skipping Redis check and sync."
fi

echo "Starting application: $@"
exec "$@" 