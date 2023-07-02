#!/usr/bin/env bash

set -e

(cd projects && npm run lint)
(cd projects/next_v13 && npm run build && SKIP_BUILD=true npm test)
(cd projects/react && npm test)
(cd projects/redux-toolkit && npm test)
(cd projects/rxjs && npm test)
(cd projects/prisma && npm test)
(cd projects/recoil && npm test)
(cd projects/ramda && npm test)
