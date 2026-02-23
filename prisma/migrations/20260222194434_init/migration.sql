-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameHe" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHe" TEXT,
    "grade" TEXT,
    "facilityId" TEXT NOT NULL,
    CONSTRAINT "Location_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sampleDate" DATETIME NOT NULL,
    "sampleType" TEXT NOT NULL,
    "cfuCount" REAL NOT NULL,
    "actionLimit" REAL NOT NULL,
    "alertLimit" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'compliant',
    "locationId" TEXT NOT NULL,
    "organismId" TEXT,
    "uploadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sample_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sample_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "Organism" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sample_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organism" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "genus" TEXT,
    "species" TEXT,
    "gramType" TEXT,
    "riskLevel" TEXT
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "facilityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Upload_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_facilityId_locationId_key" ON "Location"("facilityId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organism_name_key" ON "Organism"("name");
