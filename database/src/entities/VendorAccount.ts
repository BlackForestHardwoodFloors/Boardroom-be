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

export enum VendorAccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

@Entity("vendor_accounts")
export class VendorAccount {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 50 })
  state: string;

  @Column({ length: 100 })
  country: string;

  @Column({ name: "zip_code", length: 20 })
  zipCode: string;

  @Column({ name: "operational_associate_id", nullable: true })
  operationalAssociateId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "operational_associate_id" })
  operationalAssociate: User;

  @Column({ name: "operational_manager_id", nullable: true })
  operationalManagerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "operational_manager_id" })
  operationalManager: User;

  @Column({ name: "sales_associate_id", nullable: true })
  salesAssociateId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sales_associate_id" })
  salesAssociate: User;

  @Column({ name: "sales_manager_id", nullable: true })
  salesManagerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sales_manager_id" })
  salesManager: User;

  @Column({
    type: "enum",
    enum: VendorAccountStatus,
    default: VendorAccountStatus.ACTIVE
  })
  status: VendorAccountStatus;

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
