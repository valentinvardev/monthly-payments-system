@echo off
rem Lanzador para clientes MCP que no fijan el directorio de trabajo
rem (Claude Desktop). Se para en la raíz del repo y arranca el server.
rem Los links apuntan a producción: el .env del repo tiene APP_URL en
rem localhost para desarrollo.
cd /d "%~dp0..\.."
if not defined MCP_APP_URL set "MCP_APP_URL=https://surcodia.com"
node --env-file=.env --import tsx mcp/payments/server.ts
