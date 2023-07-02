#!/usr/bin/env bash

set -e

(cd projects/ \
  && npm i && ./node_modules/.bin/playwright install \
  && ./node_modules/.bin/playwright install-deps)
(cd projects/next_v13 && npm i)
(cd projects/rxjs && npm i)
(cd projects/react && npm i)
(cd projects/redux-toolkit && npm i)
(cd projects/prisma && npm i)
(cd projects/recoil && npm i)
(cd projects/ramda && npm i)
