import { Appointment } from "./Appointment";
import { Employee } from "./Employee";

Appointment.belongsTo(Employee, {
  foreignKey: 'employeeName',
  targetKey: 'id',
});

Employee.hasMany(Appointment, {
  foreignKey: 'employeeName',
  sourceKey: 'id',
});