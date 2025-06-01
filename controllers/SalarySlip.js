const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const moment =require("moment")

const User = require('../models/user-model');
const UserSalary = require('../models/user-salary');
const Attendance = require('../models/attendance-model');
const Leave = require('../models/leave-model');
const nodeMailer = require('nodemailer');



// exports.salarySlip = async (req, res) => {
//     const { employeeID, month, year } = req.body;

//     try {
//         const user = await User.findById(employeeID);
//         const salary = await UserSalary.findOne({ employeeID });
//         const attendance = await Attendance.find({ employeeID, month, year });

//         // Total attendance days, and calculate present, half-day, and absent days
//         const totalDays = attendance.length;

//         // Check attendance status with case insensitivity and unexpected values
//         const present = attendance.filter(e => e.present && e.present.toLowerCase() === 'present').length; // Full days
//         const halfDays = attendance.filter(e => e.present && e.present.toLowerCase() === 'half-day').length; // Half-days
//         const absent = totalDays - present - halfDays; // Absent days

//         // Fetch Leave records for the employee with approved leaves only
//         const leaveRecords = await Leave.find({ applicantID: employeeID, adminResponse: 'Approved' });

//         // Calculate total leave taken based on approved leave records
//         const totalLeaveTaken = leaveRecords.reduce((acc, leave) => acc + leave.period, 0); // Summing up the leave periods

//         // Leave Balance: Subtract the total leave taken from the user's balance
//         const leaveBalance = user.leaveBalance - totalLeaveTaken; // Leave balance adjusted for the approved leave taken

//         // Dynamic Per-Day Salary Calculation based on the month and year
//         const daysInMonth = new Date(year, month, 0).getDate(); // Get number of days in the given month
//         const perDay = salary.salary / daysInMonth;  // Adjust per-day salary based on month length

//         const earnedSalary = (present + halfDays * 0.5) * perDay;

//         // Calculating PF and ESI for Employee and Company
//         const employeePF = (earnedSalary * 0.12).toFixed(2);
//         const employeeESI = (earnedSalary * 0.0075).toFixed(2);
//         const companyPF = (earnedSalary * 0.13).toFixed(2);
//         const companyESI = (earnedSalary * 0.0325).toFixed(2);

//         // Leave deduction and total deductions
//         const leaveDeduction = ((absent + halfDays * 0.5) * perDay).toFixed(2);
//         const totalDeductions = (
//             parseFloat(leaveDeduction) +
//             parseFloat(employeePF) +
//             parseFloat(employeeESI)
//         ).toFixed(2);

//         // Calculating net salary
//         const netPay = (earnedSalary - totalDeductions + salary.bonus).toFixed(2);

//         // Data for the salary slip
//         const data = {
//             naam: user.name,
//             post: user.desgination,
//             DOJ: user.DOJ,
//             acc: user.account_number,
//             bank: user.bank_name,
//             IFSC: user.ifsc,
//             month,
//             year,
//             totalSalary: salary.salary.toFixed(2),
//             bonus: salary.bonus.toFixed(2),
//             earnedSalary: earnedSalary.toFixed(2),
//             leaveDeduction,
//             halfDays,
//             presentDays: present,
//             totalDays,
//             absentDays: absent,
//             pfEmployee: employeePF,
//             esiEmployee: employeeESI,
//             pfCompany: companyPF,
//             esiCompany: companyESI,
//             totalDeductions,
//             netSalary: netPay,
//             leaveBalance: leaveBalance.toFixed(2)  // Add leave balance here
//         };

//         // Path for the letterhead image
//         const letterheadImage = 'L.png';
//         const imagePath = path.resolve(__dirname, `../storage/later-head/${letterheadImage}`);

//         // Read the letterhead image and convert to base64
//         const imageBuffer = fs.readFileSync(imagePath);
//         const imageBase64 = imageBuffer.toString('base64');
//         const imageSrc = `data:image/png;base64,${imageBase64}`;

//         // Debug logs to check the values
//         console.log("---- SALARY DEBUG ----");
//         console.log("Employee:", user.name);
//         console.log("Month/Year:", month, year);
//         console.log("Total Days:", totalDays);
//         console.log("Present Days:", present);
//         console.log("Half Days:", halfDays);
//         console.log("Absent Days:", absent);
//         console.log("Per Day Salary:", perDay.toFixed(2));
//         console.log("Earned Salary:", earnedSalary.toFixed(2));
//         console.log("Leave Deduction:", leaveDeduction);
//         console.log("Employee PF:", employeePF);
//         console.log("Employee ESI:", employeeESI);
//         console.log("Company PF:", companyPF);
//         console.log("Company ESI:", companyESI);
//         console.log("Total Deductions:", totalDeductions);
//         console.log("Bonus:", salary.bonus);
//         console.log("Net Payable:", netPay);
//         console.log("Leave Balance:", leaveBalance);
//         console.log("------------------------");

//         // HTML for the payslip
//         const html = `
//         <html>
//             <head>
//                 <style>
//                     @page { size: A4; margin: 0; }
//                     body {
//                         font-family: Arial, sans-serif;
//                         background-image: url("${imageSrc}");
//                         background-size: cover;
//                         background-repeat: no-repeat;
//                         background-position: top center;
//                         padding: 130px 40px 40px;
//                         font-size: 11px;
//                         color: #333;
//                     }
//                     .header {
//                         text-align: center;
//                         font-size: 16px;
//                         font-weight: bold;
//                         margin-bottom: 3px;
//                         margin-top:50px
//                     }
//                     .sub-header {
//                         text-align: center;
//                         font-size: 10px;
//                         margin-bottom: 15px;
//                     }
//                     .section-title {
//                         font-size: 12px;
//                         font-weight: bold;
//                         margin-top: 12px;
//                         border-bottom: 1px solid #ccc;
//                         padding-bottom: 3px;
//                     }
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin-top: 6px;
//                         margin-bottom: 12px;
//                         font-size: 10px;
//                     }
//                     td, th {
//                         padding: 4px;
//                         border: 1px solid #ccc;
//                         text-align: left;
//                     }
//                     th { background-color: #f5f5f5; }
//                     .highlight { font-weight: bold; color: #000; }
//                     .net-pay {
//                         text-align: center;
//                         font-size: 13px;
//                         font-weight: bold;
//                         margin-top: 15px;
//                         color: #007b00;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="section-title">Payslip For: ${data.month} ${data.year}</div>
        
//                 <table>
//                     <tr><td><strong>Employee Name</strong></td><td>${data.naam}</td></tr>
//                     <tr><td><strong>Designation</strong></td><td>${data.post}</td></tr>
//                     <tr><td><strong>Date of Joining</strong></td><td>${data.DOJ}</td></tr>
//                     <tr><td><strong>Bank Account No.</strong></td><td>${data.acc}</td></tr>
//                     <tr><td><strong>Bank Name</strong></td><td>${data.bank}</td></tr>
//                     <tr><td><strong>IFSC Code</strong></td><td>${data.IFSC}</td></tr>
//                     <tr><td><strong>Total Days In Month</strong></td><td>${data.totalDays}</td></tr>
//                 </table>
        
//                 <div class="section-title">Leave Balance</div>
//                 <table>
//                     <tr><td><strong>Remaining Leave Balance</strong></td><td>₹${data.leaveBalance}</td></tr>
//                 </table>
        
//                 <div class="section-title">Earnings</div>
//                 <table>
//                     <tr><th>Component</th><th>Amount (₹)</th></tr>
//                     <tr><td>Monthly Salary</td><td>₹${data.totalSalary}</td></tr>
//                     <tr><td>Bonus</td><td>₹${data.bonus}</td></tr>
//                     <tr><td>Earned Salary</td><td>₹${data.earnedSalary}</td></tr>
//                 </table>
        
//                 <div class="section-title">Deductions</div>
//                 <table>
//                     <tr><th>Component</th><th>Amount (₹)</th></tr>
//                     <tr><td>Full Days Present(${data.presentDays})</td><td>₹${data.presentDays * perDay}</td></tr>
//                     <tr><td>Half Day Deductions(${data.halfDays})</td><td>₹${data.halfDays * perDay * 0.5}</td></tr>
//                     <tr><td>Leave Deductions(${data.absentDays})</td><td>₹${data.leaveDeduction}</td></tr>
//                     <tr><td>PF (Employee)</td><td>₹${data.pfEmployee}</td></tr>
//                     <tr><td>ESI (Employee)</td><td>₹${data.esiEmployee}</td></tr>
//                     <tr class="highlight"><td>Total Deductions</td><td>₹${data.totalDeductions}</td></tr>
//                 </table>
        
//                 <div class="section-title">Employer Contributions</div>
//                 <table>
//                     <tr><th>Component</th><th>Amount (₹)</th></tr>
//                     <tr><td>PF (Company)</td><td>₹${data.pfCompany}</td></tr>
//                     <tr><td>ESI (Company)</td><td>₹${data.esiCompany}</td></tr>
//                 </table>
        
//                 <div class="net-pay">NET PAYABLE: ₹${data.netSalary}</div>
//             </body>
//         </html>
//         `;

//         // Puppeteer to generate PDF
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(html, { waitUntil: 'networkidle0' });

//         const fileName = `salary-slip-${employeeID}-${month}-${year}.pdf`;
//         const filePath = path.join(__dirname, '..', 'storage', fileName);

//         await page.pdf({
//             path: filePath,
//             format: 'A4',
//             printBackground: true
//         });

//         await browser.close();

//         res.status(200).json({
//             success: true,
//             message: 'Salary slip generated',
//             file: `/uploads/salary-slip-${employeeID}-${month}-${year}.pdf`
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             message: 'Error generating slip'
//         });
//     }
// };

// Birthday & Anniversary Quotes





exports.salarySlip = async (req, res) => {
  const {
    employeeID,
    month,
    year,
    grossSalary,
    presentDays,
    halfDays,
    absentDays,
    earnedSalary,
    leaveDeduction,
    pf,
    esi,
    companyPf,
    companyEsi,
    totalDeduction,
    netPay
  } = req.body;

  try {
    const user = await User.findById(employeeID);
    const salary = await UserSalary.findOne({ employeeID });

    if (!user || !salary) {
      return res.status(404).json({ success: false, message: "Employee data not found" });
    }

    const leaveBalance = salary.leaveBalance || 0;
    const totalDays = new Date(year, month, 0).getDate();
    const perDay = grossSalary / totalDays;

    // Load Letterhead Image
    const letterheadImage = 'L.png';
    const imagePath = path.resolve(__dirname, `../storage/later-head/${letterheadImage}`);
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageSrc = `data:image/png;base64,${imageBase64}`;

    // Prepare Salary Data
    const data = {
      naam: user.name,
      post: user.desgination,
      DOJ: user.DOJ,
      acc: user.account_number,
      bank: user.bank_name,
      IFSC: user.ifsc,
      month,
      year,
      earnedSalary,
      totalDeduction,
      grossSalary,
      halfDays,
      presentDays,
      totalDays,
      absentDays,
      pfEmployee: pf,
      esiEmployee: esi,
      pfCompany: companyPf,
      esiCompany: companyEsi,
      leaveDeduction,
      netSalary: netPay,
      leaveBalance: leaveBalance.toFixed(2),
      perDay: perDay.toFixed(2),
      totalSalary: grossSalary,
      totalDeductions: totalDeduction
    };

    // Build HTML
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: Arial, sans-serif;
      background-image: url("${imageSrc}");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: top center;
      padding: 130px 40px 40px;
      font-size: 11px;
      color: #333;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      margin-top: 12px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 12px;
      font-size: 10px;
    }
    td, th {
      padding: 4px;
      border: 1px solid #ccc;
      text-align: left;
    }
    th { background-color: #f5f5f5; }
    .highlight { font-weight: bold; color: #000; }
    .net-pay {
      text-align: center;
      font-size: 13px;
      font-weight: bold;
      margin-top: 15px;
      color: #007b00;
    }
  </style>
</head>
<body>
  <div class="section-title">Payslip For: ${data.month} ${data.year}</div>

  <table>
    <tr><td><strong>Employee Name</strong></td><td>${data.naam}</td></tr>
    <tr><td><strong>Designation</strong></td><td>${data.post}</td></tr>
    <tr><td><strong>Date of Joining</strong></td><td>${data.DOJ}</td></tr>
    <tr><td><strong>Bank Account No.</strong></td><td>${data.acc}</td></tr>
    <tr><td><strong>Bank Name</strong></td><td>${data.bank}</td></tr>
    <tr><td><strong>IFSC Code</strong></td><td>${data.IFSC}</td></tr>
    <tr><td><strong>Total Days In Month</strong></td><td>${data.totalDays}</td></tr>
  </table>

  <div class="section-title">Leave Balance</div>
  <table>
    <tr><td><strong>Remaining Leave Balance</strong></td><td>₹${data.leaveBalance}</td></tr>
  </table>

  <div class="section-title">Earnings</div>
  <table>
    <tr><th>Component</th><th>Amount (₹)</th></tr>
    <tr><td>Monthly Salary</td><td>₹${data.totalSalary}</td></tr>
    <tr><td>Bonus</td><td>₹0</td></tr>
    <tr><td>Earned Salary</td><td>₹${data.earnedSalary}</td></tr>
  </table>

  <div class="section-title">Deductions</div>
  <table>
    <tr><th>Component</th><th>Amount (₹)</th></tr>
    <tr><td>Full Days Present (${data.presentDays})</td><td>₹${(data.presentDays * data.perDay).toFixed(2)}</td></tr>
    <tr><td>Half Day Deductions (${data.halfDays})</td><td>₹${(data.halfDays * data.perDay * 0.5).toFixed(2)}</td></tr>
    <tr><td>Leave Deductions (${data.absentDays})</td><td>₹${data.leaveDeduction}</td></tr>
    <tr><td>PF (Employee)</td><td>₹${data.pfEmployee}</td></tr>
    <tr><td>ESI (Employee)</td><td>₹${data.esiEmployee}</td></tr>
    <tr class="highlight"><td>Total Deductions</td><td>₹${data.totalDeductions}</td></tr>
  </table>

  <div class="section-title">Employer Contributions</div>
  <table>
    <tr><th>Component</th><th>Amount (₹)</th></tr>
    <tr><td>PF (Company)</td><td>₹${data.pfCompany}</td></tr>
    <tr><td>ESI (Company)</td><td>₹${data.esiCompany}</td></tr>
  </table>

  <div class="net-pay">NET PAYABLE: ₹${data.netSalary}</div>
</body>
</html>`;

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const fileName = `salary-slip-${employeeID}-${month}-${year}.pdf`;
    const filePath = path.join(__dirname, '..', 'storage', fileName);

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    // Send Email
    const transporter = nodeMailer
    .createTransport({
      service: 'gmail',
      auth: {
        user: 'hr@7unique.in',
        pass: 'bjtv ionr humz bhkx', // 🔐 Use process.env.EMAIL_PASS in real usage
      },
    });

    const mailOptions = {
      from: 'hr@7unique.in',
      to: user.email,
      subject: `Salary Slip for ${month} ${year}`,
      text: `Dear ${user.name},\n\nPlease find attached your salary slip for ${month} ${year}.`,
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Failed to send email:', err);
      } else {
        console.log('✅ Email sent:', info.response);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Salary slip generated and emailed.',
      file: `/storage/${fileName}` // This should be served as static route
    });

  } catch (error) {
    console.error("❌ Salary slip generation failed:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const birthdayQuote = "Wishing you a day filled with happiness and a year filled with joy. Happy Birthday!";
const anniversaryQuote = "Wishing you continued success and happiness on your work anniversary!";

// Get users who have birthday or anniversary today
exports.getTodayEvents = async (req, res) => {
    const today = new Date();
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
    const formatMonthDay = (dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date)) return null;
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${mm}-${dd}`;
    };
  
    try {
      const users = await User.find({});
  
      const events = users.reduce((acc, user) => {
        const dob = user.DOB ? formatMonthDay(user.DOB) : null;
        const doj = user.DOJ ? formatMonthDay(user.DOJ) : null;
  
        if (dob === todayMonthDay) {
          acc.push({
            type: 'birthday',
            name: user.name,
            image: user.image,
            dob: user.DOB,
            quote: birthdayQuote
          });
        }
  
        if (doj === todayMonthDay) {
          acc.push({
            type: 'anniversary',
            name: user.name,
            image: user.image,
            doj: user.DOJ,
            quote: anniversaryQuote
          });
        }
  
        return acc;
      }, []);
  
      res.status(200).json({
        message: 'Events fetched successfully',
        data: events
      });
    } catch (error) {
      console.error('Error fetching today’s events:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


exports.getAttendanceReport = async (req, res) => {
  try {
    const { employeeId, month } = req.body;

    // Parse year and month number
    const year = parseInt(moment(month, "YYYY-MM").format("YYYY"));
    const monthNum = parseInt(moment(month, "YYYY-MM").format("M")); // Note: single 'M' to match DB format

    console.log("📌 Request for:", {
      employeeId,
      month,
      year,
      monthNum,
    });

    // Fetch attendance data
    const attendanceQuery = {
      employeeID: employeeId,
      year,
      month: monthNum,
    };

    const attendanceData = await Attendance.find(attendanceQuery);

    console.log("📘 Attendance Query:", attendanceQuery);
    console.log("📘 Attendance Records Found:", attendanceData.length);

   
    const salaryQuery = {
      employeeID: employeeId,
      
    };

    const userSalary = await UserSalary.findOne(salaryQuery);

    console.log("📗 Salary Query:", salaryQuery);
    console.log("📗 User Salary Found:", userSalary);

    const grossSalary = userSalary ? userSalary.salary : 0;

    // Count attendance
    let presentDays = 0;
    let absentDays = 0;
    let halfDays = 0;
    let absentDates = [];
    let halfDayDates = [];
    let totalWorkingDays = attendanceData.length;

    attendanceData.forEach((record) => {
      const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(record.date).padStart(2, "0")}`;
      if (record.present === "Present") {
        presentDays++;
      } else if (record.present === "Absent") {
        absentDays++;
        absentDates.push(dateStr);
      } else if (record.present === "half-day") {
        halfDays++;
        halfDayDates.push(dateStr);
      }
    });

    const response = {
      employeeId,
      month,
      presentDays,
      absentDays,
      halfDays,
      grossSalary,
      totalWorkingDays,
      absentDates,
      halfDayDates,
    };

    console.log("📦 Final Response:", response);

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in getAttendanceReport:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};






  
  
  
