-- ============================================
-- Database reset script
-- ============================================
-- Keeps: Book table (with stock set to 0)
-- Deletes: all other data (sales, tickets,
--   stock movements, orders, uncatalogued items)
-- ============================================

BEGIN;

-- Preserve book data but reset stock to 0
UPDATE "book" SET stock = 0;

-- Delete all other records (order matters due to FK constraints)
DELETE FROM "ticket_item";
DELETE FROM "ticket";
DELETE FROM "sale";
DELETE FROM "stock_movement";
DELETE FROM "stock_receipt_order_item";
DELETE FROM "stock_receipt_order";
DELETE FROM "uncatalogued";

COMMIT;
