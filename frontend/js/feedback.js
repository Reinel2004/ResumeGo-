// Feedback functionality for ResumeGo
class FeedbackSystem {
    constructor() {
        this.init();
    }

    init() {
        // Get DOM elements
        this.feedbackLink = document.getElementById('feedbackLink');
        this.feedbackModal = document.getElementById('feedbackModal');
        this.closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
        this.cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
        this.feedbackForm = document.getElementById('feedbackForm');
        this.submitFeedbackBtn = document.getElementById('submitFeedbackBtn');

        if (!this.feedbackLink || !this.feedbackModal) {
            console.warn('Feedback elements not found');
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Open feedback modal
        this.feedbackLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.feedbackModal.classList.remove('hidden');
        });

        // Close feedback modal
        this.closeFeedbackBtn.addEventListener('click', () => this.closeFeedbackModal());
        this.cancelFeedbackBtn.addEventListener('click', () => this.closeFeedbackModal());

        // Close modal when clicking outside
        this.feedbackModal.addEventListener('click', (e) => {
            if (e.target === this.feedbackModal) {
                this.closeFeedbackModal();
            }
        });

        // Handle form submission
        this.feedbackForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    closeFeedbackModal() {
        this.feedbackModal.classList.add('hidden');
        this.feedbackForm.reset();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        if (!toast || !toastMessage || !toastIcon) return;

        toastMessage.textContent = message;

        if (type === 'success') {
            toast.classList.add('border-green-500');
            toastIcon.innerHTML = `
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            `;
        } else {
            toast.classList.add('border-red-500');
            toastIcon.innerHTML = `
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
        }

        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('border-green-500', 'border-red-500');
        }, 5000);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.feedbackForm);
        const feedbackData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Disable submit button and show loading state
        this.submitFeedbackBtn.disabled = true;
        this.submitFeedbackBtn.textContent = 'Sending...';

        try {
            const response = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showToast('Your feedback has been sent!', 'success');
                this.closeFeedbackModal();
            } else {
                this.showToast(result.message || 'Failed to send feedback. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            this.showToast('Failed to send feedback. Please try again.', 'error');
        } finally {
            // Reset button state
            this.submitFeedbackBtn.disabled = false;
            this.submitFeedbackBtn.textContent = 'Send Feedback';
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackSystem();
});
