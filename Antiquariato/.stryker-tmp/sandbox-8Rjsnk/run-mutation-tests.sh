#!/bin/bash
set -e

# Avvia il server Node mutato in background
node serverClient.js &
SERVER_PID=$!

# Attende che il server risponda (adatta porta/endpoint ai vostri)
npx wait-on http://localhost:3001 -t 15000

# Esegue solo le classi di test Cliente rilevanti
cd test-java-project-path
mvn test -Dtest=NomeClasseAuth,NomeClasseRegistrazione
EXIT_CODE=$?

# Termina il server
kill $SERVER_PID

exit $EXIT_CODE
