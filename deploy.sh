#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

API_KEY="9ddf17fb2ecd991757f27d6c20c356d0e8fe9"
API_EMAIL="money@stream.place"
ZONE_ID="b57ced40b3a7df35ee2e6a84862e5f07"

curl -v -X PUT -H "X-Auth-Email: $API_EMAIL" -H "X-Auth-Key: $API_KEY" \
      "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/script" \
	    -F metadata=@worker-metadata.json \
	    -F script=@dist/cloudflare.js \
	    -F wasm=@module.wasm
