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
import { ClientContact } from "./ClientContact";
import { ClientAccount } from "./ClientAccount";

export enum SiteStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

@Entity("sites")
export class Site {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ name:"site_number", length: 50 })
  siteNumber: string;

  @Column({ name:"location_name", length: 100 })
  locationName: string;

  @Column({ length: 255 })
  street: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 50 })
  state: string;

  @Column({ length: 100 })
  country: string;

  @Column({ name: "zip_code", length: 20 })
  zipCode: string;

  @Column({ name: "map_link"})
  mapLink: string;

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

  @Column({ name: "contact_id", nullable: true })
  contactId: number;

  @ManyToOne(() => ClientContact)
  @JoinColumn({ name: "contact_id" })
  contact: ClientContact;

  @Column({ name: "account_id", nullable: true })
  accountId: number;

  @ManyToOne(() => ClientAccount)
  @JoinColumn({ name: "account_id" })
  account: ClientAccount;

  @Column({
    type: "enum",
    enum: SiteStatus,
    default: SiteStatus.ACTIVE
  })
  status: SiteStatus;

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
