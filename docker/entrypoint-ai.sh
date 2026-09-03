#!/bin/sh
# Ollama 백그라운드 시작
/bin/ollama serve &
pid=$!

# Ollama 준비 대기
echo "⏳ Waiting for Ollama to become ready..."
until /bin/ollama list > /dev/null 2>&1; do
  sleep 1
done

# 필요한 경량 모델 자동 다운로드 (최초 1회만 실행됨)
echo "📥 Checking required local models..."
/bin/ollama pull all-minilm
/bin/ollama pull qwen2.5:1.5b

echo "✅ Ollama local AI engine is ready!"
wait $pid
