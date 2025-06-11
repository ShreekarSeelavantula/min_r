import { users, type User, type InsertUser, type InsertRecommendation, type Recommendation } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendations(): Promise<Recommendation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recommendations: Map<number, Recommendation>;
  currentId: number;
  currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.recommendations = new Map();
    this.currentId = 1;
    this.currentRecommendationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: Recommendation = { 
      ...insertRecommendation, 
      id,
      userId: insertRecommendation.userId ?? null
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values());
  }
}

export const storage = new MemStorage();
