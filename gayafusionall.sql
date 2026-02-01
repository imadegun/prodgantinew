-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.4 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table gayafusionall.tblcasting (Casting Tool)
CREATE TABLE IF NOT EXISTS `tblcasting` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CastingCode` varchar(10) NOT NULL,
  `CastingDescription` varchar(100) NOT NULL,
  `CastingDate` date NOT NULL DEFAULT '0000-00-00',
  `CastingTechDraw` varchar(50) DEFAULT NULL,
  `CastingPhoto1` varchar(300) DEFAULT NULL,
  `CastingPhoto2` varchar(300) DEFAULT NULL,
  `CastingPhoto3` varchar(300) DEFAULT NULL,
  `CastingPhoto4` varchar(300) DEFAULT NULL,
  `CastingNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CastingCode` (`CastingCode`)
) ENGINE=MyISAM AUTO_INCREMENT=77 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblclay (material Clay)
CREATE TABLE IF NOT EXISTS `tblclay` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `ClayCode` varchar(10) NOT NULL,
  `ClayDescription` varchar(100) NOT NULL,
  `ClayDate` date NOT NULL DEFAULT '0000-00-00',
  `ClayTechDraw` varchar(50) DEFAULT NULL,
  `ClayPhoto1` varchar(300) DEFAULT NULL,
  `ClayPhoto2` varchar(300) DEFAULT NULL,
  `ClayPhoto3` varchar(300) DEFAULT NULL,
  `ClayPhoto4` varchar(300) DEFAULT NULL,
  `ClayNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ClayCode` (`ClayCode`)
) ENGINE=MyISAM AUTO_INCREMENT=74 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_category (product name)
CREATE TABLE IF NOT EXISTS `tblcollect_category` (
  `CategoryCode` varchar(3) NOT NULL,
  `CategoryName` varchar(50) NOT NULL,
  PRIMARY KEY (`CategoryCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_color (product color)
CREATE TABLE IF NOT EXISTS `tblcollect_color` (
  `ColorCode` varchar(3) NOT NULL,
  `ColorName` varchar(100) NOT NULL,
  PRIMARY KEY (`ColorCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_design (client)
CREATE TABLE IF NOT EXISTS `tblcollect_design` (
  `DesignCode` varchar(2) NOT NULL,
  `DesignName` varchar(100) NOT NULL,
  PRIMARY KEY (`DesignCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_master (collections)
CREATE TABLE IF NOT EXISTS `tblcollect_master` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CollectCode` varchar(15) NOT NULL,
  `DesignCode` varchar(2) NOT NULL, --Design Client
  `NameCode` varchar(2) NOT NULL, -- Department Collection
  `CategoryCode` varchar(3) NOT NULL, -- Product Category
  `SizeCode` varchar(2) NOT NULL, -- Product Info  Size (small, medium, large, etc...)
  `TextureCode` varchar(2) NOT NULL, -- Product Texture
  `ColorCode` varchar(3) NOT NULL, -- Product Color
  `MaterialCode` varchar(2) NOT NULL, -- Material Code
  `ClientCode` varchar(20) DEFAULT NULL, -- Product Code
  `ClientDescription` varchar(50) DEFAULT NULL,
  `CollectDate` date DEFAULT '0000-01-01',
  `TechDraw` varchar(300) DEFAULT NULL, -- Technical Drawing
  `Photo1` varchar(300) DEFAULT NULL, -- Product Photo 1
  `Photo2` varchar(300) DEFAULT NULL, -- Product Photo 2
  `Photo3` varchar(300) DEFAULT NULL, -- Product Photo 3
  `Photo4` varchar(300) DEFAULT NULL, -- Product Photo 4
  `RefID` int DEFAULT NULL,
  `Clay` int DEFAULT NULL,  -- Clay Code + Clay Description
  `ClayKG` decimal(10,2) DEFAULT '0.00', -- Clay Weight
  `ClayNote` text,  -- Clay Notes
  `BuildTech` varchar(50) DEFAULT NULL, -- Build Technique
  `BuildTechNote` text,  -- Build Technique Notes
  `Rim` varchar(50) DEFAULT NULL,
  `Feet` varchar(30) DEFAULT NULL,
  `Casting1` int DEFAULT NULL,  -- Casting Code + Casting Description
  `Casting2` int DEFAULT NULL,  -- Casting Code + Casting Description
  `Casting3` int DEFAULT NULL,  -- Casting Code + Casting Description
  `Casting4` int DEFAULT NULL,  -- Casting Code + Casting Description
  `CastingNote` text,  -- Casting Notes
  `Estruder1` int DEFAULT NULL,  -- Estruder Code + Estruder Description
  `Estruder2` int DEFAULT NULL,  -- Estruder Code + Estruder Description
  `Estruder3` int DEFAULT NULL,  -- Estruder Code + Estruder Description
  `Estruder4` int DEFAULT NULL,  -- Estruder Code + Estruder Description
  `EstruderNote` text,  -- Estruder Notes
  `Texture1` int DEFAULT NULL,  -- Texture Code + Texture Description
  `Texture2` int DEFAULT NULL,  -- Texture Code + Texture Description
  `Texture3` int DEFAULT NULL,  -- Texture Code + Texture Description
  `Texture4` int DEFAULT NULL,  -- Texture Code + Texture Description
  `TextureNote` text,  -- Texture Notes
  `Tools1` int DEFAULT NULL,  -- Tools Code + Tools Description
  `Tools2` int DEFAULT NULL,  -- Tools Code + Tools Description
  `Tools3` int DEFAULT NULL,  -- Tools Code + Tools Description
  `Tools4` int DEFAULT NULL,  -- Tools Code + Tools Description
  `ToolsNote` text,  -- Tools Notes
  `Engobe1` int DEFAULT NULL,  -- Engobe Code + Engobe Description
  `Engobe2` int DEFAULT NULL,  -- Engobe Code + Engobe Description
  `Engobe3` int DEFAULT NULL,  -- Engobe Code + Engobe Description
  `Engobe4` int DEFAULT NULL,  -- Engobe Code + Engobe Description
  `EngobeNote` text,  -- Engobe Notes
  `BisqueTempNote` text,  -- Bisque Temperature Notes
  `BisqueTemp` int NOT NULL DEFAULT '900', -- Bisque Temperature
  `BisqueTempNote` text,  -- Bisque Temperature Notes
  `StainOxide1` int DEFAULT NULL,  -- Stain Oxide Code + Stain Oxide Description
  `StainOxide2` int DEFAULT NULL,  -- Stain Oxide Code + Stain Oxide Description
  `StainOxide3` int DEFAULT NULL,  -- Stain Oxide Code + Stain Oxide Description
  `StainOxide4` int DEFAULT NULL,  -- Stain Oxide Code + Stain Oxide Description
  `StainOxideNote` text,  -- Stain Oxide Notes
  `Lustre1` int DEFAULT NULL,  -- Lustre Code + Lustre Description
  `Lustre2` int DEFAULT NULL,  -- Lustre Code + Lustre Description
  `Lustre3` int DEFAULT NULL,  -- Lustre Code + Lustre Description
  `Lustre4` int DEFAULT NULL,  -- Lustre Code + Lustre Description
  `LustreNote` text,  -- Lustre Notes
  `LustreTemp` int DEFAULT '0', -- Lustre Temperature
  `LustreTempNote` text,  -- Lustre Temperature Notes
  `Glaze1` int DEFAULT NULL,  -- Glaze Code + Glaze Description   
  `Glaze2` int DEFAULT NULL, -- Glaze Code + Glaze Description
  `Glaze3` int DEFAULT NULL, -- Glaze Code + Glaze Description
  `Glaze4` int DEFAULT NULL, -- Glaze Code + Glaze Description
  `GlazeNote` text,  -- Glaze Notes
  `GlazeDensityNote` text,  -- Glaze Density Notes
  `GlazeDensity1` varchar(10) DEFAULT NULL, -- Glaze Density 1
  `GlazeDensity2` varchar(10) DEFAULT NULL, -- Glaze Density 2
  `GlazeDensity3` varchar(10) DEFAULT NULL, -- Glaze Density 3
  `GlazeDensity4` varchar(10) DEFAULT NULL, -- Glaze Density 4
  `GlazeTechnique` varchar(100) DEFAULT NULL, -- Glaze Technique
  `GlazeNote` text, -- Glaze Notes
  `GlazeTemp` int DEFAULT '0', -- Glaze Temperature
  `GlazeTempNote` text, -- Glaze Temperature Notes
  `Firing` varchar(10) DEFAULT NULL, -- Firing
  `FiringNote` text, -- Firing Notes
  `Width` decimal(10,2) DEFAULT NULL, -- Width
  `Height` decimal(10,2) DEFAULT NULL, -- Height
  `Length` decimal(10,2) DEFAULT NULL, -- Length
  `Diameter` decimal(10,2) DEFAULT NULL, -- Diameter 
  `FinalSizeNote` text, -- Final Size Notes

  `History` text, -- History

  PRIMARY KEY (`ID`),
  UNIQUE KEY `CollectCode` (`CollectCode`)
) ENGINE=MyISAM AUTO_INCREMENT=11247 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_material (Product Material)
CREATE TABLE IF NOT EXISTS `tblcollect_material` (
  `MaterialCode` varchar(2) NOT NULL,
  `MaterialName` varchar(50) NOT NULL,
  PRIMARY KEY (`MaterialCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_name (Product Category Name)
CREATE TABLE IF NOT EXISTS `tblcollect_name` (
  `NameCode` varchar(2) NOT NULL,
  `NameDesc` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`NameCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_size (Product Size)
CREATE TABLE IF NOT EXISTS `tblcollect_size` (
  `SizeCode` varchar(2) NOT NULL,
  `SizeName` varchar(50) NOT NULL,
  PRIMARY KEY (`SizeCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_texture (Product Texture)
CREATE TABLE IF NOT EXISTS `tblcollect_texture` (
  `TextureCode` varchar(2) NOT NULL,
  `TextureName` varchar(50) NOT NULL,
  PRIMARY KEY (`TextureCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblengobe (material Engobe)
CREATE TABLE IF NOT EXISTS `tblengobe` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EngobeCode` varchar(10) NOT NULL,
  `EngobeDescription` varchar(100) NOT NULL,
  `EngobeDate` date NOT NULL DEFAULT '0000-00-00',
  `EngobeTechDraw` varchar(300) DEFAULT NULL,
  `EngobePhoto1` varchar(300) DEFAULT NULL,
  `EngobePhoto2` varchar(300) DEFAULT NULL,
  `EngobePhoto3` varchar(300) DEFAULT NULL,
  `EngobePhoto4` varchar(300) DEFAULT NULL,
  `EngobeNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `EngobeCode` (`EngobeCode`)
) ENGINE=MyISAM AUTO_INCREMENT=97 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblestruder (Estruder Tool)
CREATE TABLE IF NOT EXISTS `tblestruder` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EstruderCode` varchar(10) NOT NULL,
  `EstruderDescription` varchar(100) NOT NULL,
  `EstruderDate` date NOT NULL DEFAULT '0000-00-00',
  `EstruderTechDraw` varchar(300) DEFAULT NULL,
  `EstruderPhoto1` varchar(300) DEFAULT NULL,
  `EstruderPhoto2` varchar(300) DEFAULT NULL,
  `EstruderPhoto3` varchar(300) DEFAULT NULL,
  `EstruderPhoto4` varchar(300) DEFAULT NULL,
  `EstruderNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `EstruderCode` (`EstruderCode`)
) ENGINE=MyISAM AUTO_INCREMENT=176 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblglaze (material Glaze)
CREATE TABLE IF NOT EXISTS `tblglaze` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GlazeCode` varchar(10) NOT NULL,
  `GlazeDescription` varchar(100) NOT NULL,
  `GlazeDate` date NOT NULL DEFAULT '0000-00-00',
  `GlazeTechDraw` varchar(300) DEFAULT NULL,
  `GlazePhoto1` varchar(300) DEFAULT NULL,
  `GlazePhoto2` varchar(300) DEFAULT NULL,
  `GlazePhoto3` varchar(300) DEFAULT NULL,
  `GlazePhoto4` varchar(300) DEFAULT NULL,
  `GlazeNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `GlazeCode` (`GlazeCode`)
) ENGINE=MyISAM AUTO_INCREMENT=703 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tbllustre (material Lustre)
CREATE TABLE IF NOT EXISTS `tbllustre` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LustreCode` varchar(10) NOT NULL,
  `LustreDescription` varchar(200) NOT NULL,
  `LustreDate` date NOT NULL DEFAULT '0000-00-00',
  `LustreTechDraw` varchar(100) DEFAULT NULL,
  `LustrePhoto1` varchar(100) DEFAULT NULL,
  `LustrePhoto2` varchar(100) DEFAULT NULL,
  `LustrePhoto3` varchar(100) DEFAULT NULL,
  `LustrePhoto4` varchar(100) DEFAULT NULL,
  `LustreNotes` text,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblstainoxide (material Stain Oxide)
CREATE TABLE IF NOT EXISTS `tblstainoxide` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `StainOxideCode` varchar(10) NOT NULL,
  `StainOxideDescription` varchar(100) NOT NULL,
  `StainOxideDate` date NOT NULL DEFAULT '0000-00-00',
  `StainOxideTechDraw` varchar(300) DEFAULT NULL,
  `StainOxidePhoto1` varchar(300) DEFAULT NULL,
  `StainOxidePhoto2` varchar(300) DEFAULT NULL,
  `StainOxidePhoto3` varchar(300) DEFAULT NULL,
  `StainOxidePhoto4` varchar(300) DEFAULT NULL,
  `StainOxideNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `stainoxideCode` (`StainOxideCode`)
) ENGINE=MyISAM AUTO_INCREMENT=83 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tbltexture (Texture Tool)
CREATE TABLE IF NOT EXISTS `tbltexture` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TextureCode` varchar(10) NOT NULL,
  `TextureDescription` varchar(100) NOT NULL,
  `TextureDate` date NOT NULL DEFAULT '0000-00-00',
  `TextureTechDraw` varchar(300) DEFAULT NULL,
  `TexturePhoto1` varchar(300) DEFAULT NULL,
  `TexturePhoto2` varchar(300) DEFAULT NULL,
  `TexturePhoto3` varchar(300) DEFAULT NULL,
  `TexturePhoto4` varchar(300) DEFAULT NULL,
  `TextureNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `TextureCode` (`TextureCode`)
) ENGINE=MyISAM AUTO_INCREMENT=108 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tbltools (Tools)
CREATE TABLE IF NOT EXISTS `tbltools` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `ToolsCode` varchar(10) NOT NULL,
  `ToolsDescription` varchar(100) NOT NULL,
  `ToolsDate` date NOT NULL DEFAULT '0000-00-00',
  `ToolsTechDraw` varchar(300) DEFAULT NULL,
  `ToolsPhoto1` varchar(300) DEFAULT NULL,
  `ToolsPhoto2` varchar(300) DEFAULT NULL,
  `ToolsPhoto3` varchar(300) DEFAULT NULL,
  `ToolsPhoto4` varchar(300) DEFAULT NULL,
  `ToolsNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ToolsCode` (`ToolsCode`)
) ENGINE=MyISAM AUTO_INCREMENT=1136 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblunit (information Unit)
CREATE TABLE IF NOT EXISTS `tblunit` (
  `UnitID` varchar(2) NOT NULL,
  `UnitValue` varchar(30) NOT NULL,
  PRIMARY KEY (`UnitID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
