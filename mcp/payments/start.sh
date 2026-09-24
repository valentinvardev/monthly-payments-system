#!/usr/bin/env sh
# Lanzador para clientes MCP que no fijan el directorio de trabajo
# (Claude Desktop). Se para en la raíz del repo y arranca el server.
# Los links apuntan a producción: el .env del repo tiene APP_URL en
# localhost para desarrollo.
cd "$(dirname "$0")/../.." || exit 1
export MCP_APP_URL="${MCP_APP_URL:-https://surcodia.com}"
exec node --env-file=.env --import tsx mcp/payments/server.ts
