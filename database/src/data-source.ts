import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Authentication } from "./entities/Authentication";
import { User } from "./entities/User";
import { VendorAccount } from "./entities/VendorAccount";
import { VendorContact } from "./entities/VendorContact";
import { ClientContact } from "./entities/ClientContact";
import { ClientAccount } from "./entities/ClientAccount";
import { Category } from "./entities/Category";
import { Service } from "./entities/Service";
import { Designation } from "./entities/Designation";
import { RolePermission } from "./entities/RolePermission";
import { Site } from "./entities/Site";


export const AppDataSource = new DataSource({
  type: "mysql",
  driver: require("mysql2"),
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  username: process.env.DATABASE_USERNAME ?? "admin",
  password: process.env.DATABASE_PASSWORD ?? "password",
  database: process.env.DATABASE_NAME ?? "bids_db",
  logging: false,
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    Authentication,
    User,
    VendorAccount,
    VendorContact,
    ClientContact,
    ClientAccount,
    Category,
    Service,
    Designation,
    RolePermission,
    Site
  ],
  cache: { duration: 60000 }, // 120 seconds
});

let isInitialized = false;

export async function initialize() {
  if (isInitialized) {
    return;
  }
  await AppDataSource.initialize();
  isInitialized = true;
}
