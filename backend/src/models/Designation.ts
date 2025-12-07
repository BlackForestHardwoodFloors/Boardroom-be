import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Designation = sequelize.define('Designation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'designation',
    timestamps: false,
});

export { Designation };