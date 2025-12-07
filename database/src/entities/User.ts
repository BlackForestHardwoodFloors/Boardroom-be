import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Designation } from "./Designation";
import { RolePermission } from "./RolePermission";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
@Entity("users")
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({name: "designation_id", type: "bigint"  })
  designationId: number;

  @ManyToOne(() => Designation)
  @JoinColumn({ name: "designation_id" })
  designation: Designation;

  @Column({ name: "role_and_permission_id", nullable: true })
  roleId: number;

  @ManyToOne(() => RolePermission) 
  @JoinColumn({ name: "role_and_permission_id" }) 
  role: RolePermission;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ name: "created_by" })
  createdBy: number;

  @CreateDateColumn({ name: "created_time" })
  createdTime: Date;

  @Column({ name: "modified_by", nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ name: "modified_time", nullable: true })
  modifiedTime: Date;
}
