import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";
import { VendorAccount } from "./VendorAccount";

export enum VendorContactStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

@Entity("vendor_contacts")
export class VendorContact {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ name: "first_name", length: 100 })
  firstName: string;

  @Column({ name: "last_name", length: 100 })
  lastName: string;

  @Column({ name: "vendor_account_id" })
  vendorAccountId: number;

  @ManyToOne(() => VendorAccount)
  @JoinColumn({ name: "vendor_account_id" })
  vendorAccount: VendorAccount;

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

  @Column({ name: "portal_access", default: false })
  portalAccess: boolean;

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
    enum: VendorContactStatus,
    default: VendorContactStatus.ACTIVE
  })
  status: VendorContactStatus;

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
