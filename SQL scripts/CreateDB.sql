DROP DATABASE IF EXISTS bayerische_landtagswahl;
CREATE DATABASE bayerische_landtagswahl;
USE bayerische_landtagswahl;

SET NAMES utf8;
SET character_set_client = utf8mb4;

CREATE TABLE Wahl (
	ID int AUTO_INCREMENT,
    Jahr year NOT NULL UNIQUE,
    PRIMARY KEY (ID)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE Partei (
    ID int AUTO_INCREMENT,
    ParteiName varchar(255) NOT NULL,
    WahlID int,
    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade,
    PRIMARY KEY (ID)
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--TODO (this has been removed for now for simplification... will be added back next week when we have more time.
--CREATE TABLE ParteiZuWahl (
--    ID int AUTO_INCREMENT,
--    Partei int NOT NULL,
--    WahlID int,
--    PRIMARY KEY (ID),
--    FOREIGN KEY (Partei) REFERENCES Partei(ID) on update cascade on delete cascade,
--    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade
--)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE Kandidat (
    ID int AUTO_INCREMENT,
    Vorname varchar(255) NOT NULL,
    Nachname varchar(255) NOT NULL,
    Partei int,
    WahlID int,
    PRIMARY KEY (ID),
    FOREIGN KEY (Partei) REFERENCES Partei(ID) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--TODO (this has been removed for now for simplification... will be added back next week when we have more time.
--CREATE TABLE KandidatZuWahl (
--    ID int NOT NULL AUTO_INCREMENT,
--    Kandidat int NOT NULL,
--    WahlID int,
--    PRIMARY KEY (ID),
--    FOREIGN KEY (Kandidat) REFERENCES Kandidat(ID) on update cascade on delete cascade,
--    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade
--)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE Wahlkreis (
	ID int NOT NULL UNIQUE,
    Name varchar(255) NOT NULL UNIQUE,
    PRIMARY KEY (ID)
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TODO: MAKE 'Name' UNIQUE
CREATE TABLE Stimmkreis (
	ID int AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    Wahlkreis int NOT NULL,
    Nummer int NOT NULL,
    NumBerechtigter int NOT NULL,
    WahlID int NOT NULL,
	FOREIGN KEY (Wahlkreis) REFERENCES Wahlkreis(ID) on update cascade on delete cascade,
    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade,
    PRIMARY KEY (ID)
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE Erststimme (
	StimmeID int AUTO_INCREMENT,
    Kandidat int NOT NULL,
    Stimmkreis int NOT NULL,
    Wahl int NOT NULL,
    PRIMARY KEY (StimmeID),
    FOREIGN KEY (Kandidat) REFERENCES Kandidat(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Stimmkreis) REFERENCES Stimmkreis(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE Zweitstimme (
	StimmeID int NOT NULL AUTO_INCREMENT,
    Kandidat int NOT NULL,
    Stimmkreis int NOT NULL,
    Wahl int NOT NULL,
    PRIMARY KEY (StimmeID),
    FOREIGN KEY (Kandidat) REFERENCES Kandidat(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Stimmkreis) REFERENCES Stimmkreis(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ZweitstimmePartei (
	StimmeID int AUTO_INCREMENT,
    Partei int NOT NULL,
    Stimmkreis int NOT NULL,
	Wahl int NOT NULL,
    PRIMARY KEY (StimmeID),
    FOREIGN KEY (Partei) REFERENCES Partei(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
)ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO Wahlkreis(ID, Name) VALUES
    (1, "Oberbayern"),
    (2, "Niederbayern"),
    (3, "Oberpfalz"),
    (4, "Oberfranken"),
    (5, "Mittelfranken"),
    (6, "Unterfranken"),
    (7, "Schwaben");