#!/bin/bash
# 작업 경로로 이동
cd /home/ec2-user/changopj || { echo "Directory not found"; exit 1; }

# 1. 환경 변수 로드 (더 안전한 방식)
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo ".env file missing!"
    exit 1
fi

# 2. ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com

# 3. 최신 이미지 Pull 및 컨테이너 실행
sudo docker compose pull
sudo docker compose up -d --remove-orphans

# 4. 사용하지 않는 이미지 정리
sudo docker image prune -f
