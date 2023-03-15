-- CreateTable
CREATE TABLE "alert_fees" (
    "id" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_txs" (
    "id" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "txid" VARCHAR(64) NOT NULL,
    "confirmations" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_txs_pkey" PRIMARY KEY ("id")
);
