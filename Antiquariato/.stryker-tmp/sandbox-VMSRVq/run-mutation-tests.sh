#!/bin/bash
set -e

node serverCliente.js &
SERVER_PID=$!

npx wait-on http://localhost:3001 -t 15000

cd Testing/antiquariato_test
mvn test -Dtest=ClienteFSMTest\$S0_S3_AccessoPubblico,ClienteFSMTest\$S3_Registrazione
EXIT_CODE=$?
cd ../..

kill $SERVER_PID
exit $EXIT_CODE