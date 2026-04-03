#!/bin/bash
cd /home/ec2-user/changopj || exit 1

# 환경 변수 로드
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# ECR 로그인 및 재배포
aws ecr get-login-password --region ap-northeast-2 | \
sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com

sudo docker compose pull
sudo docker compose up -d --remove-orphans
sudo docker image prune -f
