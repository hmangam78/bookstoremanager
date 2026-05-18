-- ============================================
-- Database reset script
-- ============================================
-- Keeps: Book + Uncatalogued tables (stock set to 0,
--   providerId and publisherId set to null)
-- Deletes: all other data (sales, tickets,
--   stock movements, orders, returns, customers, etc.)
-- ============================================

BEGIN;

-- Preserve book and uncatalogued data but reset stock and FK refs
UPDATE "book" SET stock = 0, "providerId" = NULL, "publisherId" = NULL;
UPDATE "uncatalogued" SET stock = 0;

-- Delete all other records (order matters due to FK constraints)
DELETE FROM "stock_movement";
DELETE FROM "stock_receipt_order_item";
DELETE FROM "stock_receipt_order";
DELETE FROM "ticket_item";
DELETE FROM "ticket";
DELETE FROM "sale";
DELETE FROM "customer_order";
DELETE FROM "customer";
DELETE FROM "provider_return";
DELETE FROM "provider";
DELETE FROM "publisher";
DELETE FROM "setting";

COMMIT;

