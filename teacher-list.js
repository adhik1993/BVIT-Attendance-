// Wait for Firebase to be ready
// Use the global waitForFirebase function from firebase-config.js
// No local function needed

// Function to generate a secure random password
function generatePassword() {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Add at least one uppercase letter
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    
    // Add at least one lowercase letter
    password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
    
    // Add at least one number
    password += '0123456789'.charAt(Math.floor(Math.random() * 10));
    
    // Add at least one special character
    password += '!@#$%^&*'.charAt(Math.floor(Math.random() * 8));
    
    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Check if user is admin
async function checkIsAdmin(userId) {
    try {
        const adminSnapshot = await window.firebase.database().ref('admins/' + userId).once('value');
        return adminSnapshot.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Department colors mapping
const departmentColors = {
    'CT': { bg: '#E8F5E9', text: '#2E7D32', icon: '#43A047' },  // Green shades
    'IT': { bg: '#E3F2FD', text: '#1565C0', icon: '#1E88E5' },  // Blue shades
    'ME': { bg: '#FFF3E0', text: '#E65100', icon: '#F57C00' },  // Orange shades
    'CE': { bg: '#F3E5F5', text: '#6A1B9A', icon: '#8E24AA' },  // Purple shades
    'EE': { bg: '#FFEBEE', text: '#C62828', icon: '#EF5350' },  // Red shades
    'ET': { bg: '#E0F7FA', text: '#00838F', icon: '#00ACC1' },  // Cyan shades
    'AI': { bg: '#F3E5F5', text: '#4A148C', icon: '#6A1B9A' }   // Deep Purple shades
};

// Default colors for departments not in the mapping
const defaultColors = { bg: '#F5F5F5', text: '#616161', icon: '#757575' };  // Grey shades

// Department mapping
const departmentFullNames = {
    'CT': 'Computer Technology',
    'IT': 'Information Technology',
    'ME': 'Mechanical Engineering',
    'CE': 'Civil Engineering',
    'EE': 'Electrical Engineering',
    'ET': 'Electronics & Telecommunication',
    'AI': 'Artificial Intelligence'
};

// Function to get department full name
function getDepartmentFullName(code) {
    return departmentFullNames[code] || code;
}

// List of common lab teachers (who teach in all departments)
const commonLabTeachers = ['Pradip Mane', 'Dashrath Yadav'];

// List of lab assistants with their assigned departments
const labAssistants = [
    'SADANANDRAO GAIKWAD',
    'SACHIN TAMBEWAGH',
    'NITISHA KADAM',
    'GAJANAN PAWAR',
    'SUHAS POL',
    'JAGANNATH MORE',
    'PRADIP TORANE',
    'CHHAGAN CHAVAN',
    'AMIT GAVALI',
    'SHAMSHAD SHIKALGAR',
    'CHANDRAKANT PATIL',
    'MARUTI PATIL',
    'RAJENDRA PAWAR',
    'MAHADEV MOHITE',
    'SURAJ LOKHANDE',
    'SAMARJEET SHELKE',
    'DASHRATH YADAV',
    'PRADIP TORANE',
    'SANJAY KANDHARE',
    'PRADIP MANE'  // Added Pradip Mane
];

// Function to check if person is a lab assistant
function isLabAssistant(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`.toUpperCase();
    return labAssistants.includes(fullName);
}

// Function to normalize department code
function normalizeDepartmentCode(code) {
    // Treat CM as CT
    return code === 'CM' ? 'CT' : code;
}

// Function to update roles for all teachers
async function updateTeacherRoles() {
    try {
        const snapshot = await window.firebase.database().ref('teachers').once('value');
        const teachers = snapshot.val();
        
        if (!teachers) return;

        const updates = {};
        
        Object.entries(teachers).forEach(([id, teacher]) => {
            const isAssistant = isLabAssistant(teacher.firstName, teacher.lastName);
            if (isAssistant && (!teacher.role || teacher.role !== 'Lab Assistant')) {
                updates[`teachers/${id}/role`] = 'Lab Assistant';
            } else if (!isAssistant && (!teacher.role || teacher.role !== 'Lecturer')) {
                updates[`teachers/${id}/role`] = 'Lecturer';
            }
        });

        if (Object.keys(updates).length > 0) {
            await window.firebase.database().ref().update(updates);
            console.log('Updated roles for', Object.keys(updates).length, 'teachers');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error updating roles:', error);
        return false;
    }
}

// List of teachers with their assigned departments
const teacherDepartments = {
    'Pradip Mane': ['CT', 'IT', 'ME', 'CE', 'EE', 'ET', 'AI'],
    'Dashrath Yadav': ['CT', 'IT', 'ME', 'CE', 'EE', 'ET', 'AI']
};

// Function to check if teacher is a lab faculty
function isLabFaculty(teacherFullName) {
    return teacherDepartments[teacherFullName] !== undefined;
}

// Function to check if department has mandatory divisions
function departmentHasMandatoryDivisions(code) {
    // Only CT department has mandatory divisions
    return code === 'CT';
}

// Global function to update teacher details
async function updateTeacherDetails(teacherId) {
    try {
        // Get current teacher data
        const snapshot = await window.firebase.database().ref('teachers/' + teacherId).once('value');
        const teacher = snapshot.val();
        
        if (!teacher) {
            alert('Teacher not found!');
            return;
        }

        // Get the modal
        const modal = document.getElementById('editTeacherModal');
        const closeBtn = modal.querySelector('.close');
        
        // Fill form with current data
        document.getElementById('editTeacherId').value = teacherId;
        document.getElementById('editFirstName').value = teacher.firstName;
        document.getElementById('editLastName').value = teacher.lastName;
        document.getElementById('editEmail').value = teacher.email;
        document.getElementById('editPhone').value = teacher.phone;
        document.getElementById('editRole').value = teacher.role || 'Lecturer'; // ✅ FIXED: Added missing role field population

        // Set departments
        const departmentSelect = document.getElementById('editDepartmentSelect');
        Array.from(departmentSelect.options).forEach(option => {
            option.selected = teacher.departments && 
                teacher.departments.some(dept => dept.code === option.value);
        });

        // Show/hide divisions based on whether CT is selected
        const hasCTDepartment = teacher.departments && 
            teacher.departments.some(dept => dept.code === 'CT');
        const divisionGroup = document.querySelector('.edit-divisions');
        divisionGroup.style.display = hasCTDepartment ? 'flex' : 'none';

        // Set divisions only if CT department is selected
        document.querySelectorAll('input[name="editDivision"]').forEach(checkbox => {
            checkbox.checked = hasCTDepartment && teacher.divisions && 
                teacher.divisions.includes(checkbox.value);
        });

        // Set classes
        const classSelect = document.getElementById('editClassSelect');
        Array.from(classSelect.options).forEach(option => {
            option.selected = teacher.classes && teacher.classes.includes(option.value);
        });

        // Add event listener for department changes
        departmentSelect.addEventListener('change', function() {
            const selectedDepts = Array.from(this.selectedOptions).map(opt => opt.value);
            const hasCT = selectedDepts.includes('CT');
            divisionGroup.style.display = hasCT ? 'flex' : 'none';
            if (!hasCT) {
                document.querySelectorAll('input[name="editDivision"]').forEach(cb => cb.checked = false);
            }
        });

        // Show modal
        modal.style.display = 'block';

        // Close modal when clicking (x)
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // Handle form submission
        const form = document.getElementById('editTeacherForm');
        form.onsubmit = async function(e) {
            e.preventDefault();

            try {
                // Get updated data
                const updatedData = {
                    firstName: document.getElementById('editFirstName').value,
                    lastName: document.getElementById('editLastName').value,
                    phone: document.getElementById('editPhone').value,
                    role: document.getElementById('editRole').value, // ✅ FIXED: Added missing role field
                    departments: Array.from(departmentSelect.selectedOptions).map(option => ({
                        code: option.value,
                        name: option.text
                    })),
                    classes: Array.from(classSelect.selectedOptions).map(option => option.value)
                };

                // Only include divisions if CT department is selected
                const hasCTDepartment = updatedData.departments.some(dept => dept.code === 'CT');
                if (hasCTDepartment) {
                    updatedData.divisions = Array.from(document.querySelectorAll('input[name="editDivision"]:checked'))
                        .map(checkbox => checkbox.value);
                } else {
                    updatedData.divisions = []; // Clear divisions if CT is not selected
                }

                // Validate data
                if (!updatedData.firstName || !updatedData.lastName || !updatedData.phone) {
                    alert('सर्व आवश्यक माहिती भरा');
                    return;
                }

                if (updatedData.departments.length === 0) {
                    alert('किमान एक विभाग निवडा');
                    return;
                }

                if (updatedData.classes.length === 0) {
                    alert('किमान एक वर्ग निवडा');
                    return;
                }

                // Validate divisions for CT department
                if (hasCTDepartment && (!updatedData.divisions || updatedData.divisions.length === 0)) {
                    alert('कृपया Computer Technology विभागासाठी किमान एक डिव्हिजन निवडा');
                    return;
                }

                // 🔍 DEBUG: Log what we're trying to save
                console.log('🔍 Updating teacher with data:', updatedData);
                console.log('🔍 Role being saved:', updatedData.role);
                
                // Update in database
                await window.firebase.database().ref('teachers/' + teacherId).update(updatedData);
                
                // 🔍 DEBUG: Verify the update worked
                const verifySnapshot = await window.firebase.database().ref('teachers/' + teacherId).once('value');
                const updatedTeacher = verifySnapshot.val();
                console.log('🔍 After update, teacher data:', updatedTeacher);
                console.log('🔍 Role in database after update:', updatedTeacher.role);
                
                // Show success message
                alert('शिक्षकाची माहिती यशस्वीरित्या अपडेट केली!\n\nRole: ' + updatedData.role);
                
                // Close modal and refresh
                modal.style.display = 'none';
                window.location.reload();

            } catch (error) {
                console.error('Error updating teacher:', error);
                alert('Error: ' + error.message);
            }
        };

    } catch (error) {
        console.error('Error loading teacher details:', error);
        alert('Error: ' + error.message);
    }
}

// Teacher list management
class TeacherList {
    constructor() {
        this.teachersRef = null;
        this.tableBody = document.getElementById('teacherTableBody');
        this.table = document.getElementById('teacherTable');
        this.searchInput = document.getElementById('searchInput');
        this.allTeachers = null;
        this.originalAddTeacherRow = null;
        
        // Show loading state initially
        if (this.tableBody) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:40px; color:#6B7280;">
                        <i class="fas fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i>
                        <p>शिक्षक यादी लोड होत आहे...</p>
                    </td>
                </tr>
            `;
        }
        
        if (!this.tableBody || !this.table) {
            console.error('Required elements not found - tableBody:', !!this.tableBody, 'table:', !!this.table);
            // Don't return, continue with initialization
        }

        // Add department filter
        this.addDepartmentFilter();
        
        // Add search event listener
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterTeachers());
        }
    }

    addDepartmentFilter() {
        // Create filter container
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            align-items: center;
        `;

        // Create department filter
        const departmentFilter = document.createElement('select');
        departmentFilter.id = 'departmentFilter';
        departmentFilter.className = 'department-filter';
        departmentFilter.style.cssText = `
            padding: 8px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.95rem;
            color: var(--text-dark);
            background: white;
            cursor: pointer;
        `;

        // Add default option
        departmentFilter.innerHTML = `
            <option value="">All Departments</option>
            ${Object.entries(departmentFullNames).map(([code, name]) => `
                <option value="${code}">${name}</option>
            `).join('')}
        `;

        // Add filter label
        const filterLabel = document.createElement('label');
        filterLabel.htmlFor = 'departmentFilter';
        filterLabel.innerHTML = '<i class="fas fa-filter"></i> Filter by Department:';
        filterLabel.style.cssText = `
            font-weight: 500;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // Add event listener
        departmentFilter.addEventListener('change', () => this.filterTeachers());

        // Add to container
        filterContainer.appendChild(filterLabel);
        filterContainer.appendChild(departmentFilter);

        // Add to page
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.parentNode.insertBefore(filterContainer, searchContainer);
        }
    }

    filterTeachers() {
        if (!this.allTeachers) return;

        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const selectedDepartment = document.getElementById('departmentFilter')?.value;

        // Clear existing rows
        this.tableBody.innerHTML = '';

        // Group teachers by department
        const teachersByDept = {};
        
        // Initialize all departments (except CM, as it will be merged with CT)
        Object.keys(departmentFullNames)
            .filter(code => code !== 'CM')
            .forEach(deptCode => {
                teachersByDept[deptCode] = [];
            });
        
        // Filter and group teachers
        Object.entries(this.allTeachers).forEach(([id, teacher]) => {
            // Get teacher's full name for search (with null checks)
            const firstName = teacher.firstName || '';
            const lastName = teacher.lastName || '';
            const email = teacher.email || '';
            const phone = String(teacher.phone || ''); // Convert to string to avoid includes error
            const teacherFullName = `${firstName} ${lastName}`.trim();
        
            // Check if teacher matches search term
            const matchesSearch = !searchTerm || 
                firstName.toLowerCase().includes(searchTerm) ||
                lastName.toLowerCase().includes(searchTerm) ||
                teacherFullName.toLowerCase().includes(searchTerm) ||
                email.toLowerCase().includes(searchTerm) ||
                phone.includes(searchTerm);

            // Get assigned departments for this teacher
            const assignedDepartments = teacherDepartments[teacherFullName] || [];

            // Check if teacher matches selected department
            const matchesDepartment = !selectedDepartment || 
                (teacher.departments && teacher.departments.some(dept => 
                    normalizeDepartmentCode(dept.code) === selectedDepartment
                )) ||
                assignedDepartments.includes(selectedDepartment);

            if (matchesSearch && matchesDepartment) {
                // If teacher is a lab faculty, add them to all departments
                if (isLabFaculty(teacherFullName)) {
                    // Add to all departments
                    Object.keys(departmentFullNames)
                        .filter(code => code !== 'CM')
                        .forEach(deptCode => {
                            if (!selectedDepartment || selectedDepartment === deptCode) {
                                if (!teachersByDept[deptCode]) {
                                    teachersByDept[deptCode] = [];
                                }
                                if (!teachersByDept[deptCode].some(t => t.id === id)) {
                                    // Add assigned departments to teacher data
                                    const teacherWithDepts = {
                                        id,
                                        ...teacher,
                                        departments: assignedDepartments.map(code => ({
                                            code,
                                            name: getDepartmentFullName(code)
                                        })),
                                        isLabFaculty: true
                                    };
                                    teachersByDept[deptCode].push(teacherWithDepts);
                                }
                            }
                        });
                } else {
                    // Regular department-wise grouping for other teachers
                    if (selectedDepartment) {
                        if (!teachersByDept[selectedDepartment]) {
                            teachersByDept[selectedDepartment] = [];
                        }
                        if (!teachersByDept[selectedDepartment].some(t => t.id === id)) {
                            teachersByDept[selectedDepartment].push({id, ...teacher});
                        }
                    } else {
                        if (teacher.departments && teacher.departments.length > 0) {
                            teacher.departments.forEach(dept => {
                                const deptCode = normalizeDepartmentCode(dept.code);
                                if (!teachersByDept[deptCode]) {
                                    teachersByDept[deptCode] = [];
                                }
                                if (!teachersByDept[deptCode].some(t => t.id === id)) {
                                    teachersByDept[deptCode].push({id, ...teacher});
                                }
                            });
                        } else {
                            if (!teachersByDept['none']) {
                                teachersByDept['none'] = [];
                            }
                            teachersByDept['none'].push({id, ...teacher});
                        }
                    }
                }
            }
        });

        // Remove empty departments
        Object.keys(teachersByDept).forEach(deptCode => {
            if (teachersByDept[deptCode].length === 0) {
                delete teachersByDept[deptCode];
            }
        });

        // Sort departments
        const sortedDepts = Object.keys(teachersByDept).sort((a, b) => {
            if (a === 'none') return 1;
            if (b === 'none') return -1;
            return getDepartmentFullName(a).localeCompare(getDepartmentFullName(b));
        });

        // Display filtered teachers
        if (Object.keys(teachersByDept).length === 0) {
            this.showEmptyState('No teachers found matching the criteria');
            return;
        }

        // Add teachers to table by department
        sortedDepts.forEach(deptCode => {
            // Get department colors
            const colors = departmentColors[deptCode] || defaultColors;
            
            // Add department header
            const deptName = deptCode === 'none' ? 'Unassigned' : getDepartmentFullName(deptCode);
            const headerRow = document.createElement('tr');
            headerRow.className = 'department-header';
            headerRow.innerHTML = `
                <td colspan="7">
                    <div class="department-header-content" style="
                        background: ${colors.bg};
                        color: ${colors.text};
                        padding: 15px 20px;
                        border-radius: 8px;
                        margin: 10px 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <i class="fas fa-building" style="color: ${colors.icon}"></i>
                        <span style="font-weight: 600;">${deptName}</span>
                        <span class="teacher-count" style="
                            background: ${colors.text};
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            margin-left: 10px;
                        ">${teachersByDept[deptCode].length} Teachers</span>
                    </div>
                </td>
            `;
            this.tableBody.appendChild(headerRow);
            
            // Sort teachers - lab faculty first, then others alphabetically
            const sortedTeachers = teachersByDept[deptCode].sort((a, b) => {
                if (a.isLabFaculty && !b.isLabFaculty) return -1;
                if (!a.isLabFaculty && b.isLabFaculty) return 1;
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            });

            // Add teachers for this department
            sortedTeachers.forEach(teacher => {
                this.addTeacherRow(teacher.id, teacher, teacher.isLabFaculty);
            });
        });
    }

    showEmptyState(message = 'कोणताही शिक्षक सापडला नाही') {
        if (!this.tableBody) {
            console.error('Table body not found');
            return;
        }
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center" style="padding: 40px; color: #EF4444; font-size: 1.1rem;">
                    <div>
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p style="font-size: 1.1rem;">${message}</p>
                    </div>
                </td>
            </tr>
        `;
    }

    async initialize() {
        console.log('Initializing teacher list...');
        try {
            // Wait for Firebase
            await waitForFirebase();
            console.log('Firebase ready');
            
            // Wait for auth state
            const user = await new Promise((resolve) => {
                const unsubscribe = window.firebase.auth().onAuthStateChanged((user) => {
                    unsubscribe();
                    resolve(user);
                });
            });
            
            if (!user) {
                console.error('No user found');
                if (this.tableBody) {
                    this.showEmptyState('कृपया पुन्हा लॉगिन करा');
                }
                setTimeout(() => window.location.href = 'admin-login.html', 2000);
                return;
            }
            console.log('User found:', user.uid);
            
            // Check if admin
            const isAdmin = await checkIsAdmin(user.uid);
            if (!isAdmin) {
                console.error('User is not admin');
                if (this.tableBody) {
                    this.showEmptyState('तुम्हाला या पानाचा अधिकार नाही');
                }
                setTimeout(() => window.location.href = 'admin-login.html', 2000);
                return;
            }
            console.log('Admin verified');
            
            // Update roles first
            await updateTeacherRoles();
            
            // Then set up teachers listener
            this.setupTeachersListener();
            
        } catch (error) {
            console.error('Error initializing teacher list:', error);
            if (this.tableBody) {
                this.showEmptyState('त्रुटी: ' + error.message);
            }
            setTimeout(() => window.location.href = 'admin-login.html', 3000);
        }
    }
    
    setupTeachersListener() {
        console.log('Setting up teachers listener...');
        
        // Remove existing listener if any
        if (this.teachersRef) {
            this.teachersRef.off();
        }
        
        // Set up new listener
        this.teachersRef = window.firebase.database().ref('teachers');
        this.teachersRef.on('value', 
            (snapshot) => {
                this.allTeachers = snapshot.val(); // Store all teachers
                this.filterTeachers(); // Apply current filters
            },
            (error) => console.error('Teachers listener error:', error)
        );
    }
    
    handleTeachersUpdate(snapshot) {
        console.log('Handling teachers update...');
        const teachers = snapshot.val();
        console.log('Teachers data:', teachers);
        
        // Check if tableBody exists
        if (!this.tableBody) {
            console.error('Table body element not found');
            return;
        }
        
        // Clear existing rows
        this.tableBody.innerHTML = '';
        
        if (!teachers || Object.keys(teachers).length === 0) {
            console.log('No teachers found');
            if (this.table) this.table.style.display = 'none';
            this.showEmptyState('कोणताही शिक्षक सापडला नाही');
            return;
        }
        
        // Show table
        this.table.style.display = 'table';
        
        // Group teachers by department
        const teachersByDept = {};
        Object.entries(teachers).forEach(([id, teacher]) => {
            if (teacher.departments && teacher.departments.length > 0) {
                teacher.departments.forEach(dept => {
                    const deptCode = dept.code;
                    if (!teachersByDept[deptCode]) {
                        teachersByDept[deptCode] = [];
                    }
                    teachersByDept[deptCode].push({id, ...teacher});
                });
            } else {
                // For teachers with no department
                if (!teachersByDept['none']) {
                    teachersByDept['none'] = [];
                }
                teachersByDept['none'].push({id, ...teacher});
            }
        });
        
        // Sort departments alphabetically
        const sortedDepts = Object.keys(teachersByDept).sort((a, b) => {
            if (a === 'none') return 1;
            if (b === 'none') return -1;
            return getDepartmentFullName(a).localeCompare(getDepartmentFullName(b));
        });
        
        // Add teachers to table by department
        sortedDepts.forEach(deptCode => {
            // Get department colors
            const colors = departmentColors[deptCode] || defaultColors;
            
            // Add department header
            const deptName = deptCode === 'none' ? 'Unassigned' : getDepartmentFullName(deptCode);
            const headerRow = document.createElement('tr');
            headerRow.className = 'department-header';
            headerRow.innerHTML = `
                <td colspan="7">
                    <div class="department-header-content" style="
                        background: ${colors.bg};
                        color: ${colors.text};
                        padding: 15px 20px;
                        border-radius: 8px;
                        margin: 10px 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <i class="fas fa-building" style="color: ${colors.icon}"></i>
                        <span style="font-weight: 600;">${deptName}</span>
                        <span class="teacher-count" style="
                            background: ${colors.text};
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            margin-left: 10px;
                        ">${teachersByDept[deptCode].length} Teachers</span>
                    </div>
                </td>
            `;
            this.tableBody.appendChild(headerRow);
            
            // Add teachers for this department
            teachersByDept[deptCode].forEach(teacher => {
                this.addTeacherRow(teacher.id, teacher);
            });
        });
        
        // Add styles for department headers
        const style = document.createElement('style');
        style.textContent = `
            .department-header td {
                padding: 0 20px !important;
                border-bottom: none !important;
            }
            .department-header + tr td {
                border-top: none;
            }
            tr:hover {
                background-color: #F8FAFC;
            }
        `;
        document.head.appendChild(style);
        
        console.log('Teachers table updated');
    }
    
    addTeacherRow(id, teacher, isLabFaculty = false) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="teacher-name">
                    ${teacher.firstName} ${teacher.lastName}
                    ${(teacher.role === 'Lab Assistant' || isLabFaculty) ?
                        '<div style="color: #D97706; font-size: 0.9rem; margin-top: 4px;"><i class="fas fa-flask"></i> Lab Assistant</div>' :
                        '<div style="color: #2563EB; font-size: 0.9rem; margin-top: 4px;"><i class="fas fa-chalkboard-teacher"></i> Lecturer</div>'
                    }
                    <div class="teacher-email">${teacher.email}</div>
                </div>
            </td>
            <td>
                <div class="teacher-id-cell">
                    ${(teacher.teacherId && teacher.teacherId !== '') ? teacher.teacherId : (id || 'N/A')}
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <i class="fas fa-phone"></i> ${teacher.phone}
                </div>
            </td>
            <td>
                <div class="department-info">
                    ${teacher.departments ?
                        teacher.departments.map(dept =>
                            `<span class="tag">${dept.name || dept}</span>`
                        ).join('') :
                        '<span class="tag">None</span>'
                    }
                </div>
            </td>
            <td>
                <div class="class-info">
                    ${teacher.classes ?
                        teacher.classes.map(cls =>
                            `<span class="tag">${cls}</span>`
                        ).join('') :
                        '<span class="tag">None</span>'
                    }
                </div>
            </td>
            <td>
                <div class="division-info">
                    ${teacher.divisions ?
                        teacher.divisions.map(div =>
                            `<span class="tag">${div}</span>`
                        ).join('') :
                        '<span class="tag">None</span>'
                    }
                </div>
            </td>
            <td>
                <div class="password-cell">
                    <span class="password-text">${teacher.initialPassword || 'Not Available'}</span>
                    ${teacher.initialPassword ? `
                        <button class="copy-btn" onclick="copyPassword('${teacher.initialPassword}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="updateTeacherDetails('${id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteTeacher('${id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        this.tableBody.appendChild(row);
    }

async initialize() {
    console.log('Initializing teacher list...');
    try {
        // Wait for Firebase
        await waitForFirebase();
        console.log('Firebase ready');
        
        // Wait for auth state
        const user = await new Promise((resolve) => {
            const unsubscribe = window.firebase.auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
        
        if (!user) {
            console.error('No user found');
            window.location.href = 'admin-login.html';
            return;
        }
        console.log('User found:', user.uid);
        
        // Check if admin
        const isAdmin = await checkIsAdmin(user.uid);
        if (!isAdmin) {
            console.error('User is not admin');
            window.location.href = 'admin-login.html';
            return;
        }
        console.log('Admin verified');
        
        // Update roles first
        await updateTeacherRoles();
        
        // Then set up teachers listener
        this.setupTeachersListener();
        
        // Fix existing teachers without teacherId
        await this.fixExistingTeachers();
    } catch (error) {
        console.error('Error initializing teacher list:', error);
    }
}

// Fix existing teachers without teacherId
async fixExistingTeachers() {
    try {
        console.log('Checking for teachers without teacherId...');
        const snapshot = await window.firebase.database().ref('teachers').once('value');
        
        if (!snapshot.exists()) return;
        
        const updates = {};
        const departmentCounts = {};
        
        snapshot.forEach(childSnapshot => {
            const teacher = childSnapshot.val();
            const teacherKey = childSnapshot.key;
            
            // If teacher doesn't have teacherId, generate one
            if (!teacher.teacherId || teacher.teacherId.trim() === '') {
                let deptCode = '';
                if (teacher.departments && teacher.departments.length > 0) {
                    deptCode = typeof teacher.departments[0] === 'string' ? 
                        teacher.departments[0] : teacher.departments[0].code;
                }
                deptCode = deptCode.trim().toUpperCase();
                
                if (!departmentCounts[deptCode]) departmentCounts[deptCode] = 0;
                departmentCounts[deptCode]++;
                
                const teacherId = deptCode + String(departmentCounts[deptCode]).padStart(3, '0');
                updates[`teachers/${teacherKey}/teacherId`] = teacherId;
                
                console.log(`Generated teacherId ${teacherId} for teacher ${teacher.email}`);
            }
        });
        
        if (Object.keys(updates).length > 0) {
            await window.firebase.database().ref().update(updates);
            console.log(`Updated ${Object.keys(updates).length} teachers with teacherId`);
        } else {
            console.log('All teachers already have teacherId');
        }
    } catch (error) {
        console.error('Error fixing existing teachers:', error);
    }
}

} // Close the class

// Add touch event handlers
function addTouchHandlers() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.opacity = '0.8';
        });

        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.opacity = '1';
            this.click();
        });

        button.addEventListener('touchcancel', function(e) {
            this.style.opacity = '1';
        });
    });
}

// Enhanced error handling
function showError(error, title = 'Error') {
    console.error(error);
    const message = error.message || error.toString();
    alert(`${title}: ${message}`);
}

// Enhanced delete teacher function
async function deleteTeacher(teacherId) {
    try {
        if (!window.firebase) {
            throw new Error('Firebase not initialized');
        }

        if (!confirm('तुम्हाला खात्री आहे की तुम्ही या शिक्षकाला डिलीट करू इच्छिता?')) {
            return;
        }
        
        // Get teacher data
        const snapshot = await window.firebase.database().ref('teachers/' + teacherId).once('value');
        const teacher = snapshot.val();
        
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        
        // Delete from database
        await window.firebase.database().ref('teachers/' + teacherId).remove();
        
        // Try to delete from authentication
        try {
            const userRecord = await window.firebase.auth().getUserByEmail(teacher.email);
            if (userRecord) {
                await window.firebase.auth().deleteUser(userRecord.uid);
            }
        } catch (authError) {
            console.error('Error deleting auth user:', authError);
        }
        
        alert('शिक्षक यशस्वीरित्या डिलीट केला!');
        window.location.reload();
        
    } catch (error) {
        showError(error, 'Error deleting teacher');
    }
}

// Update teacher function - completely separate from add teacher
async function editTeacher(teacherId) {
    try {
        // Get current teacher data
        const snapshot = await window.firebase.database().ref('teachers/' + teacherId).once('value');
        const teacher = snapshot.val();
        
        if (!teacher) {
            alert('Teacher not found!');
            return;
        }

        // Update teacher data directly in database
        const updatedData = {
            firstName: prompt('Enter First Name:', teacher.firstName) || teacher.firstName,
            lastName: prompt('Enter Last Name:', teacher.lastName) || teacher.lastName,
            phone: prompt('Enter Phone Number:', teacher.phone) || teacher.phone
        };

        // Keep email and other fields unchanged
        await window.firebase.database().ref('teachers/' + teacherId).update(updatedData);
        
        alert('Teacher updated successfully!');
        window.location.reload();

    } catch (error) {
        console.error('Error updating teacher:', error);
        alert('Error updating teacher: ' + error.message);
    }
}

// Add Teacher Form Submit
document.getElementById('addTeacherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Get selected departments
    const departmentSelect = document.getElementById('departmentSelect');
    const selectedDepartments = Array.from(departmentSelect.selectedOptions).map(option => ({
        code: option.value,
        name: option.text
    }));

    // Get selected classes
    const classSelect = document.getElementById('classSelect');
    const selectedClasses = Array.from(classSelect.selectedOptions).map(option => option.value);

    // Get selected divisions - only if CT department is selected
    const hasCTDepartment = selectedDepartments.some(dept => dept.code === 'CT');
    const divisions = hasCTDepartment ? 
        Array.from(document.querySelectorAll('input[name="division"]:checked')).map(checkbox => checkbox.value) 
        : [];

    // Validate form data
    if (selectedDepartments.length === 0) {
        showErrorMessage('Please select at least one department');
        return;
    }

    if (selectedClasses.length === 0) {
        showErrorMessage('Please select at least one class');
        return;
    }

    // Validate divisions for CT department
    if (hasCTDepartment && divisions.length === 0) {
        showErrorMessage('Please select at least one division for Computer Technology department');
        return;
    }

    try {
        // Add to database
        const password = generatePassword(); // Generate random password

        // --- Teacher ID generation logic ---
        // Fetch all teachers to compute next teacherId
        const teachersSnapshot = await window.firebase.database().ref('teachers').once('value');
        let deptCode = selectedDepartments[0].code;
        let maxNum = 0;
        teachersSnapshot.forEach(snap => {
            const t = snap.val();
            if (t && t.teacherId && t.departments && t.departments.length > 0) {
                const code = (typeof t.departments[0] === 'string') ? t.departments[0] : t.departments[0].code;
                const match = t.teacherId.match(/^([A-Z]+)(\d{3,})$/);
                if (code === deptCode && match) {
                    const num = parseInt(match[2], 10);
                    if (num > maxNum) maxNum = num;
                }
            }
        });
        const teacherId = deptCode + String(maxNum + 1).padStart(3, '0');
        // --- End Teacher ID logic ---

        // Debug: Log what will be saved
        console.log('Generated teacherId:', teacherId);
        console.log('Saving teacher to DB:', {
            firstName, lastName, email, phone, selectedDepartments, selectedClasses, divisions, password, teacherId
        });

        // Ensure teacherId is not empty
        if (!teacherId || teacherId.trim() === '') {
            throw new Error('TeacherId generation failed');
        }

        const teacherData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            departments: selectedDepartments,
            classes: selectedClasses,
            divisions: divisions,
            initialPassword: password,
            role: 'Lecturer',
            teacherId: teacherId,
            createdAt: window.firebase.database.ServerValue.TIMESTAMP
        };

        console.log('Final teacher data:', teacherData);
        await window.firebase.database().ref('teachers').push(teacherData);

        console.log('Teacher saved to DB!');
        alert('शिक्षक यशस्वीरित्या जोडला!\n\nInitial Password: ' + password + '\nTeacher ID: ' + teacherId);
        window.location.reload();

    } catch (error) {
        console.error('Error adding teacher:', error);
        alert('Error adding teacher: ' + error.message);
    }
});

// Initialize touch handlers when document is ready
document.addEventListener('DOMContentLoaded', () => {
    addTouchHandlers();
});

// Re-initialize touch handlers when table content changes
const observer = new MutationObserver(() => {
    addTouchHandlers();
});

// Start observing the table body for changes
const tableBody = document.getElementById('teacherTableBody');
if (tableBody) {
    observer.observe(tableBody, { childList: true, subtree: true });
}

// Initialize teacher list when Firebase is ready
if (window.waitForFirebase) {
    window.waitForFirebase().then(() => {
        console.log('Firebase ready, setting up auth listener...');
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('Auth state ready, initializing teacher list...');
                    if (!window.teacherList) {
                        window.teacherList = new TeacherList();
                    }
                    window.teacherList.initialize();
                }
            });
        } else {
            console.log('Firebase auth not available, initializing teacher list anyway...');
            if (!window.teacherList) {
                window.teacherList = new TeacherList();
            }
            window.teacherList.initialize();
        }
    }).catch((error) => {
        console.error('Firebase initialization failed:', error);
        // Initialize anyway for offline mode
        if (!window.teacherList) {
            window.teacherList = new TeacherList();
        }
        window.teacherList.initialize();
    });
} else {
    console.log('Global waitForFirebase not available, initializing teacher list directly...');
    if (!window.teacherList) {
        window.teacherList = new TeacherList();
    }
    window.teacherList.initialize();
}