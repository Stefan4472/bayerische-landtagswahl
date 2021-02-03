CREATE TABLE Wahl (
	ID SERIAL,
    Jahr int NOT NULL UNIQUE,
    PRIMARY KEY (ID)
);

CREATE TABLE Wahlkreis (
	ID int NOT NULL UNIQUE,
    Name varchar(255) NOT NULL UNIQUE,
    Mandate int NOT NULL,
    PRIMARY KEY (ID)
);

---- TODO: MAKE 'Name, WahlID' AND 'Nummer, WahlID' UNIQUE
CREATE TABLE Stimmkreis (
	ID SERIAL,
    Name varchar(255) NOT NULL,
    Wahlkreis int NOT NULL,
    Nummer int NOT NULL,
    NumBerechtigter int NOT NULL,
    WahlID int NOT NULL,
	FOREIGN KEY (Wahlkreis) REFERENCES Wahlkreis(ID) on update cascade on delete cascade,
    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade,
    PRIMARY KEY (ID)
);

CREATE TABLE Partei (
    ID SERIAL,
    ParteiName varchar(255) NOT NULL UNIQUE,
    PRIMARY KEY (ID)
);

-- Map Partei to Wahl in which the party took part
CREATE TABLE ParteiZuWahl (
    ID SERIAL,
    Partei int NOT NULL,
    WahlID int NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (Partei) REFERENCES Partei(ID) on update cascade on delete cascade,
    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade,
    UNIQUE(Partei, WahlID)
);

CREATE TABLE Kandidat (
    ID SERIAL,
    Vorname varchar(255) NOT NULL,
    Nachname varchar(255) NOT NULL,
    Partei int,
    WahlID int,
    Wahlkreis int,
    PRIMARY KEY (ID),
    FOREIGN KEY (Partei) REFERENCES Partei(ID) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (WahlID) REFERENCES Wahl(ID) on update cascade on delete cascade,
    FOREIGN KEY (Wahlkreis) REFERENCES Wahlkreis(ID) on update cascade on delete cascade
);

-- Associate direct candidate to the stimmkreis in which they ran
CREATE TABLE DKandidatZuStimmkreis (
    Kandidat int NOT NULL,
    Stimmkreis int NOT NULL,
    FOREIGN KEY (Kandidat) REFERENCES Kandidat(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Stimmkreis) REFERENCES Stimmkreis(ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- NOTE: FOR SOME REASON, PSYCOPG2 DOESN'T ALLOW BOOLEANS
CREATE TABLE Erststimme (
	StimmeID SERIAL,
    Kandidat int NOT NULL,
    Stimmkreis int NOT NULL,
    Wahl int NOT NULL,
    IsValid int NOT NULL DEFAULT 1,
    PRIMARY KEY (StimmeID),
    FOREIGN KEY (Kandidat) REFERENCES Kandidat(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Stimmkreis) REFERENCES Stimmkreis(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Zweitstimme (
	StimmeID SERIAL,
    Kandidat int NOT NULL,
    Stimmkreis int NOT NULL,
    Wahl int NOT NULL,
    IsValid int NOT NULL DEFAULT 1,
    PRIMARY KEY (StimmeID),
    FOREIGN KEY (Kandidat) REFERENCES Kandidat(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Stimmkreis) REFERENCES Stimmkreis(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ZweitstimmePartei (
	StimmeID SERIAL,
    Partei int NOT NULL,
    Stimmkreis int NOT NULL,
	Wahl int NOT NULL,
    PRIMARY KEY (StimmeID),
    FOREIGN KEY (Partei) REFERENCES Partei(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE VoteRecords (
    Key varchar(64) NOT NULL UNIQUE,
	Wahl int NOT NULL,
    Stimmkreis int NOT NULL,
    HasVoted bool DEFAULT false,
    Primary key (Key, Wahl),
    FOREIGN KEY (Stimmkreis) REFERENCES Stimmkreis(ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Wahl) REFERENCES Wahl(ID) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO Wahlkreis(ID, Name, Mandate) VALUES
    (1, 'Oberbayern', 61),
    (2, 'Niederbayern', 18),
    (3, 'Oberpfalz', 16),
    (4, 'Oberfranken', 16),
    (5, 'Mittelfranken', 24),
    (6, 'Unterfranken', 19),
    (7, 'Schwaben', 26);