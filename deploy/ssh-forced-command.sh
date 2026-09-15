#!/usr/bin/env bash
# Forced command для ключа CI. Прописывается в ~/.ssh/authorized_keys как
#   command="/opt/wanderlust/repo/deploy/ssh-forced-command.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA...
#
# Смысл: ключ, лежащий в GitHub Secrets публичного репозитория, не должен давать
# шелл на машине, где рядом работают два чужих продакшена. Принимается ровно
# одна команда — "deploy <sha>".
set -euo pipefail

CMD="${SSH_ORIGINAL_COMMAND:-}"
LOG="/opt/wanderlust/logs/ssh-forced.log"
mkdir -p "$(dirname "$LOG")"
echo "$(date -Is) · from=${SSH_CONNECTION%% *} · cmd=$CMD" >> "$LOG"

case "$CMD" in
  deploy\ [0-9a-f]*)
    TAG="${CMD#deploy }"
    case "$TAG" in
      *[!0-9a-f]*|"") echo "тег должен быть hex-строкой git sha" >&2; exit 2;;
    esac
    exec /opt/wanderlust/repo/deploy/deploy.sh "$TAG"
    ;;
  *)
    echo "отвергнуто: этот ключ умеет только 'deploy <sha>'" >&2
    exit 2
    ;;
esac
