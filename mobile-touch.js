// Add touch event handlers for mobile
document.addEventListener('DOMContentLoaded', function() {
    // Add touch handlers to all buttons
    function addTouchHandlers() {
        const buttons = document.querySelectorAll('.btn-edit, .btn-delete');
        
        buttons.forEach(button => {
            // Remove old listeners if any
            button.removeEventListener('touchstart', handleTouchStart);
            button.removeEventListener('touchend', handleTouchEnd);
            button.removeEventListener('touchcancel', handleTouchCancel);
            
            // Add new listeners
            button.addEventListener('touchstart', handleTouchStart);
            button.addEventListener('touchend', handleTouchEnd);
            button.addEventListener('touchcancel', handleTouchCancel);
        });
    }

    function handleTouchStart(e) {
        e.preventDefault();
        this.style.opacity = '0.7';
        this.style.transform = 'scale(0.98)';
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
        // Trigger the click after a small delay
        setTimeout(() => this.click(), 50);
    }

    function handleTouchCancel(e) {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    }

    // Initial setup
    addTouchHandlers();

    // Watch for table changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                addTouchHandlers();
            }
        });
    });

    // Start observing the table body
    const tableBody = document.getElementById('teacherTableBody');
    if (tableBody) {
        observer.observe(tableBody, {
            childList: true,
            subtree: true
        });
    }

    // Enhanced error handling
    window.showError = function(error, title = 'Error') {
        console.error(error);
        const message = error.message || error.toString();
        alert(`${title}: ${message}`);
    };

    // Override edit and delete functions with better mobile handling
    window.editTeacher = async function(teacherId) {
        try {
            if (!window.firebase) {
                throw new Error('Firebase not initialized');
            }

            const snapshot = await window.firebase.database().ref('teachers/' + teacherId).once('value');
            const teacher = snapshot.val();
            
            if (!teacher) {
                throw new Error('शिक्षक सापडला नाही');
            }

            // Fill form
            const form = document.getElementById('addTeacherForm');
            if (!form) {
                throw new Error('फॉर्म लोड करताना त्रुटी आली');
            }

            // Fill basic info
            document.getElementById('firstName').value = teacher.firstName || '';
            document.getElementById('lastName').value = teacher.lastName || '';
            document.getElementById('email').value = teacher.email || '';
            document.getElementById('phone').value = teacher.phone || '';

            // Select departments
            const departmentSelect = document.getElementById('departmentSelect');
            if (departmentSelect && teacher.departments) {
                Array.from(departmentSelect.options).forEach(option => {
                    option.selected = teacher.departments.some(dept => dept.code === option.value);
                });
            }

            // Update divisions
            updateDivisionVisibility();
            if (teacher.divisions) {
                teacher.divisions.forEach(div => {
                    const checkbox = document.querySelector(`input[name="division"][value="${div}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            // Select classes
            const classSelect = document.getElementById('classSelect');
            if (classSelect && teacher.classes) {
                Array.from(classSelect.options).forEach(option => {
                    option.selected = teacher.classes.includes(option.value);
                });
            }

            // Smooth scroll to form
            form.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            showError(error, 'शिक्षक एडिट करताना त्रुटी');
        }
    };

    window.deleteTeacher = async function(teacherId) {
        try {
            if (!window.firebase) {
                throw new Error('Firebase not initialized');
            }

            if (!confirm('तुम्हाला खात्री आहे की तुम्ही या शिक्षकाला डिलीट करू इच्छिता?')) {
                return;
            }

            const snapshot = await window.firebase.database().ref('teachers/' + teacherId).once('value');
            const teacher = snapshot.val();
            
            if (!teacher) {
                throw new Error('शिक्षक सापडला नाही');
            }

            await window.firebase.database().ref('teachers/' + teacherId).remove();

            try {
                const userRecord = await window.firebase.auth().getUserByEmail(teacher.email);
                if (userRecord) {
                    await window.firebase.auth().deleteUser(userRecord.uid);
                }
            } catch (authError) {
                console.error('Auth user delete error:', authError);
            }

            alert('शिक्षक यशस्वीरित्या डिलीट केला!');
            window.location.reload();

        } catch (error) {
            showError(error, 'शिक्षक डिलीट करताना त्रुटी');
        }
    };
}); 