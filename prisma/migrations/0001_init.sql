-- CreateTable
CREATE TABLE "EcSite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hasProductCsv" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BillingCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductCsvMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ecSiteId" INTEGER NOT NULL,
    "projectColumn" TEXT,
    "categoryColumn" TEXT,
    "productCodeColumn" TEXT,
    "productNameColumn" TEXT,
    "variationColumn" TEXT,
    "priceColumn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductCsvMaster_ecSiteId_fkey" FOREIGN KEY ("ecSiteId") REFERENCES "EcSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WmsCsvMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wmsName" TEXT NOT NULL,
    "ecSiteId" INTEGER,
    "orderNumberColumn" TEXT,
    "productCodeColumn" TEXT,
    "quantityColumn" TEXT,
    "unitPriceColumn" TEXT,
    "shipDateColumn" TEXT,
    "shippingColumn" TEXT,
    "codFeeColumn" TEXT,
    "commissionColumn" TEXT,
    "targetItemName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WmsCsvMaster_ecSiteId_fkey" FOREIGN KEY ("ecSiteId") REFERENCES "EcSite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillingItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "targetItemName" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postalCode" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "bankName" TEXT,
    "branchName" TEXT,
    "accountType" TEXT,
    "accountNumber" TEXT,
    "accountHolder" TEXT,
    "storageFee" REAL,
    "operationFee" REAL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "sendInvoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "commissionRate" REAL,
    "warehouseId" INTEGER,
    "billingCategoryId" INTEGER,
    "remarks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Project_billingCategoryId_fkey" FOREIGN KEY ("billingCategoryId") REFERENCES "BillingCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ecSiteId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "category" TEXT,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "variation" TEXT,
    "unitPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "Product_ecSiteId_fkey" FOREIGN KEY ("ecSiteId") REFERENCES "EcSite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WmsData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wmsName" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "productCode" TEXT,
    "productName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL,
    "totalAmount" REAL,
    "shipDate" DATETIME,
    "shippingFee" REAL,
    "codFee" REAL,
    "commission" REAL,
    "afterDeliveryStatus" TEXT,
    "targetMonth" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WmsData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IrregularBilling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "targetMonth" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "billingItemId" INTEGER NOT NULL,
    "venueShippingFee100" REAL,
    "venueShippingFee160" REAL,
    "cashOnDeliveryFee" REAL,
    "advanceShippingFee" REAL,
    "defectExchangeFee" REAL,
    "cancelReturnFee" REAL,
    "storageFee" REAL,
    "returnHandlingFee" REAL,
    "operationFee" REAL,
    "miscExpense" REAL,
    "deliveryAccidentFee" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IrregularBilling_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IrregularBilling_billingItemId_fkey" FOREIGN KEY ("billingItemId") REFERENCES "BillingItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "targetMonth" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT '未送信',
    "sentAt" DATETIME,
    "sentBy" TEXT,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EcSite_name_key" ON "EcSite"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BillingCategory_name_key" ON "BillingCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCsvMaster_ecSiteId_key" ON "ProductCsvMaster"("ecSiteId");

-- CreateIndex
CREATE UNIQUE INDEX "WmsCsvMaster_wmsName_key" ON "WmsCsvMaster"("wmsName");

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_ecSiteId_productCode_variation_key" ON "Product"("ecSiteId", "productCode", "variation");

-- CreateIndex
CREATE INDEX "WmsData_projectId_targetMonth_idx" ON "WmsData"("projectId", "targetMonth");

-- CreateIndex
CREATE INDEX "WmsData_orderNumber_idx" ON "WmsData"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IrregularBilling_targetMonth_projectId_billingItemId_key" ON "IrregularBilling"("targetMonth", "projectId", "billingItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_targetMonth_projectId_key" ON "Invoice"("targetMonth", "projectId");

