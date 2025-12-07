import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';


// Define Area Images model
const AreaImages = sequelize.define('AreaImages', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    roomName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    showToClient:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
}, {
    tableName: 'areaImages',
    timestamps: false,
});

AreaImages.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(AreaImages, { foreignKey: 'quoteId' });

export { AreaImages };
