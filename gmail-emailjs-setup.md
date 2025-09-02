# 📧 Gmail + EmailJS Setup Guide (Marathi + English)

## 🎯 Gmail साठी EmailJS Setup - Complete Guide

### **Step 1: EmailJS Account तयार करा**

1. **Website वर जा:**
   ```
   https://www.emailjs.com/
   ```

2. **Sign Up करा:**
   - "Sign Up" button click करा
   - Email: तुमचा email address enter करा
   - Password: strong password तयार करा
   - "Create Account" click करा

3. **Email Verify करा:**
   - तुमच्या email मध्ये verification link येईल
   - Link वर click करून account verify करा

### **Step 2: Gmail Service Connect करा**

1. **EmailJS Dashboard मध्ये Login करा**

2. **Email Services वर जा:**
   - Left sidebar मध्ये "Email Services" click करा
   - "Add New Service" button दाबा

3. **Gmail Select करा:**
   - Service list मध्ये "Gmail" शोधा
   - Gmail वर click करा
   - "Connect Account" button दाबा

4. **Gmail Authorization:**
   - नवीन tab मध्ये Gmail login page उघडेल
   - तुमचा Gmail account select करा (जो email पाठवण्यासाठी वापरायचा आहे)
   - "Allow" वर click करा सगळ्या permissions साठी:
     - ✅ Read, compose, send, and permanently delete all your email from Gmail
     - ✅ Manage drafts and send emails
   - "Continue" button दाबा

5. **Service ID Copy करा:**
   - Connection successful message दिसेल
   - Service ID दिसेल (Example: `service_gmail_abc123`)
   - **हे ID copy करून notepad मध्ये save करा!**

### **Step 3: Email Template बनवा**

1. **Email Templates Section मध्ये जा:**
   - Left sidebar मध्ये "Email Templates" click करा
   - "Create New Template" button दाबा

2. **Template Information भरा:**
   - **Template Name:** `Teacher Attendance Notification`
   - **From Name:** `BVIT Attendance System`
   - **From Email:** `{{from_email}}` (automatic Gmail address येईल)
   - **To Email:** `{{teacher_email}}`
   - **Subject:** `✅ Attendance Submitted Successfully - {{subject}}`

3. **Template Content (Body):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; margin: 0; font-size: 28px;">
                ✅ Attendance Submitted Successfully!
            </h1>
        </div>

        <!-- Greeting -->
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Dear <strong>{{teacher_name}}</strong>,
        </p>

        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            Your attendance has been submitted successfully to the BVIT system.
        </p>

        <!-- Attendance Details -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #4F46E5; margin-top: 0; margin-bottom: 15px;">📋 Attendance Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">📚 Subject:</td>
                    <td style="padding: 8px 0; color: #333;">{{subject}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">🏫 Class:</td>
                    <td style="padding: 8px 0; color: #333;">{{class_name}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">📅 Date:</td>
                    <td style="padding: 8px 0; color: #333;">{{date}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">🕒 Time:</td>
                    <td style="padding: 8px 0; color: #333;">{{submission_time}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">📝 Type:</td>
                    <td style="padding: 8px 0; color: #333;">{{lecture_type}}</td>
                </tr>
                {{#batch}}
                <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">👥 Batch:</td>
                    <td style="padding: 8px 0; color: #333;">{{batch}}</td>
                </tr>
                {{/batch}}
            </table>
        </div>

        <!-- Attendance Summary -->
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #059669; margin-top: 0; margin-bottom: 15px;">📊 Attendance Summary:</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #10B981; font-weight: bold;">✅ Present:</span>
                <span style="color: #333; font-weight: bold;">{{present_count}} students</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #EF4444; font-weight: bold;">❌ Absent:</span>
                <span style="color: #333; font-weight: bold;">{{absent_count}} students</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4F46E5; font-weight: bold;">📈 Total:</span>
                <span style="color: #333; font-weight: bold;">{{total_students}} students</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #10B981; padding-top: 10px; margin-top: 15px;">
                <span style="color: #059669; font-weight: bold; font-size: 18px;">📊 Attendance:</span>
                <span style="color: #059669; font-weight: bold; font-size: 18px;">{{attendance_percentage}}%</span>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; margin-bottom: 10px;">
                Thank you for using BVIT Attendance Management System!
            </p>
            <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>BVIT Administration</strong>
            </p>
        </div>
    </div>
</div>
```

4. **Template Save करा:**
   - "Save" button click करा
   - Template ID copy करा (Example: `template_attendance_xyz789`)
   - **हे ID notepad मध्ये save करा!**

### **Step 4: Public Key मिळवा**

1. **Account Settings मध्ये जा:**
   - Left sidebar मध्ये "Account" click करा
   - "General" tab select करा

2. **Public Key Copy करा:**
   - "Public Key" section मध्ये key दिसेल
   - Example: `user_abc123xyz`
   - **हे key notepad मध्ये save करा!**

### **Step 5: Configuration Update करा**

आता `teacher-panel.html` file मध्ये configuration update करा:

```javascript
// 📧 EmailJS Configuration - Update with your values
const EMAILJS_CONFIG = {
    publicKey: 'user_abc123xyz',           // तुमची Public Key येथे paste करा
    serviceId: 'service_gmail_abc123',     // तुमची Gmail Service ID येथे paste करा
    templateId: 'template_attendance_xyz789' // तुमची Template ID येथे paste करा
};
```

### **Step 6: Test करा**

1. **Teacher Login करा**
2. **Attendance भरा कोणत्याही class साठी**
3. **Submit करा**
4. **Console check करा:**
   - F12 दाबा browser मध्ये
   - Console tab मध्ये email logs दिसतील
5. **Email check करा teacher च्या Gmail मध्ये**

### **🔧 Example Configuration**

```javascript
// Real Example (तुमच्या values सारखे असेल)
const EMAILJS_CONFIG = {
    publicKey: 'user_kL8mN9pQ2rS',
    serviceId: 'service_gmail_bvit123', 
    templateId: 'template_teacher_attendance'
};
```

### **📧 Gmail Settings (Additional)**

#### **Gmail मध्ये Less Secure Apps Enable करा (जर जुना Gmail आहे):**
1. Gmail Settings → Security
2. "Less secure app access" ON करा
3. किंवा "App passwords" generate करा

#### **2-Factor Authentication:**
- जर 2FA enabled आहे तर "App Password" generate करा
- EmailJS साठी specific app password वापरा

### **🎯 Success Indicators**

#### **EmailJS Dashboard मध्ये:**
- ✅ Service Status: "Connected"
- ✅ Template Status: "Active"
- ✅ Usage Stats दिसतील

#### **Browser Console मध्ये:**
```
📧 EmailJS initialized successfully
📧 Preparing to send attendance email: {...}
✅ Email sent successfully: {status: 200, text: "OK"}
```

#### **Gmail मध्ये:**
- ✅ Professional attendance email received
- ✅ All attendance details included
- ✅ Proper formatting and styling

### **🔍 Troubleshooting**

#### **Email Not Sending?**
1. Check browser console for errors
2. Verify all 3 IDs are correct
3. Check Gmail connection status
4. Ensure teacher email is valid

#### **Template Issues?**
1. Test template in EmailJS dashboard
2. Check variable names match exactly
3. Verify HTML formatting

#### **Gmail Connection Problems?**
1. Re-authorize Gmail access
2. Check Gmail security settings
3. Try different Gmail account

### **💡 Pro Tips**

1. **Test First:** Always test with your own email first
2. **Backup Configuration:** Save all IDs in safe place
3. **Monitor Usage:** Check EmailJS usage limits
4. **Customize Template:** Modify template as per your needs

---

**आता तुमचे Gmail + EmailJS setup complete आहे! Teachers ला automatic emails जातील attendance submit केल्यावर.** 🚀📧
