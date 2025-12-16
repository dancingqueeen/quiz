// Enhanced Register Page JavaScript - FIXED VERSION (No Double Click Issue)
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const matchIndicator = document.getElementById('matchIndicator');
    const strengthText = document.getElementById('strengthText');
    const strengthScore = document.getElementById('strengthScore');
    const strengthBars = [
        document.getElementById('strengthBar1'),
        document.getElementById('strengthBar2'),
        document.getElementById('strengthBar3'),
        document.getElementById('strengthBar4'),
        document.getElementById('strengthBar5')
    ];
    const requirements = {
        length: document.getElementById('reqLength'),
        lowercase: document.getElementById('reqLowercase'),
        uppercase: document.getElementById('reqUppercase'),
        number: document.getElementById('reqNumber'),
        special: document.getElementById('reqSpecial')
    };
    const passwordHint = document.getElementById('passwordHint');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('registerForm');
    const themeBtn = document.querySelector('.theme-btn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const progressBar = document.getElementById('progressBar');
    const notificationContainer = document.getElementById('notificationContainer');
    
    // File upload elements
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('profilePicture');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const previewName = document.getElementById('previewName');
    const changePhoto = document.getElementById('changePhoto');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Form is submitting flag
    let isSubmitting = false;
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.querySelector('i').className = 'fas fa-sun';
    } else {
        document.body.classList.add('light-mode');
        themeBtn.querySelector('i').className = 'fas fa-moon';
    }
    
    // Theme toggle
    themeBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
    
    confirmPasswordToggle.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (confirmPasswordInput.type === 'password') {
            confirmPasswordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            confirmPasswordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
    
    // Real-time password strength checking
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
        updateProgressSteps();
    });
    
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    // ========== FIXED: File upload handling ==========
    // SINGLE event listener to prevent double triggers
    fileUploadArea.addEventListener('click', function(e) {
        // Don't trigger if clicking on the file input itself
        if (e.target === fileInput) return;
        
        // Don't trigger if clicking on the preview container
        if (e.target.closest('#previewContainer')) return;
        
        // Don't trigger if clicking on the change photo link
        if (e.target.closest('#changePhoto')) return;
        
        // Only trigger file input if clicking in the main upload area
        fileInput.click();
    });
    
    // Upload button handler
    uploadBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', handleFileUpload);
    
    // Change photo link
    changePhoto.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, () => {
            fileUploadArea.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, () => {
            fileUploadArea.classList.remove('dragover');
        });
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload({ target: fileInput });
        }
    });
    
    // Form submission with simulated loading before actual submit
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent immediate submission
        
        // Prevent double submission
        if (isSubmitting) return;
        
        // Validate form first
        if (!validateForm()) return;
        
        // Set submitting flag
        isSubmitting = true;
        
        // Show loading animation with progress
        showLoading();
        
        // Disable submit button
        submitBtn.disabled = true;
        
        // Simulate processing with progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) { // Go to 90% while "processing"
                progressBar.style.width = `${progress}%`;
            }
        }, 200);
        
        // Wait for animation to complete (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        clearInterval(progressInterval);
        
        // Complete progress bar
        progressBar.style.width = '100%';
        
        // Show success message
        showNotification('Registration successful! Redirecting to login...', 'success');
        
        // Wait 1 second, then submit the form normally
        setTimeout(() => {
            // Submit the form to PHP (which will redirect)
            form.submit();
        }, 1000);
    });
    
    // ========== FUNCTIONS ==========
    
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a JPG, JPEG, or PNG image file', 'error');
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('File size must be less than 2MB', 'error');
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewName.textContent = file.name;
            previewContainer.classList.add('active');
            showNotification('Profile picture uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    }
    
    function checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };
        
        // Calculate score (0-100)
        let score = 0;
        const requirementCount = Object.keys(requirements).length;
        const requirementScore = 100 / requirementCount;
        
        Object.values(requirements).forEach(requirement => {
            if (requirement) score += requirementScore;
        });
        
        // Bonus for length
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;
        
        // Penalty for common patterns
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/12345|qwerty|password/i.test(password)) score -= 20; // Common patterns
        
        // Cap at 100
        score = Math.min(Math.max(Math.round(score), 0), 100);
        
        // Update UI
        updateStrengthUI(requirements, score, password.length);
        
        return { score, requirements };
    }
    
    function updateStrengthUI(requirements, score, length) {
        // Update strength text and color
        let strengthLevel = 'Weak';
        let strengthColor = '#A23C26';
        
        if (score >= 80) {
            strengthLevel = 'Excellent';
            strengthColor = '#4A7729';
        } else if (score >= 60) {
            strengthLevel = 'Strong';
            strengthColor = '#4A7729';
        } else if (score >= 40) {
            strengthLevel = 'Fair';
            strengthColor = '#FFD51C';
        }
        
        strengthText.textContent = strengthLevel;
        strengthText.style.color = strengthColor;
        strengthScore.textContent = `${score}/100`;
        strengthScore.style.color = strengthColor;
        
        // Update strength bars
        const activeBars = Math.ceil((score / 100) * strengthBars.length);
        strengthBars.forEach((bar, index) => {
            bar.style.background = index < activeBars ? strengthColor : '#E0E0E0';
            bar.style.opacity = index < activeBars ? '1' : '0.3';
        });
        
        // Update requirements checklist
        Object.keys(requirements).forEach(key => {
            const req = requirements[key];
            const element = document.getElementById(`req${key.charAt(0).toUpperCase() + key.slice(1)}`);
            const icon = element.querySelector('i');
            const text = element.querySelector('span');
            
            if (req) {
                icon.className = 'fas fa-check-circle';
                icon.style.color = '#4A7729';
                text.style.color = '#4A7729';
                text.style.opacity = '0.7';
            } else {
                icon.className = 'fas fa-times-circle';
                icon.style.color = '#A23C26';
                text.style.color = '#666';
                text.style.opacity = '1';
            }
        });
        
        // Update hint
        updatePasswordHint(length, score);
    }
    
    function updatePasswordHint(length, score) {
        let hint = 'Start typing to see password strength';
        
        if (length === 0) {
            hint = 'Start typing to see password strength';
        } else if (length < 8) {
            hint = 'Make your password longer (at least 8 characters)';
        } else if (score < 40) {
            hint = 'Add more character types for better security';
        } else if (score < 60) {
            hint = 'Good start! Consider adding special characters';
        } else if (score < 80) {
            hint = 'Strong password! Consider making it longer';
        } else {
            hint = 'Excellent! This is a very secure password';
        }
        
        passwordHint.querySelector('span').textContent = hint;
    }
    
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!password || !confirmPassword) {
            matchIndicator.innerHTML = '<i class="fas fa-info-circle"></i><span>Passwords must match</span>';
            matchIndicator.className = 'match-indicator';
            return false;
        }
        
        const isMatch = password === confirmPassword;
        
        if (isMatch) {
            matchIndicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Passwords match</span>';
            matchIndicator.className = 'match-indicator match';
        } else {
            matchIndicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Passwords do not match</span>';
            matchIndicator.className = 'match-indicator no-match';
        }
        
        return isMatch;
    }
    
    function updateProgressSteps() {
        const steps = document.querySelectorAll('.progress-step');
        const inputs = document.querySelectorAll('.reg-form input[required]');
        let filledCount = 0;
        
        inputs.forEach(input => {
            if (input.value.trim()) filledCount++;
        });
        
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < filledCount) {
                step.classList.add('completed');
            }
        });
        
        if (filledCount < steps.length) {
            steps[filledCount].className = 'progress-step active';
        }
    }
    
    function validateForm() {
        // Check password strength
        const strength = checkPasswordStrength(passwordInput.value);
        if (strength.score < 40) {
            showNotification('Please use a stronger password (score: ' + strength.score + '/100)', 'error');
            passwordInput.focus();
            return false;
        }
        
        // Check password match
        if (!checkPasswordMatch()) {
            showNotification('Passwords do not match', 'error');
            confirmPasswordInput.focus();
            return false;
        }
        
        // Check terms
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            showNotification('Please agree to the Terms & Conditions', 'error');
            return false;
        }
        
        return true;
    }
    
    function showLoading() {
        loadingOverlay.classList.add('active');
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline-block';
    }
    
    function hideLoading() {
        loadingOverlay.classList.remove('active');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline-block';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
        progressBar.style.width = '0%';
        isSubmitting = false;
    }
    
    function showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(notif => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Initialize progress steps
    updateProgressSteps();
    
    // Add input focus effects
    document.querySelectorAll('.reg-form input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Show welcome notification on first visit
    const hasVisited = sessionStorage.getItem('registerVisited');
    if (!hasVisited) {
        setTimeout(() => {
            showNotification('Welcome! Create your account to start your adventure.', 'info');
            sessionStorage.setItem('registerVisited', 'true');
        }, 1000);
    }
});