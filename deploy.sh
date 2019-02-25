#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

API_KEY="$(cat /keybase/team/streamplace_team/secrets/cloudflare-api-key.txt)"
API_EMAIL="money@stream.place"
ZONE_ID="aa42504785ffc1e9cb003d07a7aeb3e6"

curl -v -X PUT -H "X-Auth-Email: $API_EMAIL" -H "X-Auth-Key: $API_KEY" \
      "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/script" \
	    -F metadata=@worker-metadata.json \
	    -F script=@dist/cloudflare-worker.js \
	    -F wasm=@dist/module.wasm
