-- Add fully_sold_out value to PropertyStatus enum
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'fully_sold_out' AFTER 'fully_allocated';
