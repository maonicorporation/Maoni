-- MySQL Script generated by MySQL Workbench
-- Sun Mar 13 19:25:02 2016
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema MaoniBD
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema MaoniBD
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `MaoniBD` DEFAULT CHARACTER SET utf8 ;
USE `MaoniBD` ;

-- -----------------------------------------------------
-- Table `MaoniBD`.`empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`empresas` (
  `ROWID` INT(11) NOT NULL AUTO_INCREMENT,
  `IDEMPRESA` INT(11) NOT NULL,
  `DESCEMPRESA` NVARCHAR(75) NULL DEFAULT NULL,
  `CIF` NVARCHAR(45) NULL,
  `DIRECCION` NVARCHAR(100) NULL,
  `CP` VARCHAR(10) NULL,
  `POBLACION` NVARCHAR(50) NULL,
  `PROVINCIA` NVARCHAR(50) NULL,
  `ISO_PAIS` VARCHAR(3) NULL,
  PRIMARY KEY (`IDEMPRESA`),
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `MaoniBD`.`hoteles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`hoteles` (
  `ROWID` INT(11) NOT NULL AUTO_INCREMENT,
  `IDHOTEL` INT(11) NOT NULL,
  `IDEMPRESA` INT(11) NULL DEFAULT NULL,
  `DESCHOTEL` NVARCHAR(75) NULL DEFAULT NULL,
  `DIRECCION` NVARCHAR(100) NULL,
  `CP` VARCHAR(10) NULL,
  `POBLACION` NVARCHAR(50) NULL,
  `PROVINCIA` NVARCHAR(50) NULL,
  `ISO_PAIS` VARCHAR(3) NULL,
  `NUM_HABIT` INT NULL,
  PRIMARY KEY (`IDHOTEL`),
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC),
  INDEX `IDEMPRESA_idx` (`IDEMPRESA` ASC),
  CONSTRAINT `IDEMPRESA`
    FOREIGN KEY (`IDEMPRESA`)
    REFERENCES `MaoniBD`.`empresas` (`IDEMPRESA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `MaoniBD`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`usuarios` (
  `ROWID` INT(11) NOT NULL AUTO_INCREMENT,
  `IDUSUARIO` INT(11) NOT NULL,
  `DESCUSUARIO` VARCHAR(75) NULL DEFAULT NULL,
  `PASSWORD` VARCHAR(64) NULL DEFAULT NULL,
  PRIMARY KEY (`IDUSUARIO`),
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `MaoniBD`.`usuarioshoteles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`usuarioshoteles` (
  `ROWID` INT(11) NOT NULL AUTO_INCREMENT,
  `IDUSUARIO` INT(11) NULL DEFAULT NULL,
  `IDHOTEL` INT(11) NULL DEFAULT NULL,
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC),
  INDEX `IDHOTEL_idx` (`IDHOTEL` ASC),
  INDEX `IDUSUARIO_idx` (`IDUSUARIO` ASC),
  CONSTRAINT `IDUSUARIO`
    FOREIGN KEY (`IDUSUARIO`)
    REFERENCES `MaoniBD`.`usuarios` (`IDUSUARIO`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `IDHOTEL`
    FOREIGN KEY (`IDHOTEL`)
    REFERENCES `MaoniBD`.`hoteles` (`IDHOTEL`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `MaoniBD`.`cardex`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`cardex` (
  `ROWID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `MAIL_CARDEX` VARCHAR(50) NOT NULL,
  `NOMBRE` NVARCHAR(50) NULL,
  `APELLIDO1` NVARCHAR(50) NULL,
  `APELLIDO2` NVARCHAR(50) NULL,
  `DIRECCION` NVARCHAR(100) NULL,
  `CP` VARCHAR(10) NULL,
  `POBLACION` VARCHAR(100) NULL,
  `PROVINCIA` VARCHAR(100) NULL,
  `ISO_PAIS` VARCHAR(3) NULL,
  `TELEFONO` VARCHAR(50) NULL,
  `MOVIL` VARCHAR(45) NULL,
  PRIMARY KEY (`MAIL_CARDEX`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `MaoniBD`.`reservas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`reservas` (
  `ROWID` INT NOT NULL AUTO_INCREMENT,
  `IDRESERVA` INT NOT NULL,
  `IDHOTEL` INT NOT NULL,
  `ENTRADA` DATETIME NULL,
  `SALIDA` DATETIME NULL,
  `MAIL_CARDEX` VARCHAR(50) NULL,
  `SI_ENCUESTA_ENVIADA` TINYINT(1) NULL,
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC),
  PRIMARY KEY (`IDRESERVA`, `IDHOTEL`),
  INDEX `IDHOTEL_idx` (`IDHOTEL` ASC),
  INDEX `MAIL_CARDEX_idx` (`MAIL_CARDEX` ASC),
  CONSTRAINT `IDHOTEL`
    FOREIGN KEY (`IDHOTEL`)
    REFERENCES `MaoniBD`.`hoteles` (`IDHOTEL`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `MAIL_CARDEX`
    FOREIGN KEY (`MAIL_CARDEX`)
    REFERENCES `MaoniBD`.`cardex` (`MAIL_CARDEX`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `MaoniBD`.`plantillas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`plantillas` (
  `ROWID` INT NOT NULL AUTO_INCREMENT,
  `IDPLANTILLA` INT NOT NULL,
  `NOMBRE` NVARCHAR(50) NULL,
  `IDHOTEL` INT NULL,
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC),
  PRIMARY KEY (`IDPLANTILLA`),
  INDEX `IDHOTEL_idx` (`IDHOTEL` ASC),
  CONSTRAINT `IDHOTEL`
    FOREIGN KEY (`IDHOTEL`)
    REFERENCES `MaoniBD`.`hoteles` (`IDHOTEL`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `MaoniBD`.`encuestas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MaoniBD`.`encuestas` (
  `ROWID` INT NOT NULL AUTO_INCREMENT,
  `IDRESERVA` INT NOT NULL,
  `IDPLANTILLA` INT NOT NULL,
  UNIQUE INDEX `ROWID_UNIQUE` (`ROWID` ASC),
  PRIMARY KEY (`IDRESERVA`, `IDPLANTILLA`),
  INDEX `IDPLANTILLA_idx` (`IDPLANTILLA` ASC),
  CONSTRAINT `IDRESERVA`
    FOREIGN KEY (`IDRESERVA`)
    REFERENCES `MaoniBD`.`reservas` (`IDRESERVA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `IDPLANTILLA`
    FOREIGN KEY (`IDPLANTILLA`)
    REFERENCES `MaoniBD`.`plantillas` (`IDPLANTILLA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
