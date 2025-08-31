-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2025 at 10:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `visionsort_db2`
--

-- --------------------------------------------------------

--
-- Table structure for table `bin_status`
--

CREATE TABLE `bin_status` (
  `id` varchar(20) NOT NULL,
  `location` varchar(100) NOT NULL,
  `last_updated` datetime NOT NULL,
  `coords_lat` decimal(10,6) DEFAULT NULL,
  `coords_long` decimal(10,6) DEFAULT NULL,
  `plastic_status` enum('full','not_full') DEFAULT 'not_full',
  `recycle_status` enum('full','not_full') DEFAULT 'not_full',
  `general_status` enum('full','not_full') DEFAULT 'not_full'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bin_status`
--

INSERT INTO `bin_status` (`id`, `location`, `last_updated`, `coords_lat`, `coords_long`, `plastic_status`, `recycle_status`, `general_status`) VALUES
('BIN-001', 'โรงอาหาร', '2025-08-30 19:36:14', 15.680800, 104.101000, 'full', 'not_full', 'full'),
('BIN-002', 'อาคาร 5', '2025-08-30 19:36:14', 15.681200, 104.101000, 'not_full', 'full', 'not_full'),
('BIN-003', 'สหกรณ์', '2025-08-30 19:36:14', 15.680600, 104.102000, 'not_full', 'full', 'not_full');

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_kpi`
--

CREATE TABLE `dashboard_kpi` (
  `id` int(11) NOT NULL,
  `todayCount` int(11) NOT NULL,
  `aiAccuracy` decimal(5,2) NOT NULL,
  `totalCount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dashboard_kpi`
--

INSERT INTO `dashboard_kpi` (`id`, `todayCount`, `aiAccuracy`, `totalCount`) VALUES
(1, 123, 85.70, 456);

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_last7days`
--

CREATE TABLE `dashboard_last7days` (
  `id` int(11) NOT NULL,
  `data_date` date NOT NULL,
  `data_value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dashboard_last7days`
--

INSERT INTO `dashboard_last7days` (`id`, `data_date`, `data_value`) VALUES
(1, '2025-08-23', 10),
(2, '2025-08-24', 15),
(3, '2025-08-25', 12),
(4, '2025-08-26', 20),
(5, '2025-08-27', 18),
(6, '2025-08-28', 25),
(7, '2025-08-29', 23);

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_types`
--

CREATE TABLE `dashboard_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `type_count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dashboard_types`
--

INSERT INTO `dashboard_types` (`id`, `type_name`, `type_count`) VALUES
(0, 'อื่นๆ', 20),
(1, 'พลาสติก', 120),
(2, 'รีไซเคิล', 60),
(3, 'ทั่วไป', 20);

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `bin_id` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `bin_id`, `message`, `timestamp`) VALUES
(11, '21915', NULL, 'เทสฟีดแบ็ค', '2025-08-30 17:30:16'),
(12, '21915', NULL, 'test2', '2025-08-30 17:31:09'),
(13, '21915', NULL, 'เหนื่อยแล้วพี่จ๋าาา', '2025-08-30 18:01:37'),
(14, '21915', NULL, 'อยากนอน', '2025-08-30 18:02:42'),
(15, '21915', NULL, 'หิวข้าว', '2025-08-30 18:02:51'),
(16, '21785', 'BIN-003', 'binnn', '2025-08-30 20:06:51'),
(17, '21915', 'BIN-003', 'test', '2025-08-30 20:18:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('student','admin') NOT NULL DEFAULT 'student',
  `name` varchar(100) NOT NULL,
  `class` varchar(50) DEFAULT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `password`, `role`, `name`, `class`, `score`, `avatar`) VALUES
('21785', NULL, 'student', 'สมชาย ใจดี', 'ม.4/5', 0, '21785.jpg'),
('21915', NULL, 'student', 'ธนาธิป ไชยเดช', 'ม.6/6', 0, 'Thanathip.jpg'),
('admin', 'admin123', 'admin', 'ผู้ดูแลระบบ', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `waste_history`
--

CREATE TABLE `waste_history` (
  `id` int(11) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_history`
--

INSERT INTO `waste_history` (`id`, `user_id`, `type`, `date`, `time`, `score`) VALUES
(1, '21915', 'พลาสติก', '2025-08-28', '12:31:00', 5),
(2, '21785', 'ขวด', '2025-08-14', '08:15:00', 1),
(3, '21785', 'ขยะทั่วไป', '2025-08-14', '12:31:00', 1),
(4, '21915', 'รีไซเคิล', '2025-08-14', '09:41:00', 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bin_status`
--
ALTER TABLE `bin_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dashboard_kpi`
--
ALTER TABLE `dashboard_kpi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dashboard_last7days`
--
ALTER TABLE `dashboard_last7days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dashboard_types`
--
ALTER TABLE `dashboard_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_feedback_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `waste_history`
--
ALTER TABLE `waste_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_waste_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dashboard_last7days`
--
ALTER TABLE `dashboard_last7days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `dashboard_types`
--
ALTER TABLE `dashboard_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `waste_history`
--
ALTER TABLE `waste_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `waste_history`
--
ALTER TABLE `waste_history`
  ADD CONSTRAINT `fk_waste_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
