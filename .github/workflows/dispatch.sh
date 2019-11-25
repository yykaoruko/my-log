#!/bin/bash

curl -X POST -H "Authorization: token $MY_TOKEN" -H "Accept: application/vnd.github.everest-preview+json" --data '{"event_type": "test-hello"}' https://api.github.com/repos/yykaoruko/rukolog/dispatches
