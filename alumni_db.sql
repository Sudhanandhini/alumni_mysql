-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 30, 2026 at 01:25 PM
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
-- Database: `alumni_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `alumni`
--

CREATE TABLE `alumni` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `batch` varchar(10) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `institution` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `current_status` enum('Employed','Self-Employed','Studying','Not Working') DEFAULT NULL,
  `organization_name` varchar(200) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `work_location` varchar(100) DEFAULT NULL,
  `experience_years` varchar(10) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `higher_education` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `attended_program` varchar(50) DEFAULT NULL,
  `program_type` varchar(20) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `enrollment_number` varchar(100) DEFAULT NULL,
  `completion_year` varchar(10) DEFAULT NULL,
  `functional_area` varchar(255) DEFAULT NULL,
  `employment_type` varchar(100) DEFAULT NULL,
  `seniority_level` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `work_city` varchar(100) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `parent_name` varchar(255) DEFAULT NULL,
  `ug_college` varchar(255) DEFAULT NULL,
  `pg_college` varchar(255) DEFAULT NULL,
  `doctorate_name` varchar(255) DEFAULT NULL,
  `social_links` text DEFAULT NULL,
  `show_contact` tinyint(1) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alumni`
--

INSERT INTO `alumni` (`id`, `name`, `username`, `password`, `email`, `phone`, `gender`, `dob`, `batch`, `department`, `institution`, `address`, `photo`, `linkedin`, `bio`, `current_status`, `organization_name`, `designation`, `industry`, `work_location`, `experience_years`, `skills`, `achievements`, `higher_education`, `created_at`, `updated_at`, `approval_status`, `attended_program`, `program_type`, `facebook`, `enrollment_number`, `completion_year`, `functional_area`, `employment_type`, `seniority_level`, `country`, `city`, `education_level`, `work_city`, `is_deleted`, `parent_name`, `ug_college`, `pg_college`, `doctorate_name`, `social_links`, `show_contact`, `is_featured`) VALUES
(23, 'sudhanandhini', 'Sudha', '$2b$10$EYALghtAFifIaUpMpfHNpO4t9dPJVAn2P2LsPvUd2jQ5CtcPZMIG.', 'sudha@gmail.com', '9863257410', 'Female', '2012-06-20', '2020', 'Engineering & Technology', 'engineering colllege', 'Bangalore', '/uploads/1771579108154-233214932.png', NULL, NULL, 'Self-Employed', 'Zara', 'Full Stack Developer', 'Information Technology', 'Bangalore', '2', NULL, NULL, 'SMA govt school', '2026-02-20 09:18:28', '2026-02-23 05:12:50', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, 0, 1),
(24, 'kumar', 'Kumar', '$2b$10$fusT.60LMIN22agJ5H0i/.N3.vG3UHgOHzGc6khZP6bax0kMz8/ZS', 'kumar@gmail.com', '9875632541', 'Male', '1999-02-12', '2025', 'Engineering & Technology', 'engineering colllege', 'Bangalore', '/uploads/1771580329931-622420170.jpg', NULL, NULL, 'Employed', 'Zara', 'Full Stack Developer', 'Information Technology', 'Bangalore', '1', NULL, NULL, 'SMA Govt School', '2026-02-20 09:38:50', '2026-04-23 11:21:31', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, 0, 1),
(25, 'kala Subramanian', 'kala', '$2b$10$hysLjNmSWgJsgXZxyG.NmuO9zTFOqW2lrUBxsLyvgu68lsuyXWWZG', 'kala@gmail.com', '+919875632541', 'Male', '1999-02-11', '2025', 'Engineering & Technology', 'engineering colllege', 'Bangalore', '/uploads/1771580649485-429300804.jpg', NULL, 'good', 'Self-Employed', 'Zara', 'Full Stack Developer', 'Information Technology', 'Bangalore', '2', 'react', NULL, 'Engineering & Technology', '2026-02-20 09:44:09', '2026-04-23 11:21:35', 'approved', 'Class 9', 'alumni', NULL, '7894', '2025', NULL, NULL, NULL, 'Bangalore', NULL, 'Engineering & Technology', NULL, 1, 'surya', NULL, NULL, NULL, '[]', 0, 1),
(26, 'Ravi Mani', 'ravi', '$2b$10$7l10DXd/WJkuFVWu/lGOZ.LUpHq9tC23DapLfc1.a4EBCakjQHkWO', 'ravi@gmail.com', '+919863897415', 'Male', '1999-12-05', '2024', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'engineering colllege', 'Bankok, thailand', '/uploads/1771583301594-780906866.png', 'https://embassypublicschool.edu.in/events/', 'good', 'Self-Employed', 'Zara', 'Full Stack Developer', 'Finance & Banking', 'South Africa', '3', 'react', NULL, 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', '2026-02-20 10:28:21', '2026-02-23 04:50:11', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(27, 'mangai ravi', 'mangai', '$2b$10$q7EoEIaoFRKRnJQ11HldQ.GqO7.UcimUCHybMmL2x8YlQEUH0.Owu', 'mangai@gmial.com', '+919863257415', 'Female', '2026-03-04', '2020', 'Postgraduate (MBA/M.Tech/M.Sc)', 'engineering colllege', 'Delhi, India', '/uploads/1771584196999-813199428.jpg', NULL, 'react', 'Employed', 'Zara', 'web devloper', 'Finance & Banking', 'United States', NULL, 'react', NULL, 'Postgraduate (MBA/M.Tech/M.Sc)', '2026-02-20 10:43:17', '2026-02-20 10:55:10', 'approved', 'Class 8', 'alumni', NULL, 'eq2145', '2023', NULL, NULL, NULL, 'yale', 'Delhi', 'Postgraduate (MBA/M.Tech/M.Sc)', NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(28, 'Alar aninthavi', 'Alar', '$2b$10$sSqJyyzTVcIjXyniLibPQehbI6Bcd.ub6yx7Nui7CC9/Ifl4VnXkK', 'support@sunsys.in', '+918015544855', 'Female', '1998-12-12', '2022', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'engineering colllege', 'Google, Canada', '/uploads/1771585194171-171400446.png', NULL, 'react', 'Employed', 'TCS', 'Full Stack Developer', 'Information Technology', 'India', '2', 'react', NULL, 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', '2026-02-20 10:59:54', '2026-02-20 11:05:46', 'approved', 'Class 10', 'alumni', NULL, 'eq2145', '2025', 'Engineering / Technology', 'Full-time', 'Entry Level (0-2 years)', 'Canada', 'Google', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'chennai', 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(29, 'mahesh kumar', 'mahesh', '$2b$10$TrhxqL2Wyc2LZ1J3cJn5mOcyOt3klofqYsefjHKGQJxcJPkkzMpfm', 'maheshkumar.d.sunsys@gmail.com', '+919896687465', 'Male', '1995-09-08', '2014', 'Postgraduate (MBA/M.Tech/M.Sc)', 'engineering colllege', 'New York, United States', '/uploads/1771588020100-503502695.jpg', NULL, 'good', 'Employed', 'TCS', 'Full Stack Developer', 'Information Technology', 'India', '7', 'react', NULL, 'Postgraduate (MBA/M.Tech/M.Sc)', '2026-02-20 11:47:00', '2026-02-20 11:48:42', 'approved', 'Class 9', 'alumni', NULL, 'eq2145', '2018', 'Engineering / Technology', 'Full-time', 'Mid-level (5-8 years)', 'United States', 'New York', 'Postgraduate (MBA/M.Tech/M.Sc)', 'chennai', 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(30, 'Suji Kumar', 'suji', '$2b$10$VOBWiPQRNAvm.Zto2sMwT.pj3f/anUG/4BwUPW3b1BH9wFQNQVdx6', 'suji@gmail.com', '+919865742315', 'Female', '1998-08-06', '2020', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'engineering colllege', 'Delhi, United States', '/uploads/1771821549977-37419595.jpg', NULL, 'good', 'Employed', 'TCS', 'Full Stack Developer', 'Information Technology', 'India', NULL, 'react', NULL, 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', '2026-02-23 04:39:10', '2026-02-23 04:52:02', 'approved', 'Class 9', 'alumni', NULL, 'eq2145', '2024', 'Engineering / Technology', 'Full-time', 'Entry Level (0-2 years)', 'United Kingdom', 'Paris', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'chennai', 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(31, 'rajesh raj', '', '', 'rajesh@gmail.com', '+918563214793', 'Male', '1999-03-11', '2022', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'engineering colllege', 'Delhi, India', '/uploads/1771822512634-382809433.png', NULL, 'good', 'Employed', 'Zara', 'Full Stack Developer', 'Finance & Banking', 'United States', NULL, 'react', 'react', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', '2026-02-23 04:55:12', '2026-02-23 04:56:18', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(32, 'raja kumar', 'raja', '$2b$10$SLyakiNDy.ew19cmoo9FKOr1i30cwl1cxZN9t1qGDCENA306br9oS', 'ravirwyturti@gmail.com', '+91587874652', 'Female', '1992-03-23', '2018', 'Class 11', 'engineering colllege', 'Bangalore, India', '/uploads/1771838022228-418188925.jpg', NULL, '6eay', 'Employed', 'TCS', 'Full Stack Developer', 'Finance & Banking', 'India', '9', 'react', NULL, 'Class 11', '2026-02-23 09:13:42', '2026-02-23 09:14:16', 'approved', 'Class 8', 'alumni', NULL, 'eq2145', '2019', 'Engineering / Technology', 'Part-time', 'Entry Level (0-2 years)', 'India', 'Bangalore', 'Class 11', 'chennai', 0, NULL, NULL, NULL, NULL, NULL, 0, 1),
(33, 'nandhini ravi', 'nandhini', '$2b$10$9xMhedwlWaPza6KiPyDZnep8nMCPKM1QDyoMCy74PeyKzGCV6Kvtq', 'sudhanandhini@sunsys.in', '+919863257419', 'Female', '1993-12-14', '2020', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'engineering colllege', 'Mumbai, United Kingdom', '/uploads/1771847592767-122159749.jpeg', NULL, 'react', 'Employed', 'TCS', 'Full Stack Developer', 'Finance & Banking', 'India', '3', 'react', NULL, 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', '2026-02-23 11:53:12', '2026-04-23 09:01:54', 'approved', 'Class 11', 'alumni', NULL, 'eq2145', '2024', 'Engineering / Technology', 'Part-time', 'Entry Level (0-2 years)', 'United Kingdom', 'Mumbai', 'Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'chennai', 0, NULL, NULL, NULL, NULL, NULL, 1, 1),
(37, 'google ravi', 'googleravi', '$2b$10$cnZZEhbCHvj.WikEGvZFcOk4xftgLgFgxvfJEnj8oDeQ7rosyTj6W', 'google@gmail.com', '+917896541258', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-24 11:26:01', '2026-04-21 07:15:06', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, 0, 1),
(38, 'mona suba', 'monasuba', '$2b$10$yG8q0EueoRvKPmPKpi63B.XYxmrOpxMhJJGR8TWQtdVzw18MpxDdy', 'mona@gmail.com', '+918745123698', 'Female', '2020-06-07', '2026', 'Class 12 (HSC/CBSE)', 'Kal school', NULL, '/uploads/1776755205688-454857512.jpg', NULL, 'testing', 'Employed', 'test', 'Full Stack Developer', 'Finance & Banking', 'newyork', '4', 'react', 'worker of the year', 'Class 12 (HSC/CBSE)', '2026-04-21 07:06:45', '2026-04-23 08:52:37', 'approved', 'Class 12', NULL, NULL, '7894', '2026', 'Sales & Business Development', 'Contract', 'Junior (2-5 years)', 'United States', NULL, 'Class 12 (HSC/CBSE)', 'newyork', 0, 'nagarajan', NULL, NULL, NULL, '[{\"platform\":\"Facebook\",\"url\":\"newyork\"},{\"platform\":\"LinkedIn\",\"url\":\"newyork\"},{\"platform\":\"GitHub\",\"url\":\"newyork\"}]', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `broadcast_messages`
--

CREATE TABLE `broadcast_messages` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `sent_count` int(11) DEFAULT 0,
  `failed_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attachment` varchar(500) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `broadcast_messages`
--

INSERT INTO `broadcast_messages` (`id`, `subject`, `message`, `sent_count`, `failed_count`, `created_at`, `updated_at`, `attachment`, `attachment_name`) VALUES
(1, 'happy anniversary testing', ' Hi sir, testing  second time', 11, 0, '2026-04-21 06:24:53', '2026-04-21 06:25:32', NULL, NULL),
(2, 'testing', 'hi, testing for image', 11, 0, '2026-04-21 06:52:04', '2026-04-21 06:52:04', '/uploads/1776754249119-477405218.jpg', 'bgnew5.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'other',
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `event_date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `category`, `description`, `image`, `event_date`, `location`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 'Alumni Meet/Ideathon 2019', 'reunion', 'Dear friends,\r\n\r\nIt\'s our privilege to invite you for the Alumni Meet, a home coming celebration,being organized on Saturday, 16thFebruary 2019at BITM campus. We are expecting Alumni of all batches to participate in the meet. Since many of you have been away from this place for many years, it will be wonderful to see old friends after long time and foster new ties as well.\r\n\r\nIt\'s a great opportunity to interact with your batch mates and relish & refresh your past memories. We want you to visit the campus, appreciate the growth, and discuss about the future course of action.\r\n\r\nWe are delighted to inform; College has setup incubation / startup centre namely “BRICS” (BITM RESEARCH & INCUBATION COMMUNE FOR STARTUP).\r\n\r\nWe are inviting students, faculty members to submit Ideas by identifying Regional/ Local problems that can be solved with Information, Communication & Technology problems related to Agriculture, Environment, Health, Electricity & Civic Amenities etc. are broad areas and limited too.\r\n\r\nThe above areas can be addressed by Students/Alumni and Faculty members from any Engineering / Management Programs. The last date for submission of Idea is 11th of Feb2019.\r\n\r\nThe best Ideas are reviewed by the experts and the top 10 Ideas will be funded Rs: 3,00,000/- per IDEA.\r\n\r\nTo apprise you in brief, the event will begin with registration at 9:30 am followed by an interactive session. Detailed schedule would be mailed to you soon.\r\n\r\nYou are our valued ambassador and we would want your continued association with BITM. We hope for a positive response.\r\n\r\nWe are waiting for your confirmation, and participation in the meet.\r\n\r\nDr YashvanthBhupal\r\nDirector\r\nPresident BITM Alumni Association', '/uploads/1776929450871-234626074.jpeg', '2026-05-07 03:00:00', 'Vijayanagar', 1, '2026-04-23 07:30:50', '2026-04-23 07:39:07'),
(2, 'Webinar - 2026', 'webinar', '\r\nGreetings from BITM-AA.\r\nA webinar is organized for students on the\r\n\r\n\r\nDate: 08/08/2020(Saturday) Timings:11:00 am onwards.\r\n\r\nRegistration link:\r\n\r\nhttps://cc.vaave.com/e/bitm-webinar-1\r\n\r\nSpeaker:\r\nMr.Abhilash Varma\r\n\r\nPlacement trainer and founder of Chanakya', '/uploads/1776930099368-816137380.jpg', '2026-06-13 13:00:00', 'Vijayanagar', 1, '2026-04-23 07:41:39', '2026-04-23 07:41:39'),
(3, 'Silver Jubilee', 'campus_event', 'Dear BITM Alumni,\r\n\r\nThe BITM Annual Alumni Meet 2016 will be held at Hotel Capitol, Bangalore on 30th January 2016.\r\n\r\nPlease watch this space for the updates on schedule and further details.\r\n\r\nPlease confirm your participation by clicking on RSVP. Inform your batchmates and friends too and help make this meet a grand success.\r\n\r\nBest Regards\r\nBITM Alumni Association', '/uploads/1776930262519-550166894.jpg', '2026-08-18 16:30:00', 'Vijayanagar', 1, '2026-04-23 07:44:22', '2026-04-23 07:44:22'),
(4, 'Hackathon 2025', 'hackathon', 'Dear friends,\r\n\r\nIt\'s our privilege to invite you for the Alumni Meet, a home coming celebration,being organized on Saturday, 16thFebruary 2019at BITM campus. We are expecting Alumni of all batches to participate in the meet. Since many of you have been away from this place for many years, it will be wonderful to see old friends after long time and foster new ties as well.\r\n\r\nIt\'s a great opportunity to interact with your batch mates and relish & refresh your past memories. We want you to visit the campus, appreciate the growth, and discuss about the future course of action.\r\n\r\nWe are delighted to inform; College has setup incubation / startup centre namely “BRICS” (BITM RESEARCH & INCUBATION COMMUNE FOR STARTUP).', '/uploads/1776930337471-172407799.jpeg', '2026-03-10 07:10:00', 'Vijayanagar', 1, '2026-04-23 07:45:37', '2026-04-23 07:45:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `place` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `place`, `created_at`) VALUES
(8, 'sudhanandhini', 'Sudha', '$2b$10$EYALghtAFifIaUpMpfHNpO4t9dPJVAn2P2LsPvUd2jQ5CtcPZMIG.', 'Bangalore', '2026-02-20 09:18:28'),
(9, 'kumar', 'Kumar', '$2b$10$fusT.60LMIN22agJ5H0i/.N3.vG3UHgOHzGc6khZP6bax0kMz8/ZS', 'Bangalore', '2026-02-20 09:38:50'),
(10, 'kala', 'kala', '$2b$10$hysLjNmSWgJsgXZxyG.NmuO9zTFOqW2lrUBxsLyvgu68lsuyXWWZG', 'Bangalore', '2026-02-20 09:44:09'),
(11, 'Ravi Mani', 'ravi', '$2b$10$7l10DXd/WJkuFVWu/lGOZ.LUpHq9tC23DapLfc1.a4EBCakjQHkWO', 'Bankok, thailand', '2026-02-20 10:28:21'),
(12, 'mangai ravi', 'mangai', '$2b$10$q7EoEIaoFRKRnJQ11HldQ.GqO7.UcimUCHybMmL2x8YlQEUH0.Owu', 'Delhi, yale', '2026-02-20 10:43:17'),
(13, 'Alar aninthavi', 'Alar', '$2b$10$sSqJyyzTVcIjXyniLibPQehbI6Bcd.ub6yx7Nui7CC9/Ifl4VnXkK', 'Google, Canada', '2026-02-20 10:59:54'),
(14, 'mahesh kumar', 'mahesh', '$2b$10$TrhxqL2Wyc2LZ1J3cJn5mOcyOt3klofqYsefjHKGQJxcJPkkzMpfm', 'New York, United States', '2026-02-20 11:47:00'),
(15, 'Suji Kumar', 'suji', '$2b$10$VOBWiPQRNAvm.Zto2sMwT.pj3f/anUG/4BwUPW3b1BH9wFQNQVdx6', 'Paris, United Kingdom', '2026-02-23 04:39:10'),
(16, 'raja kumar', 'raja', '$2b$10$SLyakiNDy.ew19cmoo9FKOr1i30cwl1cxZN9t1qGDCENA306br9oS', 'Bangalore, India', '2026-02-23 09:13:42'),
(17, 'nandhini ravi', 'nandhini', '$2b$10$9xMhedwlWaPza6KiPyDZnep8nMCPKM1QDyoMCy74PeyKzGCV6Kvtq', 'Mumbai, United Kingdom', '2026-02-23 11:53:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alumni`
--
ALTER TABLE `alumni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_batch` (`batch`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_current_status` (`current_status`);

--
-- Indexes for table `broadcast_messages`
--
ALTER TABLE `broadcast_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alumni`
--
ALTER TABLE `alumni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `broadcast_messages`
--
ALTER TABLE `broadcast_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
