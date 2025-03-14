curl -X PUT http://localhost:3000/api/system/statusLEDs \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer a4382ae3-a1d4-4fb7-b966-3ea5cb1f0889" \
     -d '{"statusLEDs": "off"}'