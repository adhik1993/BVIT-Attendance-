# 📧 EmailJS Setup Guide for Teacher Attendance Notifications

## 🚀 Step-by-Step Setup Instructions

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider:
   - **Gmail** (Recommended)
   - **Outlook**
   - **Yahoo**
   - Or any SMTP service
4. Follow the connection steps for your provider
5. **Note down your SERVICE ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to "Email Templates" in dashboard
2. Click "Create New Template"
3. Use this template content:

```html
Subject: ✅ Attendance Submitted Successfully - {{subject}}

Dear {{teacher_name}},

Your attendance has been submitted successfully!

📚 Subject: {{subject}}
🏫 Class: {{class_name}}
📅 Date: {{date}}
🕒 Time: {{submission_time}}
📝 Lecture Type: {{lecture_type}}
{{#batch}}👥 Batch: {{batch}}{{/batch}}

📊 Attendance Summary:
✅ Present: {{present_count}} students
❌ Absent: {{absent_count}} students
📈 Total: {{total_students}} students
📊 Percentage: {{attendance_percentage}}%

Thank you for using BVIT Attendance System!

Best regards,
BVIT Administration
```

4. **Note down your TEMPLATE ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Find your **Public Key** (e.g., `user_abc123xyz`)
3. Copy this key

### Step 5: Update Configuration
Open `teacher-panel.html` and update the EmailJS configuration:

```javascript
// 📧 EmailJS Configuration
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY_HERE',     // Replace with your public key
    serviceId: 'YOUR_SERVICE_ID_HERE',     // Replace with your service ID
    templateId: 'YOUR_TEMPLATE_ID_HERE'    // Replace with your template ID
};
```

### Step 6: Test Configuration
1. Login as a teacher
2. Fill attendance for any class
3. Submit attendance
4. Check console for email sending logs
5. Check teacher's email inbox

## 🔧 Configuration Example

```javascript
// Example configuration (replace with your actual values)
const EMAILJS_CONFIG = {
    publicKey: 'user_abc123xyz',
    serviceId: 'service_gmail123',
    templateId: 'template_attendance456'
};
```

## 📧 Email Template Variables

The system automatically sends these variables to the email template:

- `{{teacher_name}}` - Teacher's full name
- `{{teacher_email}}` - Teacher's email address
- `{{subject}}` - Subject name
- `{{class_name}}` - Class code (e.g., SY-CT-A)
- `{{date}}` - Attendance date
- `{{lecture_type}}` - Theory or Practical
- `{{present_count}}` - Number of present students
- `{{absent_count}}` - Number of absent students
- `{{total_students}}` - Total number of students
- `{{attendance_percentage}}` - Attendance percentage
- `{{submission_time}}` - When attendance was submitted
- `{{batch}}` - Batch name (if applicable)

## 🎯 Features

✅ **Automatic Email Notifications** - Teachers get email after attendance submission
✅ **Professional Templates** - Beautiful HTML email format
✅ **Detailed Information** - All attendance details included
✅ **Error Handling** - Graceful fallback if email fails
✅ **Success Confirmation** - Shows email status in success popup
✅ **Free Service** - 5000 emails per month free
✅ **No Backend Required** - Works with frontend only

## 🔍 Troubleshooting

### Email Not Sending?
1. Check browser console for error messages
2. Verify EmailJS configuration values
3. Ensure email service is properly connected
4. Check EmailJS dashboard for usage limits

### Template Not Working?
1. Verify template ID is correct
2. Check template variable names match exactly
3. Test template in EmailJS dashboard

### Service Issues?
1. Verify service ID is correct
2. Check email service connection status
3. Ensure email provider allows third-party access

## 📞 Support

- **EmailJS Documentation**: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **EmailJS Support**: Contact through their dashboard
- **Free Tier Limits**: 5000 emails/month, 50 emails/day

## ✨ Benefits

- **Professional Communication** - Teachers get instant confirmation
- **Record Keeping** - Email serves as attendance submission proof
- **Transparency** - Clear attendance details in email
- **User Experience** - Enhanced feedback for teachers
- **Reliability** - Multiple confirmation methods (popup + email)

---

**Note**: Replace the placeholder values in `EMAILJS_CONFIG` with your actual EmailJS account details to enable email notifications.
