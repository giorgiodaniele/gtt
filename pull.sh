#!/bin/bash
set -e  # esci subito se un comando fallisce

build_and_push() {
  local dir=$1
  local name=$2

  (
    cd "$dir"
    echo ">>> Building $name..."
    docker build -t "$name:1.0" .
    docker tag "$name:1.0" "giorgiodaniele/$name:1.0"
    docker push "giorgiodaniele/$name:1.0"
    echo ">>> Done $name"
  )
}

# Avvio in parallelo
build_and_push be-gtt be-gtt &
build_and_push fe-gtt fe-gtt &

# Aspetto che finiscano entrambi
wait
echo ">>> Tutte le build e push completate ✅"
