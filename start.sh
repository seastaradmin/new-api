#!/usr/bin/env bash
set -euo pipefail

# Local development. Override BACKEND_PORT, FRONTEND_PORT, or OPEN_BROWSER=0.
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin:$HOME/.bun/bin"
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

backend_port="${BACKEND_PORT:-3001}"
frontend_port="${FRONTEND_PORT:-5173}"

for tool in go bun node curl lsof; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf '缺少依赖：%s，请先安装后重试。\n' "$tool" >&2
    exit 1
  fi
done

for port in "$backend_port" "$frontend_port"; do
  if [[ ! "$port" =~ ^[1-9][0-9]{0,4}$ ]] || (( port > 65535 )); then
    printf '端口无效：%s，应为 1 到 65535。\n' "$port" >&2
    exit 1
  fi
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    printf '端口 %s 已被占用，请设置 BACKEND_PORT 或 FRONTEND_PORT 后重试。\n' "$port" >&2
    exit 1
  fi
done
if [[ "$backend_port" == "$frontend_port" ]]; then
  printf '后端和前端必须使用不同端口。\n' >&2
  exit 1
fi

app_version="${VERSION:-}"
if [[ -z "$app_version" && -s VERSION ]]; then
  app_version="$(tr -d '\r\n' < VERSION)"
fi
if [[ -z "$app_version" ]] && command -v git >/dev/null 2>&1; then
  app_version="$(git describe --tags --always --dirty 2>/dev/null || true)"
fi
app_version="${app_version:-dev}"
export VERSION="$app_version" VITE_REACT_APP_VERSION="$app_version"

printf '正在准备前端依赖……\n'
(cd web && bun install --frozen-lockfile)
if [[ ! -f web/dist/index.html ]]; then
  printf '首次运行，正在构建后端需要嵌入的前端资源……\n'
  (cd web && bun run build)
fi

printf '正在编译后端（%s）……\n' "$app_version"
mkdir -p .cache/dev
go build -o .cache/dev/new-api .

# Separate process groups let cleanup stop Bun and its dev-server children.
set -m
backend_pid=''
frontend_pid=''
cleanup() {
  trap - EXIT INT TERM
  for pid in "$frontend_pid" "$backend_pid"; do
    if [[ -n "$pid" ]]; then
      kill -TERM -- "-$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

printf '正在启动后端：http://localhost:%s\n' "$backend_port"
PORT="$backend_port" .cache/dev/new-api &
backend_pid=$!

ready=0
for ((attempt = 0; attempt < 60; attempt++)); do
  if ! kill -0 "$backend_pid" 2>/dev/null; then
    printf '后端启动失败，请查看上方日志。\n' >&2
    exit 1
  fi
  if curl --noproxy '*' --fail --silent --max-time 1 \
    "http://127.0.0.1:$backend_port/api/status" >/dev/null; then
    ready=1
    break
  fi
  sleep 1
done
if (( ! ready )); then
  printf '等待后端就绪超时，请查看上方日志。\n' >&2
  exit 1
fi

frontend_args=(--host 127.0.0.1 --port "$frontend_port" --strict-port)
if [[ "${OPEN_BROWSER:-1}" != 0 ]]; then
  frontend_args+=(--open)
fi
printf '\n深蓝：http://localhost:%s\n按 Ctrl+C 同时停止前后端。\n\n' "$frontend_port"
(
  cd web
  export VITE_REACT_APP_SERVER_URL="http://127.0.0.1:$backend_port"
  exec bun run dev -- "${frontend_args[@]}"
) &
frontend_pid=$!

while kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null; do
  sleep 1
done
if ! kill -0 "$backend_pid" 2>/dev/null; then
  printf '后端已退出，正在停止前端。\n' >&2
  exit 1
fi
wait "$frontend_pid"
