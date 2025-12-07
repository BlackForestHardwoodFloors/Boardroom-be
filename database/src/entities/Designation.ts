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

export enum DesignationStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

@Entity("designation")
export class Designation {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ name: "created_by" })
    createdBy: number;

    @Column({
        type: "enum",
        enum: DesignationStatus,
        default: DesignationStatus.ACTIVE
    })
    status: DesignationStatus;

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
