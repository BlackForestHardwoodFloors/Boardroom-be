import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import sequelize from './src/config/database';

// Import models (ensure models are being initialized properly)
import './src/models/Appointment';
import './src/models/Designation';
import './src/models/RolePermission';
import './src/models/User';
import './src/models/Employee';
import './src/models/Contact';
import './src/models/index';
import './src/models/AddOn';
import './src/models/Attachment';
import './src/models/Contract';
import './src/models/CustomStain';
import './src/models/Departments';
import './src/models/FinishingChoice';
import './src/models/Measurement';
import './src/models/Project';
import './src/models/Quote';
import './src/models/ScopeofWork';
import './src/models/Email';
import './src/models/Units';
import './src/models/Installations';
import './src/models/AdditionalWork';
import './src/models/VendorCompany';
import './src/models/VendorContact';
import './src/models/VendorPrice';
import './src/models/AreaImages';
import './src/models/VendorPriceLogs';
import './src/models/QuoteVendorPricing';
import './src/models/Tax';
import './src/models/WageRate';
import './src/models/Jobs';
import './src/models/GeneralTask';
import './src/models/timeSheet/TimeLogs';
import './src/models/JobsLog';
import './src/models/workOrder/workOrder';
import './src/models/Message';
import './src/models/CompanyModel';
import "./src/models/ContractorContact";
import "./src/models/ContractorCompany";
import "./src/models/ContractorLocations";
import "./src/models/ContractorEmployee";
import "./src/models/Photo";
import "./src/models/ContactPhone";
import "./src/models/ContactEmail";

// Import routes
import userRoutes from './src/routes/userRoutes';
import authRoutes from './src/routes/authRoutes';
import appointmentRoutes from './src/routes/appointmentRoutes';
import employeeRoutes from './src/routes/settings/employeeRoutes';
import contactRoutes from './src/routes/client/contactRoutes';
import companyRoutes from './src/routes/client/companyRoutes';
import locationRoutes from './src/routes/client/locationRoutes';
import quoteRoutes from './src/routes/quotes/quoteRoutes';
import emailRoutes from './src/routes/emailRoutes';
import scopeOfWorkRoutes from './src/routes/scopeOfWorkRoutes';
import departmentRoutes from './src/routes/settings/departmentRoutes';
import rolesRoutes from './src/routes/settings/rolesRoutes';
import unitRoutes from './src/routes/unitRoutes';
import installationRoutes from './src/routes/quotes/installationRoutes';
import additionalWorkRoutes from './src/routes/quotes/additionalWorkRoutes';
import singleContactRoutes from './src/routes/client/singleContactRoutes';
import getEmployeeRoutes from './src/routes/settings/getEmployeeRoutes';
import getScopeOfWorkRoutes from './src/routes/getScopeOfWorkRoutes';
import vendorCompanyRoutes from './src/routes/vendor/vendorCompanyRoutes';
import vendorContactRoutes from './src/routes/vendor/vendorContactRoutes';
import vendorPriceRoutes from './src/routes/vendor/vendorPriceRoutes';
import taxRoutes from './src/routes/settings/taxRoutes';
import contractRoutes from './src/routes/contractRoutes';
import wageRateRoutes from './src/routes/timeSheet/wageRateRoutes';
import jobsRoutes from './src/routes/jobsRoutes';
import generalTaskRoutes from './src/routes/timeSheet/generalTaskRoutes';
import timeLogsRoutes from './src/routes/timeSheet/timeLogsRoutes';
import workOrderRoutes from './src/routes/workOrder/workOrderRoutes';
import smsRoutes from './src/routes/smsRoutes';
import fileRoutes from './src/routes/fileRoutes';
import contractorCompanyRoutes from "./src/routes/contractor/companyRoutes";
import contractorContactRoutes from "./src/routes/contractor/contactRoutes";
import contractorLocationRoutes from "./src/routes/contractor/locationRoutes";
import contractorEmployeeRoutes from "./src/routes/contractor/employeeRoutes";
import quoteItemRoutes from "./src/routes/quoteItemRoutes"
import photoRoutes from "./src/routes/photoRoutes";
import contactPhoneRoutes from "./src/routes/client/contactPhoneRoutes";
import contactEmailRoutes from "./src/routes/client/contactEmailRoutes";

// Import middleware
import { authenticateToken } from './src/middleware/authentication';
import { scheduleTimesheetReminder } from './src/controllers/timeSheet/timesheetReminder';
import { SQSListener } from './src/services/sqsListener';
import { initializeWebSocket } from './src/services/websocketService';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Use routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", authenticateToken, appointmentRoutes);
app.use("/employee", authenticateToken, employeeRoutes);
app.use("/employee", getEmployeeRoutes);
app.use("/contact", authenticateToken, contactRoutes);
app.use("/company", authenticateToken, companyRoutes);
app.use("/contact", singleContactRoutes);
app.use("/location", authenticateToken, locationRoutes);
app.use("/quote", authenticateToken, quoteRoutes);
app.use("/email", emailRoutes);
app.use("/scope", authenticateToken, scopeOfWorkRoutes);
app.use("/scope", getScopeOfWorkRoutes);
app.use("/department", authenticateToken, departmentRoutes);
app.use("/role", authenticateToken, rolesRoutes);
app.use("/unit", authenticateToken, unitRoutes);
app.use("/install", installationRoutes);
app.use("/additional", additionalWorkRoutes);
app.use("/vendorCompany", authenticateToken, vendorCompanyRoutes);
app.use("/vendorContact", authenticateToken, vendorContactRoutes);
app.use("/vendorPrice", authenticateToken, vendorPriceRoutes);
app.use("/tax", authenticateToken, taxRoutes);
app.use("/contract", authenticateToken, contractRoutes);
app.use("/files", authenticateToken, fileRoutes);
app.use("/contractor/company", authenticateToken, contractorCompanyRoutes);
app.use("/contractor/contact", authenticateToken, contractorContactRoutes);
app.use("/contractor/location", authenticateToken, contractorLocationRoutes);
app.use("/contractor/employee", authenticateToken, contractorEmployeeRoutes);
app.use("/quote-items", authenticateToken, quoteItemRoutes);
app.use("/photos", authenticateToken, photoRoutes);
app.use("/contact-phone", authenticateToken, contactPhoneRoutes);
app.use("/contact-email", authenticateToken, contactEmailRoutes);

app.use("/", authenticateToken, wageRateRoutes);
app.use("/", authenticateToken, jobsRoutes);
app.use("/", authenticateToken, generalTaskRoutes);
app.use("/", authenticateToken, timeLogsRoutes);
app.use("/", authenticateToken, workOrderRoutes);
app.use("/", authenticateToken, smsRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

// Error handling middleware (ensure correct signature)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});


const sqsListener = new SQSListener();
sqsListener.startListening().catch(err => {
    console.error('Failed to start SQS listener:', err);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    // sqsListener.stop();
});

initializeWebSocket(server);

// Sync Sequelize and start the server
sequelize.sync({ alter: true }).then(async () => {
  console.log("Database & tables created!");

  // *Start the timesheet reminder schedule
  scheduleTimesheetReminder();
  server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch((error) => {
  console.error('Error syncing the database:', error.message);
});
