-- --------------------------------------------------------
-- 호스트:                          
-- 서버 버전:                        12.1.2-MariaDB - MariaDB Server
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- restock_db 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `restock_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `restock_db`;

-- 테이블 restock_db.disposal_services 구조 내보내기
CREATE TABLE IF NOT EXISTS `disposal_services` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='외부서비스 연동';

-- 테이블 데이터 restock_db.disposal_services:~5 rows (대략적) 내보내기
INSERT INTO `disposal_services` (`id`, `name`, `type`, `url`, `user_id`) VALUES
	(4, '네이버', '판매', 'https://www.naver.com/', ''),
	(5, '중고나라', '판매', 'https://web.joongna.com/', ''),
	(7, '중고나라', '판매', 'https://web.joongna.com/', '109989712308459408433'),
	(11, '네이버', '나눔', 'https://www.naver.com', 'chl4890620123@gmail.com'),
	(12, '중고나라', '판매', 'https://web.joongna.com', 'chl4890620123@gmail.com');

-- 테이블 restock_db.product 구조 내보내기
CREATE TABLE IF NOT EXISTS `product` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `weight` varchar(255) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `time_type` varchar(255) DEFAULT NULL,
  `reference_date` varchar(255) DEFAULT NULL,
  `expiry_date` varchar(255) DEFAULT NULL,
  `auto_delete` tinyint(1) NOT NULL DEFAULT 0,
  `service_name` varchar(255) DEFAULT NULL,
  `custom_url` varchar(255) DEFAULT NULL,
  `qr_code_data` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `service_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_product_qr_code` (`qr_code_data`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='개개인 물건 하나';

-- 테이블 데이터 restock_db.product:~9 rows (대략적) 내보내기
INSERT INTO `product` (`id`, `name`, `category`, `location`, `description`, `size`, `weight`, `stock`, `status`, `image_url`, `time_type`, `reference_date`, `expiry_date`, `auto_delete`, `service_name`, `custom_url`, `qr_code_data`, `user_id`, `service_type`) VALUES
	(20, '당근', '채소', '냉장고', '없는뎀', 'MEDIUM', '0', 1, 'AVAILABLE', '/uploads/2dd1b7b8-0f29-4947-b1f5-9bcd9a7f0e5b_product.jpg', 'EXPIRATION', '2026-03-28', '2026-04-11', 0, '네이버', 'https://www.naver.com/', 'RS-1774670487153', '', NULL),
	(22, '당근', '채소', '냉장고', '', 'MEDIUM', '0', 1, '정상', '/uploads/98faf191-2008-4904-b1ee-3d8e7d33ae63_update.jpg', 'EXPIRATION', '2026-03-28', '2026-04-10', 1, '중고나라', 'https://web.joongna.com/', 'RS-1774676986304', '109989712308459408433', NULL),
	(25, '6개월정도 유지', '오늘일정', '', '작업물 내용 보낼것', 'MEDIUM', '0', 1, '정상', '/uploads/ea72cfae-02d7-4cc8-9e57-8fe30ebfda77_product_1774747880622.jpg', 'AGING', '2026-03-29', '2026-09-26', 0, '메일쓰기', 'https://m.mail.daum.net/', 'RS-1774747840415', 'chl4890620123@gmail.com', '직접입력'),
	(27, '떡볶이', '레시피', '', '떡볶이떡 2컵\n물 대파 1/2대\n통깨 약간\n[양념]\n고추장 2T\n고추가루 1.5T\n간장 2T\n설탕3T', 'MEDIUM', '0', 1, '정상', '/uploads/42564500-9e43-4b25-952a-bfa5e7c83391_product_1774831639162.jpg', 'AGING', '2026-03-30', '2026-03-31', 0, '떡볶이레시피', 'https://youtu.be/Luo02nO3gXU?si=jG6SBJW4VD8LUzGv', 'RS-1774831495841', 'chl4890620123@gmail.com', NULL),
	(28, '실손보험', '보험', '', '주기적인 확인필요', 'MEDIUM', '0', 1, '정상', '/uploads/68322a0a-2a54-41f9-be62-ed2c187c44d5_product_1774831908733.jpg', 'AGING', '2026-03-30', '2027-03-30', 0, '삼성생명', 'https://direct.samsunglife.com', 'RS-1774831822245', 'chl4890620123@gmail.com', NULL),
	(29, '생일', '기념일', '', '내 생일', 'MEDIUM', '0', 1, '정상', '/uploads/d5b7e446-3fed-492d-9bf0-b2dbe4d7d27a_product_1774832026101.jpg', 'AGING', '2026-11-01', '2026-11-07', 0, '쿠팡', 'https://www.coupang.com/', 'RS-1774832013898', 'chl4890620123@gmail.com', NULL),
	(30, '당근', '채소', '', '당근구매 10일후에', 'MEDIUM', '0', 1, '정상', '/uploads/f514d7a8-c75a-4cc0-b934-fcb3407d3210_product_1774832577157.jpg', 'AGING', '2026-03-30', '2026-04-09', 0, '쿠팡', 'https://www.coupang.com/', 'RS-1774832509316', 'chl4890620123@gmail.com', NULL),
	(31, '매실주', '담금주', '창고1', '', 'MEDIUM', '0', 1, '정상', '/uploads/b899a4e9-2a60-4d39-aa77-f8c6a39e270c_product_1774832702652.jpg', 'AGING', '2026-03-30', '2026-07-08', 0, '일반', '', 'RS-1774832656267', 'chl4890620123@gmail.com', NULL),
	(32, '철근', '철강', '창고2', '철근유통기한이 40일이라 이후납품불가', 'MEDIUM', '0', 1, '파손', '/uploads/d0414a4b-9efb-4e7d-a8da-e4e1e099aa3e_product_1774832827205.jpg', 'AGING', '2026-03-30', '2026-05-09', 0, '일반', '', 'RS-1774832722614', 'chl4890620123@gmail.com', NULL);

-- 테이블 restock_db.products 구조 내보내기
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `custom_url` varchar(255) DEFAULT NULL,
  `expiry_date` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `qr_code_data` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `weight` varchar(255) DEFAULT NULL,
  `auto_delete` bit(1) NOT NULL,
  `description` text DEFAULT NULL,
  `reference_date` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `time_type` enum('EXPIRATION','AGING','SEASONAL') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='여러물건을 가져오는 로직';

-- 테이블 데이터 restock_db.products:~2 rows (대략적) 내보내기
INSERT INTO `products` (`id`, `category`, `created_at`, `custom_url`, `expiry_date`, `image_url`, `location`, `name`, `qr_code_data`, `size`, `stock`, `weight`, `auto_delete`, `description`, `reference_date`, `status`, `time_type`) VALUES
	(14, '카드', '2026-03-18 18:12:57.101911', 'https://www.naver.com/', '2025-12-08', '/uploads/d0b6ca46-540d-408e-959d-d601a43ad434.jpg', '가위', '네이버', 'RS-1773825163552', NULL, 1, NULL, b'0', '', '2026-03-18', '파손', 'AGING'),
	(15, '카드', '2026-03-20 10:20:26.140863', '', '2026-03-21', '/uploads/cf293410-a988-4fa4-ba50-bc1e0b511bdf.jpg', '가위', '카드', 'RS-1773969599840', NULL, 1, NULL, b'0', '', '2026-03-20', '정상', 'EXPIRATION');

-- 테이블 restock_db.stock_history 구조 내보내기
CREATE TABLE IF NOT EXISTS `stock_history` (
  `history_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `type` enum('IN','OUT','DISCARD') NOT NULL,
  `quantity` int(11) NOT NULL,
  `remarks` text DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`history_id`),
  KEY `fk_product` (`product_id`),
  CONSTRAINT `fk_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='입출고 로그';

-- 테이블 데이터 restock_db.stock_history:~0 rows (대략적) 내보내기

-- 테이블 restock_db.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='로그인';

-- 테이블 데이터 restock_db.users:~6 rows (대략적) 내보내기
INSERT INTO `users` (`id`, `password`, `role`, `username`, `name`) VALUES
	(1, '1234', 'ROLE_USER', '1234', NULL),
	(2, '12345', 'ROLE_USER', '12345', NULL),
	(3, '123456', 'ROLE_USER', '123456', NULL),
	(4, NULL, 'USER', 'chl4890620123@gmail.com', '최명헌'),
	(5, NULL, 'USER', 'momanyidennis72@gmail.com', 'DENNIS Momanyi'),
	(6, '1234789', 'ROLE_USER', '123456789', NULL);

-- 테이블 restock_db.user_categories 구조 내보내기
CREATE TABLE IF NOT EXISTS `user_categories` (
  `user_id` bigint(20) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  KEY `FKdqpxght56isds8smi1frxg0xo` (`user_id`),
  CONSTRAINT `FKdqpxght56isds8smi1frxg0xo` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='태그';

-- 테이블 데이터 restock_db.user_categories:~12 rows (대략적) 내보내기
INSERT INTO `user_categories` (`user_id`, `category_name`) VALUES
	(3, 'ㅇㄹ'),
	(1, 'ㅇ'),
	(4, '오늘일정'),
	(4, '레시피'),
	(4, '일기장'),
	(4, '보험'),
	(4, '기념일'),
	(4, '채소'),
	(4, '철강'),
	(4, '담금주'),
	(4, '잡동사니'),
	(4, '리스트');

-- 테이블 restock_db.user_locations 구조 내보내기
CREATE TABLE IF NOT EXISTS `user_locations` (
  `user_id` bigint(20) NOT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  KEY `FK890cc7fxm4q868bo3ka61nux2` (`user_id`),
  CONSTRAINT `FK890cc7fxm4q868bo3ka61nux2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='장소';

-- 테이블 데이터 restock_db.user_locations:~5 rows (대략적) 내보내기
INSERT INTO `user_locations` (`user_id`, `location_name`) VALUES
	(3, 'ㅇㄹ'),
	(1, 'ㅇ'),
	(4, '창고1'),
	(4, '창고2'),
	(4, '리스트');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
