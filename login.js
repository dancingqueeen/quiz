// Password toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get password toggle element
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        // Toggle password visibility
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type');
            
            if (type === 'password') {
                passwordInput.setAttribute('type', 'text');
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                this.setAttribute('title', 'Hide password');
                
                // Add visual feedback
                this.classList.add('active');
            } else {
                passwordInput.setAttribute('type', 'password');
                this.innerHTML = '<i class="fas fa-eye"></i>';
                this.setAttribute('title', 'Show password');
                
                // Remove visual feedback
                this.classList.remove('active');
            }
            
            // Focus back on input for better UX
            passwordInput.focus();
        });
        
        // Add title for accessibility
        passwordToggle.setAttribute('title', 'Show password');
        
        // Add hover effect
        passwordToggle.style.cursor = 'pointer';
        
        // Add keyboard support
        passwordToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Add tabindex for keyboard accessibility
        passwordToggle.setAttribute('tabindex', '0');
    }
});