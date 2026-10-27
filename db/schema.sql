-- ========================================================================
-- OmniServe Multi-Service On-Demand Super App
-- Production MySQL Schema & Seed Data
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `omniserve_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `omniserve_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Customers, Providers, Admins)
DROP TABLE IF EXISTS `order_reviews`;
DROP TABLE IF EXISTS `order_timelines`;
DROP TABLE IF EXISTS `order_transport_details`;
DROP TABLE IF EXISTS `order_service_details`;
DROP TABLE IF EXISTS `order_delivery_details`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(64) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL DEFAULT 'Admin@12345',
  `role` ENUM('customer', 'provider', 'admin') NOT NULL DEFAULT 'customer',
  `avatar` TEXT,
  `address` TEXT,
  `wallet_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'pending', 'blocked') NOT NULL DEFAULT 'active',
  `provider_category` ENUM('delivery_courier', 'home_technician', 'cargo_driver') NULL,
  `service_skill` VARCHAR(255) NULL,
  `vehicle_type` VARCHAR(255) NULL,
  `rating` DECIMAL(3, 2) DEFAULT 5.00,
  `completed_jobs_count` INT NOT NULL DEFAULT 0,
  `is_online` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Home Services Catalog Table
CREATE TABLE `services` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `base_price` DECIMAL(10, 2) NOT NULL,
  `estimated_duration` VARCHAR(64) NOT NULL,
  `description` TEXT NOT NULL,
  `popular_issues` JSON NOT NULL,
  `icon` VARCHAR(64) NOT NULL DEFAULT 'Wrench',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_services_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Transport & Cargo Fleet Vehicles Table
CREATE TABLE `vehicles` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `capacity_kg` INT NOT NULL,
  `dimensions` VARCHAR(100) NOT NULL,
  `base_fare` DECIMAL(10, 2) NOT NULL,
  `per_km_rate` DECIMAL(10, 2) NOT NULL,
  `helper_rate` DECIMAL(10, 2) NOT NULL,
  `best_for` TEXT NOT NULL,
  `icon` VARCHAR(64) NOT NULL DEFAULT 'Truck',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Orders Master Table
CREATE TABLE `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `category` ENUM('custom_delivery', 'home_services', 'transport_cargo') NOT NULL,
  `customer_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(64) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `status` ENUM('pending', 'assigned', 'on_the_way', 'work_started', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  
  -- Financials & Pricing breakdown
  `pricing_base` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `pricing_service_delivery` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `pricing_item_budget` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `pricing_helper` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `pricing_platform` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `pricing_total` DECIMAL(12, 2) NOT NULL,
  
  `payment_method` ENUM('cod', 'jazzcash', 'easypaisa', 'bank_transfer', 'card') NOT NULL DEFAULT 'cod',
  `payment_status` ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
  
  `assigned_provider_id` VARCHAR(64) NULL,
  `assigned_provider_name` VARCHAR(150) NULL,
  `assigned_provider_phone` VARCHAR(64) NULL,
  `assigned_provider_avatar` TEXT NULL,
  `assigned_provider_rating` DECIMAL(3, 2) DEFAULT 5.00,
  
  `eta_minutes` INT NULL,
  `current_step_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_provider` FOREIGN KEY (`assigned_provider_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_category` (`category`),
  INDEX `idx_orders_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Sub-table: Custom Delivery Details
CREATE TABLE `order_delivery_details` (
  `order_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `item_name` TEXT NOT NULL,
  `estimated_budget` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `store_name` VARCHAR(255) NOT NULL,
  `pickup_address` TEXT NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `notes` TEXT NULL,
  `is_urgent` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_delivery_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Sub-table: Home Services Details
CREATE TABLE `order_service_details` (
  `order_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `service_id` VARCHAR(64) NOT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `issue_description` TEXT NOT NULL,
  `selected_issues` JSON NOT NULL,
  `scheduled_date` VARCHAR(100) NOT NULL,
  `scheduled_time_slot` VARCHAR(100) NOT NULL,
  `service_address` TEXT NOT NULL,
  CONSTRAINT `fk_service_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_service_cat` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Sub-table: Transport Cargo Details
CREATE TABLE `order_transport_details` (
  `order_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `vehicle_id` VARCHAR(64) NOT NULL,
  `vehicle_name` VARCHAR(150) NOT NULL,
  `pickup_location` TEXT NOT NULL,
  `dropoff_location` TEXT NOT NULL,
  `estimated_distance_km` DECIMAL(8, 2) NOT NULL,
  `cargo_description` TEXT NOT NULL,
  `load_weight_kg` INT NOT NULL,
  `needs_helper` TINYINT(1) NOT NULL DEFAULT 0,
  `helper_count` INT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_transport_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transport_veh` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Order Status Audit Timelines
CREATE TABLE `order_timelines` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `timestamp_str` VARCHAR(64) NOT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_timeline_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  INDEX `idx_timeline_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Order Ratings and Reviews
CREATE TABLE `order_reviews` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL UNIQUE,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NOT NULL,
  `tags` JSON NULL,
  `reviewed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- INITIAL SEED DATA
-- ========================================================================

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `avatar`, `address`, `wallet_balance`, `status`, `provider_category`, `service_skill`, `vehicle_type`, `rating`, `completed_jobs_count`, `is_online`) VALUES
('usr-admin-1', 'Super Administrator', 'admin@omniserve.com', '+92 300 0009988', 'Admin@12345', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'Headquarters, Blue Area, Islamabad', 150000.00, 'active', NULL, NULL, NULL, 5.00, 0, 1);

INSERT INTO `services` (`id`, `name`, `category`, `base_price`, `estimated_duration`, `description`, `popular_issues`, `icon`, `is_active`) VALUES
('srv-ac-repair', 'AC Master Service & Repair', 'HVAC & Cooling', 1800.00, '60 - 90 mins', 'Comprehensive chemical wash, filter purification, refrigerant leak detection, and airflow optimization.', '["Not cooling properly", "Water leakage / dripping", "Gas refill required", "Strange noise / fan vibration", "Master chemical wash"]', 'Fan', 1),
('srv-electrician', 'Certified Electrician', 'Electrical Work', 1200.00, '45 - 60 mins', 'Short circuit diagnosis, DB breaker replacement, UPS & inverter installation, and smart switch wiring.', '["Circuit breaker tripping", "Socket / switch sparked", "Ceiling fan installation", "UPS inverter bypass wiring", "Full house wiring check"]', 'Zap', 1),
('srv-plumbing', 'Emergency Plumbing Solutions', 'Sanitary & Water', 1400.00, '45 - 90 mins', 'Water pump repair, high-pressure pipe leak fixing, sanitary fittings, geyser installation, and drain unclogging.', '["Water pump not pulling", "Underground pipe leak", "Blocked kitchen / bathroom drain", "Geyser thermostat replacement", "Mixer tap fixing"]', 'Wrench', 1),
('srv-cleaning', 'Deep Home & Sofa Cleaning', 'Sanitization & Cleaning', 2800.00, '2 - 3 hours', 'Professional steam extraction cleaning for sofas, carpets, kitchen degreasing, and complete floor sanitization.', '["5-seater sofa shampooing", "Deep kitchen degreasing", "Washroom descaling & polish", "Full apartment move-in clean", "Mattress allergen removal"]', 'Sparkles', 1),
('srv-appliances', 'Home Appliance Doctor', 'Major Appliances', 1600.00, '60 mins', 'Repair for refrigerators, automatic washing machines, microwave ovens, and water dispensers.', '["Refrigerator not freezing", "Washing machine spin error", "Microwave not heating", "Dispenser cooling stopped"]', 'Cpu', 1),
('srv-carpentry', 'Woodwork & Locksmith', 'Carpentry', 1300.00, '60 mins', 'Door lock replacement, wardrobe sliding hinge repairs, furniture assembly, and wooden polish touchups.', '["Door lock jammed", "Cabinet hinge loose", "IKEA/Flatpack furniture assembly", "Bed frame reinforcement"]', 'Hammer', 1);

INSERT INTO `vehicles` (`id`, `name`, `capacity_kg`, `dimensions`, `base_fare`, `per_km_rate`, `helper_rate`, `best_for`, `icon`, `is_active`) VALUES
('veh-loader-rickshaw', 'Cargo Auto Rickshaw (3-Wheeler)', 350, '5ft x 3.5ft bed', 650.00, 45.00, 400.00, 'Boxes, cartons, small appliances, single mattress, market deliveries', 'Truck', 1),
('veh-mini-pickup', 'Mini Pickup (Suzuki Bolan / Ravi)', 850, '7ft x 4.5ft open bed', 1200.00, 75.00, 500.00, 'Refrigerators, washing machines, sofas, office chairs, 1-room shifting', 'Truck', 1),
('veh-standard-van', 'Standard 1-Ton Cargo Van / Shehzore', 1800, '10ft x 5.5ft covered/open', 2400.00, 110.00, 650.00, 'Full 1-2 BHK house shifting, bulky furniture, industrial inventory', 'Truck', 1),
('veh-flatbed-truck', 'Heavy Flatbed Truck (14-Foot)', 4500, '14ft x 7ft commercial chassis', 4800.00, 160.00, 800.00, 'Commercial cargo, construction materials, factory goods, full villa moves', 'Truck', 1);

-- Fresh database initialized with Super Admin and full service/fleet catalogs.
-- Orders will be placed by real customers and fulfilled by admin-created providers.
