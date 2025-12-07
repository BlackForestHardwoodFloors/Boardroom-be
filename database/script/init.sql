CREATE DATABASE IF NOT EXISTS bids_db;

USE bids_db;

CREATE TABLE `organisation_profile` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `logo` BLOB,
    `company_name` VARCHAR(255) NOT NULL,
    `website` VARCHAR(255),
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(50) NOT NULL COMMENT 'Values should be USA States List',
    `country` VARCHAR(100) NOT NULL DEFAULT 'United States',
    `zip_code` VARCHAR(20) NOT NULL,
    `support_phone` VARCHAR(20) NOT NULL COMMENT 'It shows the country code. Keep default country code +1',
    `support_email` VARCHAR(255) NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE `organisation_profile` 
ADD UNIQUE `organisation_profile_company_name_unique`(`company_name`);

CREATE TABLE `titles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL,
    `organisation_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `departments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `organisation_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `departments_name_unique` (`name`, `organisation_id`)
);

CREATE TABLE `roles_and_permissions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `permissions` JSON,
    `organisation_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `roles_name_org_unique` (`name`, `organisation_id`)
);

CREATE TABLE `service_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `organisation_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `category_name_org_unique` (`name`, `organisation_id`)
);

CREATE TABLE `seasons` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `season` ENUM('Winter', 'Summer', 'Both') NOT NULL,
    `organisation_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `services` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `service_name` VARCHAR(255) NOT NULL,
    `category_id` BIGINT NOT NULL,
    `season_id` BIGINT NOT NULL,
    `organisation_id` BIGINT NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `service_name_org_unique` (`service_name`, `organisation_id`)
);

CREATE TABLE `clients` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `client_name` VARCHAR(255) NOT NULL,
    `website` VARCHAR(255),
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(50) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'United States',
    `zip_code` VARCHAR(20) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `type` ENUM('MANUFACTURING', 'CONSTRUCTION', 'TELECOMMUNICATIONS', 'FLEET OPERATORS') NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `clients_name_unique` (`client_name`)
);

CREATE TABLE `contacts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `client_id` BIGINT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(50) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'United States',
    `zip_code` VARCHAR(20) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `contact_email_unique` (`email`)
);

CREATE TABLE `sites` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `site_number` VARCHAR(50) NOT NULL,
    `shipping_service_address` TEXT NOT NULL,
    `contact_id` BIGINT NOT NULL,
    `client_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `site_number_client_unique` (`site_number`, `client_id`)
);

CREATE TABLE `units` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `unit_number` VARCHAR(50) NOT NULL,
    `contact_id` BIGINT NOT NULL,
    `client_id` BIGINT NOT NULL,
    `division` VARCHAR(100) NOT NULL,
    `frequency` INT NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'HOLD') NOT NULL DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unit_number_client_unique` (`unit_number`, `client_id`)
);

CREATE TABLE `vendor_accounts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `website` VARCHAR(255),
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `street` VARCHAR(255),
    `city` VARCHAR(100),
    `state` VARCHAR(50) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `zip_code` VARCHAR(20) NOT NULL,
    `operational_associate_id` BIGINT,
    `operational_manager_id` BIGINT,
    `sales_associate_id` BIGINT,
    `sales_manager_id` BIGINT,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `vendor_contact_email_unique` (`email`),
    FOREIGN KEY (`operational_associate_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`operational_manager_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`sales_associate_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`sales_manager_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `vendor_contacts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `vendor_account_id` BIGINT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `street` VARCHAR(255),
    `city` VARCHAR(100),
    `state` VARCHAR(50) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `zip_code` VARCHAR(20) NOT NULL,
    `portal_access` BOOLEAN NOT NULL DEFAULT FALSE,
    `operational_associate_id` BIGINT,
    `operational_manager_id` BIGINT,
    `sales_associate_id` BIGINT,
    `sales_manager_id` BIGINT,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `vendor_contact_email_unique` (`email`),
    FOREIGN KEY (`operational_associate_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`operational_manager_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`sales_associate_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`sales_manager_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`vendor_account_id`) REFERENCES `vendor_accounts` (`id`)
);

CREATE TABLE `vendor_compliance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `vendor_contact_id` BIGINT NOT NULL,
    `certification` BLOB NOT NULL,
    `expiry_date` DATE NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `sow` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `site_id` BIGINT NOT NULL,
    `contact_id` BIGINT NOT NULL,
    `client_id` BIGINT NOT NULL,
    `comments` TEXT,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `bids` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sow_id` BIGINT NOT NULL,
    `site_number` VARCHAR(50) NOT NULL,
    `site_location` VARCHAR(255) NOT NULL,
    `vendor_contact_id` BIGINT NOT NULL,
    `vendor_account_id` BIGINT NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `client_contracts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `contract_title` VARCHAR(255) NOT NULL,
    `vendor_contract_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `account_rep` VARCHAR(100) NOT NULL,
    `bid_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `vendor_contracts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `contract_title` VARCHAR(255) NOT NULL,
    `client_contract_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `account_rep` VARCHAR(100) NOT NULL,
    `bid_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `sow_subform` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sow_id` BIGINT NOT NULL,
    `service_requested` TEXT NOT NULL,
    `service_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `season_id` BIGINT NOT NULL,
    `comments` TEXT,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `bids_subform` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `bid_id` BIGINT NOT NULL,
    `sow_subform_id` BIGINT NOT NULL,
    `comments` TEXT,
    `bid_price` DECIMAL(10, 2) NOT NULL,
    `client_price` DECIMAL(10, 2) NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `log_services` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `vendor_contract_id` BIGINT NOT NULL,
    `service_date` DATE NOT NULL,
    `comments` TEXT,
    `status` ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `log_services_subform` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `log_service_id` BIGINT NOT NULL,
    `qty` INT NOT NULL,
    `unit_number` VARCHAR(50) NOT NULL,
    `before_wash_image` BLOB,
    `after_wash_image` BLOB,
    `date_of_service` DATE NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `vendor_invoicing` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `log_service_id` BIGINT NOT NULL,
    `vendor_contract_id` BIGINT NOT NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `invoice_date` DATE NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Pending', 'Paid', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `invoice_number_unique` (`invoice_number`)
);

CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `title_id` BIGINT NOT NULL,
    `department_id` BIGINT NOT NULL,
    `role_and_permission_id` BIGINT NOT NULL,
    `organisation_id` BIGINT NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `type` ENUM('Admin', 'Client', 'Vendor') NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `user_email_unique` (`email`)
);

CREATE TABLE `authentication` (
	`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_by` BIGINT,
    `modified_time` DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `client_contacts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `client_account_id` bigint NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) NOT NULL,
  `country` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `portal_access` tinyint(1) NOT NULL DEFAULT '0',
  `operational_associate_id` bigint DEFAULT NULL,
  `operational_manager_id` bigint DEFAULT NULL,
  `sales_associate_id` bigint DEFAULT NULL,
  `sales_manager_id` bigint DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_by` bigint NOT NULL,
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` bigint DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_contact_email_unique` (`email`),
  KEY `operational_manager_id` (`operational_manager_id`),
  KEY `sales_associate_id` (`sales_associate_id`),
  KEY `sales_manager_id` (`sales_manager_id`),
  KEY `client_account_id` (`client_account_id`),
  KEY `operational_associate_id` (`operational_associate_id`,`created_by`),
  KEY `client_contacts_ibfk_7_idx` (`created_by`),
  KEY `client_contacts_ibfk_8_idx` (`created_by`),
  CONSTRAINT `client_contacts_ibfk_2` FOREIGN KEY (`operational_manager_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_contacts_ibfk_3` FOREIGN KEY (`sales_associate_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_contacts_ibfk_4` FOREIGN KEY (`sales_manager_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_contacts_ibfk_5` FOREIGN KEY (`client_account_id`) REFERENCES `client_accounts` (`id`),
  CONSTRAINT `client_contacts_ibfk_6` FOREIGN KEY (`operational_associate_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_contacts_ibfk_8` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);


CREATE TABLE `client_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) NOT NULL,
  `country` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `operational_associate_id` bigint DEFAULT NULL,
  `operational_manager_id` bigint DEFAULT NULL,
  `sales_associate_id` bigint DEFAULT NULL,
  `sales_manager_id` bigint DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_by` bigint NOT NULL,
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` bigint DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_contact_email_unique` (`email`),
  KEY `operational_associate_id` (`operational_associate_id`),
  KEY `operational_manager_id` (`operational_manager_id`),
  KEY `sales_associate_id` (`sales_associate_id`),
  KEY `sales_manager_id` (`sales_manager_id`),
  KEY `client_accounts_ibfk_5_idx` (`created_by`),
  KEY `client_accounts_ibfk_6_idx` (`created_by`),
  CONSTRAINT `client_accounts_ibfk_1` FOREIGN KEY (`operational_associate_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_accounts_ibfk_2` FOREIGN KEY (`operational_manager_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_accounts_ibfk_3` FOREIGN KEY (`sales_associate_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_accounts_ibfk_4` FOREIGN KEY (`sales_manager_id`) REFERENCES `users` (`id`),
  CONSTRAINT `client_accounts_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

CREATE TABLE `designation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_by` bigint NOT NULL,
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` bigint DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `designation_name_org_unique` (`name`)
);


ALTER TABLE `users`
DROP FOREIGN KEY `users_title_id_foreign`,
DROP FOREIGN KEY `users_department_id_foreign`,
DROP FOREIGN KEY `users_organisation_id_foreign`,
DROP COLUMN `Street`,
DROP COLUMN `title_id`,
DROP COLUMN `department_id`,
DROP COLUMN `organisation_id`;
DROP COLUMN `type`;

ALTER TABLE `users` 
MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE users  ADD COLUMN designation_id BIGINT NOT NULL AFTER role_and_permission_id;

ALTER TABLE `service_category`
DROP COLUMN `organisation_id`;

ALTER TABLE `services`
DROP FOREIGN KEY `services_season_id_foreign`;

ALTER TABLE `services`
DROP FOREIGN KEY `services_organisation_id_foreign`;

ALTER TABLE `services`
DROP COLUMN `season_id`,
DROP COLUMN `organisation_id`;

ALTER TABLE `services`
MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE `services`
ADD COLUMN `description` text DEFAULT NULL AFTER category_id;

ALTER TABLE `sites`
ADD COLUMN `location_name` VARCHAR(100) NOT NULL AFTER `site_number`,
ADD COLUMN `street` VARCHAR(255) NOT NULL AFTER `location_name`,
ADD COLUMN `city` VARCHAR(100) NOT NULL AFTER `street`,
ADD COLUMN `state` VARCHAR(50) NOT NULL AFTER `city`,
ADD COLUMN `country` VARCHAR(100) NOT NULL DEFAULT 'United States' AFTER `state`,
ADD COLUMN `zip_code` VARCHAR(20) NOT NULL AFTER `country`,
ADD COLUMN `map_link` TEXT NOT NULL AFTER `zip_code`,
ADD column `portal_access` tinyint(1) NOT NULL DEFAULT '0' after`map_link` ;

ALTER TABLE `sites`
DROP COLUMN `shipping_service_address`;

ALTER TABLE `sites` 
MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';


ALTER TABLE `sites` 
DROP FOREIGN KEY `sites_user_id_foreign`;

ALTER TABLE `sites` 
DROP INDEX `sites_user_id_foreign`;

ALTER TABLE `sites` 
DROP COLUMN `user_id`;

-- Foreign Key Constraints
ALTER TABLE `sites`
ADD COLUMN `operational_associate_id` BIGINT DEFAULT NULL AFTER `map_link`,
ADD COLUMN `operational_manager_id` BIGINT DEFAULT NULL AFTER `operational_associate_id`,
ADD COLUMN `sales_associate_id` BIGINT DEFAULT NULL AFTER `operational_manager_id`,
ADD COLUMN `sales_manager_id` BIGINT DEFAULT NULL AFTER `sales_associate_id`,
ADD KEY `operational_associate_id` (`operational_associate_id`),
ADD KEY `operational_manager_id` (`operational_manager_id`),
ADD KEY `sales_associate_id` (`sales_associate_id`),
ADD KEY `sales_manager_id` (`sales_manager_id`),
ADD CONSTRAINT `sites_operational_associate_id_fk` FOREIGN KEY (`operational_associate_id`) REFERENCES `users` (`id`),
ADD CONSTRAINT `sites_operational_manager_id_fk` FOREIGN KEY (`operational_manager_id`) REFERENCES `users` (`id`),
ADD CONSTRAINT `sites_sales_associate_id_fk` FOREIGN KEY (`sales_associate_id`) REFERENCES `users` (`id`),
ADD CONSTRAINT `sites_sales_manager_id_fk` FOREIGN KEY (`sales_manager_id`) REFERENCES `users` (`id`);

-- Step 1: Drop existing foreign key constraints
ALTER TABLE `sites` DROP FOREIGN KEY `sites_client_id_foreign`;
ALTER TABLE `sites` DROP FOREIGN KEY `sites_contact_id_foreign`;

-- Step 2: Rename contact_id to account_id
ALTER TABLE `sites` CHANGE `client_id` `account_id` BIGINT NOT NULL;

-- Step 3: Add foreign key constraints
ALTER TABLE `sites`
ADD CONSTRAINT `sites_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `client_accounts` (`id`),
ADD CONSTRAINT `sites_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `client_contacts` (`id`);

ALTER TABLE `users`
ADD CONSTRAINT `users_designation_id_foreign`
FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`);

ALTER TABLE `organisation_profile` 
ADD CONSTRAINT `organisation_profile_created_by_foreign` 
FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `titles` 
ADD CONSTRAINT `titles_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);

ALTER TABLE `departments` 
ADD CONSTRAINT `departments_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);

ALTER TABLE `roles_and_permissions` 
ADD CONSTRAINT `roles_and_permissions_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);

ALTER TABLE `service_category` 
ADD CONSTRAINT `service_category_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);

ALTER TABLE `seasons` 
ADD CONSTRAINT `seasons_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);

ALTER TABLE `services` 
ADD CONSTRAINT `services_category_id_foreign` 
FOREIGN KEY (`category_id`) REFERENCES `service_category` (`id`),
ADD CONSTRAINT `services_season_id_foreign` 
FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`),
ADD CONSTRAINT `services_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);

ALTER TABLE `clients` 
ADD CONSTRAINT `clients_user_id_foreign` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `contacts` 
ADD CONSTRAINT `contacts_client_id_foreign` 
FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
ADD CONSTRAINT `contacts_user_id_foreign` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `sites` 
ADD CONSTRAINT `sites_contact_id_foreign` 
FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
ADD CONSTRAINT `sites_client_id_foreign` 
FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
ADD CONSTRAINT `sites_user_id_foreign` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `units` 
ADD CONSTRAINT `units_contact_id_foreign` 
FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
ADD CONSTRAINT `units_client_id_foreign` 
FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

ALTER TABLE `vendor_accounts` 
ADD CONSTRAINT `vendor_accounts_user_id_foreign` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `vendor_contacts` 
ADD CONSTRAINT `vendor_contacts_vendor_account_id_foreign` 
FOREIGN KEY (`vendor_account_id`) REFERENCES `vendor_accounts` (`id`),
ADD CONSTRAINT `vendor_contacts_user_id_foreign` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `vendor_compliance` 
ADD CONSTRAINT `vendor_compliance_vendor_contact_id_foreign` 
FOREIGN KEY (`vendor_contact_id`) REFERENCES `vendor_contacts` (`id`);

ALTER TABLE `sow` 
ADD CONSTRAINT `sow_site_id_foreign` 
FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
ADD CONSTRAINT `sow_contact_id_foreign` 
FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
ADD CONSTRAINT `sow_client_id_foreign` 
FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

ALTER TABLE `bids` 
ADD CONSTRAINT `bids_sow_id_foreign` 
FOREIGN KEY (`sow_id`) REFERENCES `sow` (`id`),
ADD CONSTRAINT `bids_vendor_contact_id_foreign` 
FOREIGN KEY (`vendor_contact_id`) REFERENCES `vendor_contacts` (`id`),
ADD CONSTRAINT `bids_vendor_account_id_foreign` 
FOREIGN KEY (`vendor_account_id`) REFERENCES `vendor_accounts` (`id`);

ALTER TABLE `client_contracts` 
ADD CONSTRAINT `client_contracts_vendor_contract_id_foreign` 
FOREIGN KEY (`vendor_contract_id`) REFERENCES `vendor_contracts` (`id`),
ADD CONSTRAINT `client_contracts_bid_id_foreign` 
FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`);

ALTER TABLE `vendor_contracts` 
ADD CONSTRAINT `vendor_contracts_client_contract_id_foreign` 
FOREIGN KEY (`client_contract_id`) REFERENCES `client_contracts` (`id`),
ADD CONSTRAINT `vendor_contracts_bid_id_foreign` 
FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`);

ALTER TABLE `sow_subform` 
ADD CONSTRAINT `sow_subform_sow_id_foreign` 
FOREIGN KEY (`sow_id`) REFERENCES `sow` (`id`),
ADD CONSTRAINT `sow_subform_service_id_foreign` 
FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
ADD CONSTRAINT `sow_subform_category_id_foreign` 
FOREIGN KEY (`category_id`) REFERENCES `service_category` (`id`),
ADD CONSTRAINT `sow_subform_season_id_foreign` 
FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`);

ALTER TABLE `bids_subform` 
ADD CONSTRAINT `bids_subform_bid_id_foreign` 
FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`),
ADD CONSTRAINT `bids_subform_sow_subform_id_foreign` 
FOREIGN KEY (`sow_subform_id`) REFERENCES `sow_subform` (`id`);

ALTER TABLE `log_services` 
ADD CONSTRAINT `log_services_vendor_contract_id_foreign` 
FOREIGN KEY (`vendor_contract_id`) REFERENCES `vendor_contracts` (`id`);

ALTER TABLE `log_services_subform` 
ADD CONSTRAINT `log_services_subform_log_service_id_foreign` 
FOREIGN KEY (`log_service_id`) REFERENCES `log_services` (`id`);

ALTER TABLE `vendor_invoicing` 
ADD CONSTRAINT `vendor_invoicing_log_service_id_foreign` 
FOREIGN KEY (`log_service_id`) REFERENCES `log_services` (`id`),
ADD CONSTRAINT `vendor_invoicing_vendor_contract_id_foreign` 
FOREIGN KEY (`vendor_contract_id`) REFERENCES `vendor_contracts` (`id`);

ALTER TABLE `users` 
ADD CONSTRAINT `users_title_id_foreign` 
FOREIGN KEY (`title_id`) REFERENCES `titles` (`id`),
ADD CONSTRAINT `users_department_id_foreign` 
FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
ADD CONSTRAINT `users_role_and_permission_id_foreign` 
FOREIGN KEY (`role_and_permission_id`) REFERENCES `roles_and_permissions` (`id`),
ADD CONSTRAINT `users_organisation_id_foreign` 
FOREIGN KEY (`organisation_id`) REFERENCES `organisation_profile` (`id`);