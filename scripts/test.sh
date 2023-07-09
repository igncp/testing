#!/usr/bin/env bash

set -e

(cd projects && npm run lint)
(cd projects/next_v13 && npm run build && SKIP_BUILD=true npm test)
(cd projects/react && npm test)
(cd projects/state-management && npm test)
(cd projects/rxjs && npm test)
(cd projects/prisma && npm test)
(cd projects/data-manipulation && npm test)
