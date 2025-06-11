import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userInput: jsonb("user_input").notNull(),
  algorithm: text("algorithm").notNull(),
  results: jsonb("results").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  userId: true,
  userInput: true,
  algorithm: true,
  results: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

// User input schema for the API
export const userInputSchema = z.object({
  skills: z.array(z.string()),
  experience: z.string(),
  location: z.string(),
  education: z.string(),
  businessType: z.enum(['goods', 'service', '']),
  workEnvironment: z.enum(['solo', 'team', '']),
});

export type UserInput = z.infer<typeof userInputSchema>;
