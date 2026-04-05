-- Migration to create the stageSubProcess table
-- This migration adds the new table with proper foreign key relationships and indexes

-- First, create the ProductionStage enum if it doesn't exist
-- Assuming common production stages; adjust as needed
CREATE TABLE IF NOT EXISTS `production_stage_enum` (
  `stage` VARCHAR(50) PRIMARY KEY,
  `description` VARCHAR(255)
);

INSERT INTO `production_stage_enum` (`stage`, `description`) VALUES
('Preparation', 'Initial preparation stage'),
('Casting', 'Clay casting stage'),
('Trimming', 'Trimming and shaping stage'),
('Glazing', 'Glaze application stage'),
('Firing', 'Kiln firing stage'),
('Finishing', 'Final finishing stage')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Create the stageSubProcess table
CREATE TABLE `stageSubProcess` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `polDetailId` VARCHAR(255) NOT NULL,
  `stage` VARCHAR(50) NOT NULL,
  `processName` VARCHAR(255) NOT NULL,
  `processOrder` INT NOT NULL,
  `quantity` INT NOT NULL,
  `rejectQuantity` INT NOT NULL DEFAULT 0,
  `completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdBy` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Foreign key to pol_detail table (assuming it exists; adjust table name if different)
  CONSTRAINT `fk_stageSubProcess_polDetail` FOREIGN KEY (`polDetailId`) REFERENCES `pol_detail` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  -- Ensure stage is valid
  CONSTRAINT `fk_stageSubProcess_stage` FOREIGN KEY (`stage`) REFERENCES `production_stage_enum` (`stage`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX `idx_stageSubProcess_polDetailId` ON `stageSubProcess` (`polDetailId`);
CREATE INDEX `idx_stageSubProcess_stage` ON `stageSubProcess` (`stage`);
CREATE INDEX `idx_stageSubProcess_processOrder` ON `stageSubProcess` (`processOrder`);
CREATE INDEX `idx_stageSubProcess_completed` ON `stageSubProcess` (`completed`);

-- Optional: Composite index for common queries
CREATE INDEX `idx_stageSubProcess_polDetail_stage_order` ON `stageSubProcess` (`polDetailId`, `stage`, `processOrder`);