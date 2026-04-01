#!/bin/bash
cd /home/ubuntu/changopj

# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com

# 최신 이미지 pull 및 실행
docker-compose pull
docker-compose up -d
docker image prune -f
