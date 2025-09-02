# 📧 BVIT Email Template Setup Guide

## 🚀 Complete EmailJS Template Configuration

### **Step 1: EmailJS Dashboard मध्ये जा**
```
🌐 Website: https://dashboard.emailjs.com/
📧 Login: तुमचा EmailJS account
```

### **Step 2: Email Template तयार करा**

#### **A) Templates Section:**
```
Dashboard → Left Sidebar → "Email Templates" → "Create New Template"
```

#### **B) Template Settings भरा:**
```
Template Name: BVIT Teacher Attendance Notification
From Name: BVIT Attendance System
From Email: {{from_email}}
To Email: {{teacher_email}}
Subject: ✅ Attendance Submitted Successfully - {{subject}}
```

### **Step 3: Template Content Copy करा**

#### **HTML Content (bvit-email-template.html मधून copy करा):**

**File Location:** `d:\BHARAT\public\bvit-email-template.html`

**Template Variables Used:**
- `{{teacher_name}}` - Teacher's full name
- `{{teacher_email}}` - Teacher's email address  
- `{{subject}}` - Subject name
- `{{class_name}}` - Class code (e.g., SY-CT-A)
- `{{date}}` - Attendance date
- `{{submission_time}}` - When attendance was submitted
- `{{lecture_type}}` - Theory or Practical
- `{{batch}}` - Batch name (optional)
- `{{present_count}}` - Number of present students
- `{{absent_count}}` - Number of absent students
- `{{total_students}}` - Total number of students
- `{{attendance_percentage}}` - Attendance percentage

### **Step 4: Template Save करा**
```
✅ "Save" Button दाबा
📝 Template ID Copy करा: template_abc123xyz
💾 हे ID Save करा!
```

### **Step 5: Configuration Update करा**

#### **teacher-panel.html मध्ये update करा:**
```javascript
// 📧 EmailJS Configuration
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',           // 👆 तुमची Public Key
    serviceId: 'YOUR_SERVICE_ID',           // 👆 तुमची Gmail Service ID  
    templateId: 'template_abc123xyz'        // 👆 तुमची Template ID (Step 4 मधून)
};
```

### **Step 6: Test Template**

#### **Browser Console मध्ये test करा:**
```javascript
emailjs.send('YOUR_SERVICE_ID', 'template_abc123xyz', {
    teacher_name: 'Rajesh Kumar',
    teacher_email: 'teacher@bvit.edu',
    subject: 'COMPUTER NETWORKS',
    class_name: 'SY-CT-A',
    date: '7 August, 2025',
    submission_time: '10:30 AM',
    lecture_type: 'Theory',
    batch: 'Batch A',
    present_count: 25,
    absent_count: 5,
    total_students: 30,
    attendance_percentage: 83
}).then(response => {
    console.log('✅ Email Sent Successfully:', response);
}).catch(error => {
    console.error('❌ Email Failed:', error);
});
```

### **Step 7: Expected Email Preview**

#### **Subject:**
```
✅ Attendance Submitted Successfully - COMPUTER NETWORKS
```

#### **Email Content:**
```
✅ Attendance Submitted Successfully!
BVIT Attendance Management System

Dear Rajesh Kumar,

Your attendance has been successfully submitted to the BVIT system. 
Here are the complete details:

📋 Attendance Details
📚 Subject: COMPUTER NETWORKS
🏫 Class: SY-CT-A
📅 Date: 7 August, 2025
🕒 Time: 10:30 AM
📝 Lecture Type: Theory
👥 Batch: Batch A

📊 Attendance Summary
✅ Present: 25 students
❌ Absent: 5 students
📈 Total: 30 students
📊 Overall: 83%

Thank you for using BVIT Attendance Management System!
BVIT Administration
```

### **🎯 Template Features:**

#### **Professional Design:**
- ✅ Modern purple gradient header
- ✅ BVIT branding and colors
- ✅ Clean, professional layout
- ✅ Mobile responsive design

#### **Complete Information:**
- ✅ Teacher name and greeting
- ✅ All attendance details
- ✅ Visual attendance summary
- ✅ Percentage with progress bar
- ✅ Professional footer

#### **Visual Elements:**
- ✅ Color-coded stats (Green/Red/Blue)
- ✅ Icons for each detail
- ✅ Progress bar for percentage
- ✅ Professional cards layout

### **📋 Setup Checklist:**

#### **EmailJS Dashboard:**
- ✅ Gmail Service: Connected
- ✅ Email Template: Created and Active
- ✅ Template ID: Copied
- ✅ Test Email: Sent Successfully

#### **Code Configuration:**
- ✅ Public Key: Updated
- ✅ Service ID: Updated  
- ✅ Template ID: Updated
- ✅ Test: Successful

#### **Email Received:**
- ✅ Professional design
- ✅ All variables populated
- ✅ Correct formatting
- ✅ BVIT branding

### **🔧 Troubleshooting:**

#### **Template Not Working:**
1. Check all variable names match exactly
2. Verify Template ID is correct
3. Test with simple content first
4. Check EmailJS dashboard for errors

#### **Variables Not Showing:**
1. Ensure double curly braces: `{{variable_name}}`
2. Check variable names match code
3. Test with static values first
4. Verify template is saved

#### **Email Not Sending:**
1. Check Service ID and Template ID
2. Verify Gmail service is connected
3. Check browser console for errors
4. Test with EmailJS dashboard

---

**आता तुमचे professional BVIT email template ready आहे!** 🚀📧

**फक्त EmailJS मध्ये template create करा, IDs update करा, आणि test करा!**
