import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ name: "service_name", length: 255 })
  name: string;

  @Column({ name: "description" })
  description: string;

  @Column({
    type: "enum",
    enum: ServiceStatus,
    default: ServiceStatus.ACTIVE
  })
  status: ServiceStatus;

  @Column({ name: "category_id" })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column({ name: "created_by" })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

  @CreateDateColumn({ name: "created_time" })
  createdTime: Date;

  @Column({ name: "modified_by", nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ name: "modified_time", nullable: true })
  modifiedTime: Date;
}
