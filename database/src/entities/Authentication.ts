import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  
  @Entity("authentication")
  export class Authentication {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column("bigint")
    user_id!: number;
  
    @Column({ type: "varchar", length: 255 })
    email!: string;
  
    @Column({ type: "varchar", length: 255 })
    password!: string;

    @Column({
      type: "enum",
      enum: ["Admin", "Client", "Vendor"]
    })
    type!: string;
  
    @Column("bigint")
    created_by!: number;
  
    @CreateDateColumn()
    created_time!: Date;
  
    @Column("bigint", { nullable: true })
    modified_by!: number | null;
  
    @UpdateDateColumn({ nullable: true })
    modified_time!: Date | null;
  }