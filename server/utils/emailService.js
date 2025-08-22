const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASSWORD || 'testpass'
  }
});

// Email templates
const emailTemplates = {
  applicationStatusUpdate: (data) => ({
    subject: `Application Status Update - ${data.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">JobPortal</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Application Status Update</h2>
          <p>Hello ${data.applicantName},</p>
          <p>Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been updated.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Status: <span style="color: ${data.statusColor};">${data.status}</span></h3>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Application Details:</h4>
            <p><strong>Job:</strong> ${data.jobTitle}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Applied Date:</strong> ${data.appliedDate}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/applications" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The JobPortal Team
          </p>
        </div>
      </div>
    `
  }),

  shortlisted: (data) => ({
    subject: `Congratulations! You've been shortlisted for ${data.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">You've been shortlisted!</h2>
          <p>Hello ${data.applicantName},</p>
          <p>Great news! Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been shortlisted.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0;">What's Next?</h3>
            <p>Our team will review your application further and may contact you for:</p>
            <ul style="color: #065f46;">
              <li>Technical interview</li>
              <li>HR interview</li>
              <li>Additional assessments</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Application Details:</h4>
            <p><strong>Job:</strong> ${data.jobTitle}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Salary Range:</strong> ${data.salaryRange}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/applications" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The ${data.companyName} Team
          </p>
        </div>
      </div>
    `
  }),

  rejected: (data) => ({
    subject: `Application Update - ${data.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Update</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Application Status</h2>
          <p>Hello ${data.applicantName},</p>
          <p>Thank you for your interest in the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates for this position.</p>
            ${data.notes ? `<p><strong>Feedback:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Keep Applying!</h4>
            <p>Don't be discouraged! We encourage you to:</p>
            <ul>
              <li>Continue applying to other positions</li>
              <li>Update your profile and resume</li>
              <li>Network with professionals in your field</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/jobs" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse More Jobs</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The ${data.companyName} Team
          </p>
        </div>
      </div>
    `
  }),

  interviewScheduled: (data) => ({
    subject: `Interview Scheduled - ${data.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">📅 Interview Scheduled</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Interview Invitation</h2>
          <p>Hello ${data.applicantName},</p>
          <p>Congratulations! You've been selected for an interview for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.</p>
          
          <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #581c87; margin-top: 0;">Interview Details:</h3>
            <p><strong>Date:</strong> ${data.interviewDate}</p>
            <p><strong>Time:</strong> ${data.interviewTime}</p>
            <p><strong>Type:</strong> ${data.interviewType}</p>
            ${data.interviewLocation ? `<p><strong>Location:</strong> ${data.interviewLocation}</p>` : ''}
            ${data.interviewLink ? `<p><strong>Meeting Link:</strong> <a href="${data.interviewLink}">${data.interviewLink}</a></p>` : ''}
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Preparation Tips:</h4>
            <ul>
              <li>Research the company and role</li>
              <li>Prepare questions to ask</li>
              <li>Review your resume and application</li>
              <li>Test your equipment (for virtual interviews)</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/applications" style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The ${data.companyName} Team
          </p>
        </div>
      </div>
    `
  })
};

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    'applied': '#3b82f6',
    'reviewing': '#f59e0b',
    'shortlisted': '#10b981',
    'rejected': '#ef4444',
    'interviewed': '#8b5cf6'
  };
  return colors[status] || '#6b7280';
};

// Main email sending function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"JobPortal" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendApplicationStatusUpdate = async (application, newStatus, notes = '') => {
  const data = {
    applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
    jobTitle: application.job.title,
    companyName: application.job.company?.name || 'Company',
    location: application.job.location,
    status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
    statusColor: getStatusColor(newStatus),
    notes: notes,
    appliedDate: new Date(application.createdAt).toLocaleDateString(),
    salaryRange: application.job.salary ? 
      `$${application.job.salary.min?.toLocaleString()} - $${application.job.salary.max?.toLocaleString()}` : 
      'Not specified'
  };

  return await sendEmail(application.applicant.email, 'applicationStatusUpdate', data);
};

const sendShortlistedNotification = async (application, notes = '') => {
  const data = {
    applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
    jobTitle: application.job.title,
    companyName: application.job.company?.name || 'Company',
    location: application.job.location,
    salaryRange: application.job.salary ? 
      `$${application.job.salary.min?.toLocaleString()} - $${application.job.salary.max?.toLocaleString()}` : 
      'Not specified',
    notes: notes
  };

  return await sendEmail(application.applicant.email, 'shortlisted', data);
};

const sendRejectionNotification = async (application, notes = '') => {
  const data = {
    applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
    jobTitle: application.job.title,
    companyName: application.job.company?.name || 'Company',
    notes: notes
  };

  return await sendEmail(application.applicant.email, 'rejected', data);
};

const sendInterviewNotification = async (application, interviewDetails) => {
  const data = {
    applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
    jobTitle: application.job.title,
    companyName: application.job.company?.name || 'Company',
    interviewDate: interviewDetails.date,
    interviewTime: interviewDetails.time,
    interviewType: interviewDetails.type,
    interviewLocation: interviewDetails.location,
    interviewLink: interviewDetails.link
  };

  return await sendEmail(application.applicant.email, 'interviewScheduled', data);
};

module.exports = {
  sendEmail,
  sendApplicationStatusUpdate,
  sendShortlistedNotification,
  sendRejectionNotification,
  sendInterviewNotification,
  emailTemplates
};
