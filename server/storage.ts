import { users, donations, type User, type InsertUser, type Donation, type InsertDonation } from "@shared/schema";

// Storage interface for user and donation data
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Donation operations
  getDonationsByUserId(userId: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getLatestDonors(limit: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donations: Map<number, Donation>;
  private userCurrentId: number;
  private donationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.donations = new Map();
    this.userCurrentId = 1;
    this.donationCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Donation operations
  async getDonationsByUserId(userId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.userId === userId,
    );
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.donationCurrentId++;
    const donation: Donation = { ...insertDonation, id };
    this.donations.set(id, donation);
    return donation;
  }

  async getLatestDonors(limit: number = 3): Promise<User[]> {
    // Get users with donations, sorted by latest donation date
    const usersWithDonations = Array.from(this.users.values())
      .filter(user => user.lastDonation !== null)
      .sort((a, b) => {
        if (!a.lastDonation) return 1;
        if (!b.lastDonation) return -1;
        return new Date(b.lastDonation).getTime() - new Date(a.lastDonation).getTime();
      });
    
    return usersWithDonations.slice(0, limit);
  }
}

export const storage = new MemStorage();
