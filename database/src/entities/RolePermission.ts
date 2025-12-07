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

@Entity("roles_and_permissions")
export class RolePermission {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: "permissions" })
  permissions: string;

  @Column({ name: "organisation_id" })
  organisationId: number;

//   @ManyToOne(() => OrganisationProfile)
//   @JoinColumn({ name: "organisation_id" })
//   organisation: OrganisationProfile;

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
