#!/bin/bash

# 1. 작업 디렉토리로 이동
cd /home/ubuntu/changopj

# 2. .env 파일에서 변수 읽어오기 (안전장치)
# GitHub Actions에서 생성한 .env 파일에 AWS_ACCOUNT_ID가 있으므로 이를 환경변수로 내보냅니다.
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 3. ECR 로그인
# 변수가 비어있을 경우를 대비해 ${AWS_ACCOUNT_ID}를 확실히 참조하게 합니다.
aws ecr get-login-password --region ap-northeast-2 | sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com

# 4. 최신 이미지 pull 및 실행
# sudo 권한 문제가 생길 수 있으므로 안전하게 sudo를 붙이거나 유저 권한 확인이 필요합니다.
sudo docker-compose pull
sudo docker-compose up -d

# 5. 미사용 이미지 정리 (용량 확보)
sudo docker image prune -f
