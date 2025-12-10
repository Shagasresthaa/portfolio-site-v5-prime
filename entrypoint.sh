#!/bin/sh
set -e

# Load secrets from /run/secrets/ into environment variables
export DATABASE_URL=$(cat /run/secrets/database_url)
export AUTH_SECRET=$(cat /run/secrets/auth_secret)
export AUTH_TRUST_HOST=$(cat /run/secrets/auth_trust_host)
export NEXTAUTH_URL=$(cat /run/secrets/nextauth_url)
export AUTH_DISCORD_ID=$(cat /run/secrets/discord_id)
export AUTH_DISCORD_SECRET=$(cat /run/secrets/discord_secret)

# Execute the main command
exec "$@"