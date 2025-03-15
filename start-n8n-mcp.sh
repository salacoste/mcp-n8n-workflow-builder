#!/bin/bash
# Перенаправляем stderr в файл, оставляя stdout для коммуникации с Claude
node "$(pwd)/build/index.js" 2> ~/logs/n8n-mcp.log 