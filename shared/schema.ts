import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with blood donation information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  bloodGroup: text("blood_group").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  lastDonation: date("last_donation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Donation history model
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  donationDate: date("donation_date").notNull(),
  location: text("location").notNull(),
  units: integer("units").notNull().default(1),
  status: text("status").notNull().default("completed"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
