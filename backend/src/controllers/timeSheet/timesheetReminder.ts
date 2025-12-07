import moment from "moment";
import { Op } from "sequelize";
import { Employee } from "../../models/Employee";
import { sendEmailUtil } from "../emailController";
import { sendSms } from "../../utils/sendSms";

// Get milliseconds until 6PM PDT
function getMsUntilNext6PM_PDT(): number {
  const nowUTC = moment.utc();
  const nowPDT = nowUTC.clone().subtract(7, 'hours'); // PDT = UTC - 7
  const sixPmToday = nowPDT.clone().set({ hour: 18, minute: 0, second: 0, millisecond: 0 });

  const target = nowPDT.isAfter(sixPmToday) ? sixPmToday.add(1, 'day') : sixPmToday;
  const targetUTC = target.clone().add(7, 'hours');

  return targetUTC.diff(nowUTC);
}

// function getMsUntilNext550PM_IST(): number {
//     const now = moment(); // Local time
//     const nowIST = now.utcOffset(330); // IST = UTC+5:30

//     const fiveFiftyPM = nowIST.clone().set({ hour: 18, minute: 4, second: 0, millisecond: 0 });

//     const targetIST = nowIST.isAfter(fiveFiftyPM)
//         ? fiveFiftyPM.add(1, 'day') // Tomorrow 5:50 PM IST
//         : fiveFiftyPM;

//     // Convert back to current local timezone (or UTC for consistency)
//     const targetUTC = targetIST.clone().utc();

//     return targetUTC.diff(moment.utc()); // Difference from current UTC
// }

async function sendTimesheetReminderEmails() {
    // Only run in production environment
    if (process.env.NODE_ENV !== 'production') {
        console.log("Skipping timesheet reminders in non-production environment");
        return;
    }
    try {
        const employees: any[] = await Employee.findAll({
            where: {
                [Op.or]: [
                    { delete: { [Op.ne]: "Yes" } },
                    { delete: { [Op.is]: null } }
                ]
            },
            attributes: ["firstName", "lastName", "email", "status", "phone"]
        });

        for (const emp of employees) {
            if (emp.status === "Inactive") continue;
            const html = `
            <div style='padding:20px; background-color:#E0D7AB'>
            <div style='text-align:center; margin-bottom:25px'>
            <img src='https://blackforest-assets.s3.us-east-1.amazonaws.com/blackforest_logo.png' alt="logo" style='width:150px'/>
            </div>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'><b>Hi ${emp.firstName} ${emp.lastName},</b></p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>Just a friendly reminder to ensure you've logged your work hours for today. Keeping your timesheets updated helps us track progress accurately and manage projects efficiently.</p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'><b>Already logged your hours?</b> Fantastic! No further action needed.</p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'><b>Need to log now?</b> Please log your time here: <a href="https://portal.blackforestfloors.com/">Timesheet Portal</a></p>
            <p style='line-height:25px; font-size:20px; margin-top:25px; color:#000'>Thanks for your cooperation!</p>
            </div>`;

            if (process.env.EMAIL_REMINDERS_ENABLED === 'true') {
                await sendEmailUtil({
                    to: emp.email,
                    subject: "Friendly Reminder: Log Your Daily Timesheet!",
                    html,
                });
            }
            await sendSms({ message: `Hi ${emp.firstName} ${emp.lastName}, this is a friendly reminder to log your work hours for today. Please log your time here: https://portal.blackforestfloors.com/`, phoneNumber: `+1${emp.phone}` });
        }

        console.log(`✅ Sent daily timesheet reminders to ${employees.length} employees`);
    } catch (error) {
        console.error("❌ Error sending timesheet reminders:", error);
    }
}

export function scheduleTimesheetReminder() {
    const msUntilNextRun = getMsUntilNext6PM_PDT();
    console.log(`⏰ Timesheet reminder will run in ${msUntilNextRun / 60000} minutes`);

    setTimeout(async () => {
        const todayUTC = moment.utc();
        const dayOfWeek = todayUTC.clone().subtract(7, 'hours').day(); // Convert to PDT and get day

        // day() returns 0 for Sunday, 6 for Saturday
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Monday (1) to Friday (5)
            await sendTimesheetReminderEmails();
        } else {
            console.log("📆 It's the weekend! Skipping timesheet reminder.");
        }

        // Re-schedule for next day
        scheduleTimesheetReminder();
    }, msUntilNextRun);
}