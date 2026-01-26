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
    'CT': { bg: '#E8F5E9', text: '#2E7D32', icon: 'fas fa-laptop-code' },   // Computer
    'IT': { bg: '#E3F2FD', text: '#1565C0', icon: 'fas fa-network-wired' }, // IT
    'ME': { bg: '#FFF3E0', text: '#E65100', icon: 'fas fa-tools' },          // Mechanical
    'CE': { bg: '#F3E5F5', text: '#6A1B9A', icon: 'fas fa-hard-hat' },      // Civil
    'EE': { bg: '#FFEBEE', text: '#C62828', icon: 'fas fa-bolt' },          // Electrical
    'ET': { bg: '#E0F7FA', text: '#00838F', icon: 'fas fa-microchip' },     // E&TC
    'AI': { bg: '#F3E5F5', text: '#4A148C', icon: 'fas fa-brain' }         // AI
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
        departmentSelect.addEventListener('change', function () {
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
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        }

        // Close modal when clicking outside
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // Handle form submission
        const form = document.getElementById('editTeacherForm');
        form.onsubmit = async function (e) {
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
        this.searchInput = document.getElementById('teacherSearch');
        this.allTeachers = null;
        this.teachersCache = null;
        this.teachersCacheTime = 0;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.searchTimer = null;
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


        // Attach listeners to existing elements
        if (this.searchInput) {
            const clearBtn = document.getElementById('clearSearch');

            this.searchInput.addEventListener('input', () => {
                if (clearBtn) {
                    clearBtn.style.display = this.searchInput.value ? 'block' : 'none';
                }
                clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => this.filterTeachers(), 300);
            });

            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.searchInput.value = '';
                    clearBtn.style.display = 'none';
                    this.searchInput.focus();
                    this.filterTeachers();
                });
            }
        }

        const deptFilter = document.getElementById('departmentFilter');
        if (deptFilter) {
            deptFilter.addEventListener('change', () => this.filterTeachers());
        }
    }


    filterTeachers() {
        if (!this.allTeachers) return;

        const searchTerm = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
        const selectedDepartment = document.getElementById('departmentFilter')?.value;

        // Clear existing rows
        if (this.tableBody) this.tableBody.innerHTML = '';

        // If no department selected AND no search term, you can either show ALL or show empty
        // Let's show ALL by default because it's better UX, but keep the department grouping
        const isFiltering = !!selectedDepartment || !!searchTerm;

        // Group teachers by department
        const teachersByDept = {};

        // Helper to add teacher to a department group
        const addToDeptGroup = (deptCode, teacher, id) => {
            const normalized = normalizeDepartmentCode(deptCode) || 'none';
            if (!teachersByDept[normalized]) {
                teachersByDept[normalized] = [];
            }
            // Avoid duplicates in the same department display group
            if (!teachersByDept[normalized].some(t => t.id === id)) {
                teachersByDept[normalized].push({ ...teacher, id });
            }
        };

        // Filter and group teachers
        Object.entries(this.allTeachers).forEach(([id, teacher]) => {
            if (!teacher) return;

            const firstName = teacher.firstName || teacher.name || '';
            const lastName = teacher.lastName || '';
            const email = teacher.email || '';
            const phone = String(teacher.phone || '');
            const teacherFullName = `${firstName} ${lastName}`.trim();
            const teacherId = teacher.teacherId || '';

            // Check match search
            const matchesSearch = !searchTerm ||
                teacherFullName.toLowerCase().includes(searchTerm) ||
                email.toLowerCase().includes(searchTerm) ||
                teacherId.toLowerCase().includes(searchTerm) ||
                phone.includes(searchTerm);

            if (!matchesSearch) return;

            // Get assigned departments
            const teacherDepts = teacher.departments || [];
            const labDepts = teacherDepartments[teacherFullName] || [];

            // Check department match
            let matchesDepartment = !selectedDepartment;
            if (selectedDepartment) {
                const hasDept = teacherDepts.some(d => normalizeDepartmentCode(d.code || d) === selectedDepartment);
                const hasLabDept = labDepts.includes(selectedDepartment);
                matchesDepartment = hasDept || hasLabDept;
            }

            if (matchesDepartment) {
                // Determine which department groups to add this teacher to
                if (isLabFaculty(teacherFullName)) {
                    // Lab faculty show up in their assigned departments
                    const deptsToShow = selectedDepartment ? [selectedDepartment] : labDepts;
                    deptsToShow.forEach(d => addToDeptGroup(d, teacher, id));
                } else if (teacherDepts.length > 0) {
                    // Regular teachers show up in their assigned departments
                    teacherDepts.forEach(d => {
                        const code = d.code || d;
                        if (!selectedDepartment || normalizeDepartmentCode(code) === selectedDepartment) {
                            addToDeptGroup(code, teacher, id);
                        }
                    });
                } else {
                    // No department assigned
                    if (!selectedDepartment || selectedDepartment === 'none') {
                        addToDeptGroup('none', teacher, id);
                    }
                }
            }
        });

        // Display results
        const deptKeys = Object.keys(teachersByDept);
        if (deptKeys.length === 0) {
            this.showEmptyState(searchTerm ? 'शोधलेल्या नावाचा कोणताही शिक्षक सापडला नाही' : 'निवडलेल्या विभागात कोणतेही शिक्षक नाहीत');
            this.updateResultCounter(0, Object.keys(this.allTeachers).length);
            return;
        }

        // Sort and Render
        deptKeys.sort((a, b) => {
            if (a === 'none') return 1;
            if (b === 'none') return -1;
            return getDepartmentFullName(a).localeCompare(getDepartmentFullName(b));
        }).forEach(deptCode => {
            const colors = departmentColors[deptCode] || defaultColors;
            const deptName = deptCode === 'none' ? 'Unassigned' : getDepartmentFullName(deptCode);

            const headerRow = document.createElement('tr');
            headerRow.className = 'department-header';
            headerRow.innerHTML = `
                <td colspan="7">
                    <div class="dept-banner" style="background: ${colors.bg}; color: ${colors.text}; padding: 12px 20px; border-radius: 8px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
                        <div>
                            <i class="${deptCode === 'none' ? 'fas fa-question-circle' : 'fas fa-graduation-cap'}"></i>
                            ${deptName}
                        </div>
                        <span class="badge" style="background: ${colors.text}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">
                            ${teachersByDept[deptCode].length} Entries
                        </span>
                    </div>
                </td>
            `;
            this.tableBody.appendChild(headerRow);

            // Sort and add teachers
            teachersByDept[deptCode].sort((a, b) => {
                const nameA = `${a.firstName || a.name || ''} ${a.lastName || ''}`.trim();
                const nameB = `${b.firstName || b.name || ''} ${b.lastName || ''}`.trim();
                return nameA.localeCompare(nameB);
            }).forEach(teacher => {
                this.addTeacherRow(teacher.id, teacher, isLabFaculty(`${teacher.firstName || teacher.name || ''} ${teacher.lastName || ''}`.trim()));
            });
        });

        // Update stats
        this.updateResultCounter(Object.values(teachersByDept).flat().length, Object.keys(this.allTeachers).length);
    }

    updateResultCounter(filteredEntries, uniqueCount) {
        const counterDiv = document.getElementById('filterResultCounter');
        if (!counterDiv) return;

        // Update dashboard stats
        const totalFaculty = Object.keys(this.allTeachers || {}).length;
        const hodCount = Object.values(this.allTeachers || {}).filter(t => t.role === 'HOD').length;
        const labAssistantCount = Object.values(this.allTeachers || {}).filter(t => t.role === 'Lab Assistant').length;

        document.getElementById('totalFacultyCount').textContent = totalFaculty;
        document.getElementById('hodCount').textContent = hodCount;
        document.getElementById('labAssistantCount').textContent = labAssistantCount;

        counterDiv.innerHTML = `
            <div class="stat-badge" style="background: var(--primary-light); color: var(--primary); border: none; font-weight: 700;">
                <i class="fas fa-search"></i> Found: ${filteredEntries} Entries
            </div>
            ${filteredEntries === 0 ? `
                <div class="stat-badge" style="border-color: var(--danger); color: var(--danger)">
                    <i class="fas fa-exclamation-circle"></i> No matches in this department
                </div>
            ` : ''}
        `;
    }

    showEmptyState(message = 'कोणताही शिक्षक सापडला नाही') {
        if (!this.tableBody) return;
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-container animate-slide">
                        <i class="fas fa-users-viewfinder empty-icon"></i>
                        <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem; letter-spacing: -0.02em;">
                            No Teachers to show
                        </h3>
                        <p style="max-width: 440px; margin: 0 auto; line-height: 1.6; color: var(--text-muted); font-weight: 500;">
                            ${message}
                        </p>
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

        // Check if we have a valid cache
        const now = Date.now();
        if (this.teachersCache && (now - this.teachersCacheTime) < this.CACHE_DURATION) {
            console.log('✅ Pulling teachers from local cache');
            this.allTeachers = this.teachersCache;
            this.filterTeachers();
            return;
        }

        // Set up new listener (using once for initial load to control cache)
        this.teachersRef = window.firebase.database().ref('teachers');
        this.teachersRef.once('value',
            (snapshot) => {
                this.allTeachers = snapshot.val();
                this.teachersCache = this.allTeachers;
                this.teachersCacheTime = Date.now();
                this.filterTeachers();
            },
            (error) => console.error('Teachers fetch error:', error)
        );

        // Optional: Keep live listener but ONLY for background updates, not table refreshes
        this.teachersRef.on('value', (snapshot) => {
            this.allTeachers = snapshot.val();
            this.teachersCache = this.allTeachers;
            this.teachersCacheTime = Date.now();
            // Don't auto-refresh to avoid UI jump, unless we're in a specific state
        });
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
                    teachersByDept[deptCode].push({ id, ...teacher });
                });
            } else {
                // For teachers with no department
                if (!teachersByDept['none']) {
                    teachersByDept['none'] = [];
                }
                teachersByDept['none'].push({ id, ...teacher });
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
                    <div class="dept-banner" style="background: ${colors.bg}; color: ${colors.text};">
                        <div>
                            <i class="${deptCode === 'none' ? 'fas fa-question-circle' : (colors.icon || 'fas fa-graduation-cap')}"></i>
                            ${deptName}
                        </div>
                        <span class="badge" style="background: ${colors.text}; color: white;">
                            ${teachersByDept[deptCode].length} Teachers
                        </span>
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
        if (!this.tableBody) return;

        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        row.style.transition = 'all 0.4s ease-out';

        const firstName = teacher.firstName || teacher.name || 'Unknown';
        const lastName = teacher.lastName || '';
        const initials = `${firstName[0]}${lastName[0] || ''}`.toUpperCase();
        const role = teacher.role || (isLabFaculty ? 'Lab Assistant' : 'Lecturer');
        const roleClass = role === 'HOD' ? 'badge-rose' : (role === 'Lab Assistant' ? 'badge-amber' : 'badge-indigo');
        const isHOD = role === 'HOD';

        // Dynamic avatar color based on name
        const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const avatarColor = isHOD ? '#F59E0B' : colors[firstName.length % colors.length];

        row.innerHTML = `
            <td style="${isHOD ? 'border-left: 4px solid #F59E0B;' : ''}">
                <div class="teacher-profile">
                    <div class="teacher-avatar" style="background: ${avatarColor}20; color: ${avatarColor}; ${isHOD ? 'box-shadow: 0 0 0 2px #F59E0B40;' : ''}">
                        ${initials}
                    </div>
                    <div class="teacher-info-stack">
                        <div class="teacher-name-text">
                            ${firstName} ${lastName}
                            ${isHOD ? '<i class="fas fa-crown" style="color: #F59E0B; margin-left: 4px; font-size: 0.8rem;" title="Department Head"></i>' : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                            <span class="badge ${roleClass}" style="padding: 1px 6px; font-size: 0.65rem;">
                                ${role.toUpperCase()}
                            </span>
                            <span style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all;">${teacher.email || 'No Email'}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-weight: 700; color: var(--primary); font-size: 0.9rem; font-family: 'Outfit', sans-serif;">
                    ${(teacher.teacherId && teacher.teacherId !== '') ? teacher.teacherId : (id?.substring(0, 8) || 'AUTO')}
                </div>
            </td>
            <td>
                <div style="font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main); font-weight: 500;">
                    <i class="fas fa-phone-alt" style="color: var(--secondary); font-size: 0.8rem;"></i>
                    ${teacher.phone || 'N/A'}
                </div>
            </td>
            <td>
                <div class="tag-group">
                    ${teacher.classes ? teacher.classes.map(cls => `<span class="tag">${cls}</span>`).join('') : '<span class="tag">None</span>'}
                </div>
            </td>
            <td>
                <div class="tag-group">
                    ${teacher.divisions && teacher.divisions.length > 0 ? teacher.divisions.map(div => `<span class="tag" style="border-color: var(--primary); color: var(--primary); background: var(--primary-light)">Div ${div}</span>`).join('') : '<span class="tag">N/A</span>'}
                </div>
            </td>
            <td>
                <div class="pass-cell" style="border: 1px dashed var(--border-color); background: transparent; min-width: 100px; display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 6px;">
                    <span style="font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em;">${teacher.initialPassword || '••••••••'}</span>
                    ${teacher.initialPassword ? `
                        <i class="fas fa-copy copy-pill" style="cursor:pointer; color: var(--primary); font-size: 0.8rem;" onclick="copyPassword('${teacher.initialPassword}', this)" title="Copy Password"></i>
                    ` : ''}
                </div>
            </td>
            <td>
                <div class="action-cell" style="display: flex; gap: 0.50rem; justify-content: flex-end;">
                    <button class="icon-btn edit" onclick="updateTeacherDetails('${id}')" title="Edit Teacher">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteTeacher('${id}')" title="Delete Teacher">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        this.tableBody.appendChild(row);

        // Trigger animation
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 50);
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
                    updates[`teachers / ${teacherKey}/teacherId`] = teacherId;

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
        button.addEventListener('touchstart', function (e) {
            e.preventDefault();
            this.style.opacity = '0.8';
        });

        button.addEventListener('touchend', function (e) {
            e.preventDefault();
            this.style.opacity = '1';
            this.click();
        });

        button.addEventListener('touchcancel', function (e) {
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