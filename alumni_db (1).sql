-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 19, 2025 at 10:52 AM
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
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `dob` date NOT NULL,
  `batch` varchar(10) NOT NULL,
  `department` varchar(100) NOT NULL,
  `institution` varchar(200) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `current_status` enum('Employed','Self-Employed','Studying') NOT NULL,
  `organization_name` varchar(200) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `work_location` varchar(100) DEFAULT NULL,
  `experience_years` varchar(10) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `higher_education` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alumni`
--

INSERT INTO `alumni` (`id`, `name`, `username`, `password`, `email`, `phone`, `gender`, `dob`, `batch`, `department`, `institution`, `address`, `photo`, `linkedin`, `bio`, `current_status`, `organization_name`, `designation`, `industry`, `work_location`, `experience_years`, `skills`, `achievements`, `higher_education`, `created_at`, `updated_at`) VALUES
(7, 'mahesh', '', '$2b$10$NNZCcHvu63axXVjbQUBnPeESS3THv0n2I6ImBXqAhQl7JnDDzSPe6', 'sudhanandhini@sunsys.in', '01213457899', 'Male', '2025-10-24', '2016', 'Law', 'engineering colllege', 'zXZXZX', '/uploads/1760178918888-134500138.png', '', '', 'Employed', 'tata', 'web designer', 'Education', 'Bangalore', '8', '', '', 'dgsgsg', '2025-10-11 10:35:18', '2025-11-12 08:03:26'),
(9, 'kumar', '', '', 'sudhanandhini@sunsys.in', '01213457899', 'Female', '2025-10-24', '2021', 'Medicine', 'engineering colllege', 'zXZXZX', '/uploads/1760347678772-612601095.png', '', '', 'Self-Employed', 'tata', 'web designer', 'Manufacturing', 'Bangalore', '4', '', '', '', '2025-10-13 09:27:58', '2025-10-13 09:27:58'),
(10, 'Nandhini', '', '', 'sudhanandhini@sunsys.in', '01213457899', 'Male', '2025-10-09', '2012', 'Medicine', 'engineering colllege', 'zXZXZX', '/uploads/1760353480045-627841069.png', '', '', 'Self-Employed', 'tata', 'graphic designer', 'Education', 'Kolkata', '14', '', '', '', '2025-10-13 11:04:40', '2025-10-13 11:05:30'),
(11, 'ravi', '', '$2b$10$Fs8maoZ3nOSmWR30zsPdoeFHgR0Elq7vUe1vZCscHHV0v.KllHnXG', 'support@sunsys.in', '9865321478', 'Male', '2025-10-16', '2019', 'Medicine', 'test', 'test', '/uploads/1760594542250-971616235.jpeg', '', '', 'Self-Employed', 'ibm', 'web devloper', 'Healthcare', 'Hyderabad', '5', '', '', 'test', '2025-10-16 06:01:52', '2025-11-12 07:38:57'),
(12, 'sudhanandhini', 'sudha-1', '$2b$10$c0J1l.uarooWVC/Viq35GOedw4eJ/BUTOhcgl.EZB0nb.z/E9qUcO', 'sudha@gmail.com', '9865321489', 'Female', '1992-11-12', '2002', 'Medicine', 'test', 'test', '/uploads/1760596050016-881538992.jpeg', '', '', 'Employed', 'ibm', 'web devloper', 'Healthcare', 'Pune', '2', '', '', 'test', '2025-10-16 06:27:30', '2025-10-16 06:27:30'),
(13, 'rega kumar', 'rega', '$2b$10$rWwg/93b8Wb6mai3FRWPauWRwKQmftwmim8/o/Sihsqmwxusd3lwi', 'rega@gmail.com', '7896542315', 'Male', '2010-06-16', '2004', 'Medicine', 'test', 'test', '/uploads/1760596826470-286003566.jpeg', '', '', 'Studying', 'ibm', 'web devloper', 'Retail', 'Delhi', '2', '', '', 'test', '2025-10-16 06:40:26', '2025-10-16 06:40:26'),
(14, 'vikki', '', '', 'vikki@gmail.com', '875412369', 'Male', '2025-10-15', '2012', 'Economics & Commerce', 'test', 'test', '/uploads/1760600963165-769513705.jpeg', '', '', 'Employed', 'infosys', 'full stack developer', 'Information Technology', 'Chennai', '2', '', '', 'test', '2025-10-16 07:49:23', '2025-10-16 07:49:23'),
(15, 'mangai', 'mangai', '$2b$10$0MS3rMC6cvWIZl2kHzX/CuDo99kWlc0LFxJL0x54jGN/kAdpq5e92', 'mangai@gmial.com', '9863257415', 'Female', '1999-07-13', '2019', 'Engineering & Technology', 'engineering colllege', 'chennai', '/uploads/1762933045148-810430995.jpg', '', '', 'Employed', 'Zara', 'data sciencist', 'Information Technology', 'Pune', '2', '', '', 'govet school', '2025-11-12 07:37:25', '2025-11-12 07:37:25'),
(16, 'alar', 'alar', '$2b$10$dUG16c28XiOi7AY4bsXUz.Q.KoDHEJedTQhj1BPI..IS8IPRaC7cm', 'alar@gmail.com', '9865789657', 'Female', '2013-06-08', '2022', 'Engineering & Technology', 'engineering colllege', '15, Third main road,', '/uploads/1762933809760-965552649.jpeg', '', '', 'Employed', 'Zara', 'data sciencist', 'Information Technology', 'Pune', '1', '', '', 'govt schol', '2025-11-12 07:50:09', '2025-11-12 07:50:09'),
(17, 'image', 'image', '$2b$10$dPABYXtjXlfaMW4isD/brOaGFpdE1xu3KeArQ9jhBc5T1XSKdGWuC', 'image123@gmail.com', '2365897456', 'Male', '2025-10-29', '2022', 'Journalism, Media, PR & Communication', 'engineering colllege', '15, Third main road,', '/uploads/1762946733022-196768740.png', NULL, NULL, 'Self-Employed', 'Zara', 'data sciencist', 'Healthcare', 'Delhi', '3', NULL, NULL, 'school', '2025-11-12 08:01:58', '2025-11-12 11:25:33');

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
(1, 'sudha', 'sudha', '$2b$10$duYGW2iCKkwEiV7xTlgGBux9eel8lYnfeQT99UzbkIDYImcULFBxa', 'bangalore', '2025-10-13 11:57:09'),
(2, 'nandhini', 'nandhini', '$2b$10$2VfCpnJmMEX0XvKjs9JpBe5Gfjy6TdON3OakdVeyN0YYuWDEBbuUq', 'bangalore', '2025-10-13 12:13:45'),
(3, 'ravi', 'ravi', '$2b$10$wfoqpC2TiaSptM0V4TpC3eV4QxblR7dmwAPN8KeZLJVIhqs0/XEZq', 'pune', '2025-10-16 06:02:56'),
(4, 'kala', 'kala', '$2b$10$j0vPSwhxOCtqYF.FKViWy.C0bMo7yel1707v1grSJ950V0sDXrqvu', 'thoothukudi', '2025-10-16 07:32:22');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
