/* ============================================
   WEBDEV Client Onboarding Form - JavaScript
   ============================================ */

(function () {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    const CONFIG = {
        totalSteps: 8,
        recipientEmail: 'd3skdevelopers@gmail.com',
        draftKey: 'webdev_onboarding_draft',
        stepNames: [
            'Business',
            'Content',
            'Design',
            'Functionality',
            'Technical',
            'Assets',
            'Audience',
            'Legal'
        ]
    };

    // ============================================
    // State
    // ============================================
    let currentStep = 1;

    // ============================================
    // DOM Elements
    // ============================================
    const form = document.getElementById('onboardingForm');
    const progressFill = document.getElementById('progressFill');
    const stepIndicators = document.getElementById('stepIndicators');
    const saveDraftBtn = document.getElementById('saveDraft');
    const showSummaryBtn = document.getElementById('showSummary');
    const submitBtn = document.getElementById('submitBtn');
    const summarySection = document.getElementById('summarySection');
    const summaryContent = document.getElementById('summaryContent');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');
    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');

    // ============================================
    // Initialize
    // ============================================
    document.addEventListener('DOMContentLoaded', function () {
        buildStepIndicators();
        updateProgress();
        attachEventListeners();
        setupConditionalInputs();
        loadDraft();
    });

    // ============================================
    // Build Step Indicators
    // ============================================
    function buildStepIndicators() {
        if (!stepIndicators) return;
        stepIndicators.innerHTML = '';
        CONFIG.stepNames.forEach(function (name, index) {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator';
            indicator.dataset.step = index + 1;
            indicator.textContent = name;
            if (index + 1 === currentStep) {
                indicator.classList.add('active');
            }
            stepIndicators.appendChild(indicator);
        });
    }

    // ============================================
    // Update Progress Bar
    // ============================================
    function updateProgress() {
        const percent = (currentStep / CONFIG.totalSteps) * 100;
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }

        document.querySelectorAll('.step-indicator').forEach(function (indicator) {
            const step = parseInt(indicator.dataset.step, 10);
            indicator.classList.remove('active', 'completed');
            if (step < currentStep) {
                indicator.classList.add('completed');
            } else if (step === currentStep) {
                indicator.classList.add('active');
            }
        });
    }

    // ============================================
    // Attach Event Listeners
    // ============================================
    function attachEventListeners() {
        // Next buttons
        document.querySelectorAll('.btn-next').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const nextStep = this.dataset.next;
                if (validateCurrentStep()) {
                    goToStep(nextStep);
                }
            });
        });

        // Previous buttons
        document.querySelectorAll('.btn-prev').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const prevStep = this.dataset.prev;
                goToStep(prevStep, true);
            });
        });

        // Save draft
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', saveDraft);
        }

        // Show summary
        if (showSummaryBtn) {
            showSummaryBtn.addEventListener('click', function () {
                if (validateCurrentStep()) {
                    generateSummary();
                    summarySection.style.display = 'block';
                    summarySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }

        // Submit
        if (submitBtn) {
            submitBtn.addEventListener('click', handleSubmit);
        }

        // Close modal
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function () {
                successModal.classList.remove('active');
            });
        }

        // Close modal on outside click
        if (successModal) {
            successModal.addEventListener('click', function (e) {
                if (e.target === successModal) {
                    successModal.classList.remove('active');
                }
            });
        }

        // Privacy / Terms links
        if (privacyLink) {
            privacyLink.addEventListener('click', function (e) {
                e.preventDefault();
                alert('Privacy Policy:\n\nWe collect your information solely for the purpose of understanding your website needs and providing a proposal. Your data is confidential and will not be shared with third parties.');
            });
        }

        if (termsLink) {
            termsLink.addEventListener('click', function (e) {
                e.preventDefault();
                alert('Terms of Use:\n\nBy submitting this form, you agree to be contacted by WEBDEV regarding your project. All information provided is confidential. Submission does not constitute a binding contract.');
            });
        }

        // Clear error on input
        form.addEventListener('input', function (e) {
            if (e.target.classList.contains('error')) {
                e.target.classList.remove('error');
            }
        });

        // Clear error on change (for selects/radios)
        form.addEventListener('change', function (e) {
            if (e.target.classList.contains('error')) {
                e.target.classList.remove('error');
            }
        });

        // Save draft on beforeunload
        window.addEventListener('beforeunload', function () {
            saveDraftSilent();
        });
    }

    // ============================================
    // Setup Conditional Inputs
    // ============================================
    function setupConditionalInputs() {
        // Enable/disable inline inputs based on radio selection
        const domainRadios = document.querySelectorAll('input[name="domain"]');
        const domainNameInput = document.querySelector('input[name="domain_name"]');

        if (domainNameInput) {
            domainNameInput.disabled = true;
            domainRadios.forEach(function (radio) {
                radio.addEventListener('change', function () {
                    domainNameInput.disabled = this.value !== 'yes';
                    if (this.value !== 'yes') {
                        domainNameInput.value = '';
                    }
                });
            });
        }

        // Specific date input
        const timelineSelect = document.getElementById('timeline');
        const specificDateInput = document.querySelector('input[name="specific_date"]');

        if (timelineSelect && specificDateInput) {
            specificDateInput.disabled = true;
            timelineSelect.addEventListener('change', function () {
                specificDateInput.disabled = this.value !== 'specific';
                if (this.value !== 'specific') {
                    specificDateInput.value = '';
                }
            });
        }
    }

    // ============================================
    // Navigate to Step
    // ============================================
    function goToStep(stepId, isBack) {
        const targetStep = document.getElementById(stepId);
        if (!targetStep) return;

        // Hide all steps
        document.querySelectorAll('.form-step').forEach(function (step) {
            step.classList.remove('active');
        });

        // Show target step
        targetStep.classList.add('active');

        // Update current step number
        const stepNum = parseInt(stepId.replace('step', ''), 10);
        currentStep = stepNum;
        updateProgress();

        // Scroll to top of form
        window.scrollTo({
            top: document.querySelector('.progress-container').offsetTop - 20,
            behavior: 'smooth'
        });

        // Re-enable conditional inputs if going back
        if (isBack) {
            reapplyConditionalStates();
        }
    }

    // ============================================
    // Reapply Conditional States
    // ============================================
    function reapplyConditionalStates() {
        // Domain
        const domainNameInput = document.querySelector('input[name="domain_name"]');
        const domainYes = document.querySelector('input[name="domain"][value="yes"]');
        if (domainNameInput && domainYes) {
            domainNameInput.disabled = !domainYes.checked;
        }

        // Timeline
        const specificDateInput = document.querySelector('input[name="specific_date"]');
        const timelineSelect = document.getElementById('timeline');
        if (specificDateInput && timelineSelect) {
            specificDateInput.disabled = timelineSelect.value !== 'specific';
        }
    }

    // ============================================
    // Validation
    // ============================================
    function validateCurrentStep() {
        const currentStepEl = document.getElementById('step' + currentStep);
        if (!currentStepEl) return true;

        let isValid = true;
        let firstError = null;

        // Clear previous errors
        currentStepEl.querySelectorAll('.error').forEach(function (el) {
            el.classList.remove('error');
        });

        // Check required text/select/textarea inputs
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        requiredInputs.forEach(function (input) {
            if (input.type === 'radio') {
                const radioGroup = currentStepEl.querySelectorAll('input[name="' + input.name + '"]');
                const checked = Array.from(radioGroup).some(function (r) { return r.checked; });
                if (!checked) {
                    isValid = false;
                    radioGroup.forEach(function (r) { r.classList.add('error'); });
                    if (!firstError) firstError = radioGroup[0];
                }
            } else if (input.type === 'checkbox') {
                if (!input.checked) {
                    isValid = false;
                    input.classList.add('error');
                    if (!firstError) firstError = input;
                }
            } else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!input.value.trim() || !emailRegex.test(input.value.trim())) {
                    isValid = false;
                    input.classList.add('error');
                    if (!firstError) firstError = input;
                }
            } else {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    if (!firstError) firstError = input;
                }
            }
        });

        // Custom validation for specific steps
        if (currentStep === 1) {
            // Check at least one goal selected
            const goals = currentStepEl.querySelectorAll('input[name="goals"]:checked');
            if (goals.length === 0) {
                isValid = false;
                if (!firstError) firstError = currentStepEl.querySelector('input[name="goals"]');
                showError(currentStepEl.querySelector('input[name="goals"]'), 'Please select at least one goal.');
            }
        }

        if (currentStep === 2) {
            // Check at least one page selected
            const pages = currentStepEl.querySelectorAll('input[name="pages"]:checked');
            if (pages.length === 0) {
                isValid = false;
                if (!firstError) firstError = currentStepEl.querySelector('input[name="pages"]');
                showError(currentStepEl.querySelector('input[name="pages"]'), 'Please select at least one page.');
            }
        }

        if (currentStep === 4) {
            // Check at least one functionality selected
            const funcs = currentStepEl.querySelectorAll('input[name="functionality"]:checked');
            if (funcs.length === 0) {
                isValid = false;
                if (!firstError) firstError = currentStepEl.querySelector('input[name="functionality"]');
                showError(currentStepEl.querySelector('input[name="functionality"]'), 'Please select at least one functionality.');
            }
        }

        if (currentStep === 8) {
            // Check agree checkbox
            const agree = document.getElementById('agreeCheckbox');
            if (agree && !agree.checked) {
                isValid = false;
                agree.classList.add('error');
                if (!firstError) firstError = agree;
            }
        }

        if (!isValid && firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }

        return isValid;
    }

    // ============================================
    // Show Error Message
    // ============================================
    function showError(element, message) {
        if (!element) return;
        element.classList.add('error');

        // Remove existing error message
        const parent = element.closest('.form-group') || element.closest('.checkbox-group') || element.parentElement;
        const existing = parent.querySelector('.error-message');
        if (existing) existing.remove();

        // Add new error message
        const errorMsg = document.createElement('small');
        errorMsg.className = 'error-message';
        errorMsg.style.color = 'var(--danger)';
        errorMsg.style.display = 'block';
        errorMsg.style.marginTop = '6px';
        errorMsg.style.fontWeight = '500';
        errorMsg.textContent = message;

        if (parent) {
            parent.appendChild(errorMsg);
        }
    }

    // ============================================
    // Collect Form Data
    // ============================================
    function collectFormData() {
        const data = {};

        // Text, email, url, date, select, textarea
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], input[type="date"], select, textarea').forEach(function (input) {
            if (input.name) {
                data[input.name] = input.value.trim();
            }
        });

        // Radio buttons
        form.querySelectorAll('input[type="radio"]:checked').forEach(function (radio) {
            data[radio.name] = radio.value;
        });

        // Checkboxes - group by name
        form.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
            if (checkbox.name && checkbox.name !== 'agree') {
                if (!data[checkbox.name]) {
                    data[checkbox.name] = [];
                }
                if (checkbox.checked) {
                    data[checkbox.name].push(checkbox.value);
                }
            }
        });

        // Agree checkbox
        const agree = document.getElementById('agreeCheckbox');
        if (agree) {
            data.agree = agree.checked;
        }

        return data;
    }

    // ============================================
    // Generate Summary
    // ============================================
    function generateSummary() {
        const data = collectFormData();
        const labels = getFieldLabels();
        let html = '';

        Object.keys(data).forEach(function (key) {
            if (key === 'agree') return;
            const value = data[key];
            if (value === '' || value === null || value === undefined) return;
            if (Array.isArray(value) && value.length === 0) return;

            const label = labels[key] || formatLabel(key);
            let displayValue = Array.isArray(value) ? value.join(', ') : value;

            if (key === 'hasBranding') {
                const brandingMap = {
                    'yes': 'Yes, has logo and brand guidelines',
                    'partial': 'Partial (logo only)',
                    'no': 'No, needs branding'
                };
                displayValue = brandingMap[value] || value;
            }

            html += '<div class="summary-item">';
            html += '<span class="summary-label">' + escapeHtml(label) + '</span>';
            html += '<span class="summary-value">' + escapeHtml(String(displayValue)) + '</span>';
            html += '</div>';
        });

        if (!html) {
            html = '<p style="color: var(--gray-500);">Please fill in the form to see a summary.</p>';
        }

        summaryContent.innerHTML = html;
    }

    // ============================================
    // Get Field Labels
    // ============================================
    function getFieldLabels() {
        return {
            businessName: 'Business Name',
            businessType: 'Business Type',
            goals: 'Website Goals',
            goals_other: 'Other Goal',
            differentiator: 'Differentiator',
            pages: 'Pages Needed',
            pages_other: 'Other Pages',
            contentStatus: 'Content Status',
            contentNotes: 'Content Notes',
            hasBranding: 'Existing Branding',
            website1: 'Website Example 1',
            website2: 'Website Example 2',
            website3: 'Website Example 3',
            website_notes: 'Website Notes',
            designStyle: 'Design Style',
            colorPreferences: 'Color Preferences',
            functionality: 'Functionality',
            functionality_other: 'Other Functionality',
            payments: 'Payment Methods',
            integration: 'Third-party Integrations',
            domain: 'Domain Status',
            domain_name: 'Domain Name',
            hosting: 'Hosting Status',
            emailNeeds: 'Email Needs',
            seo: 'SEO & Analytics',
            assets: 'Existing Assets',
            assetNotes: 'Asset Notes',
            facebook: 'Facebook',
            instagram: 'Instagram',
            linkedin: 'LinkedIn',
            other_social: 'Other Social',
            audienceDesc: 'Target Audience',
            sources: 'Customer Sources',
            mainAction: 'Main Call-to-Action',
            competitor1: 'Competitor 1',
            competitor2: 'Competitor 2',
            competitor3: 'Competitor 3',
            legal: 'Legal Pages',
            timeline: 'Timeline',
            specific_date: 'Specific Date',
            budget: 'Budget Range',
            contactEmail: 'Contact Email'
        };
    }

    // ============================================
    // Format Label (fallback)
    // ============================================
    function formatLabel(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function (str) { return str.toUpperCase(); })
            .trim();
    }

    // ============================================
    // Escape HTML
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Handle Submit
    // ============================================
    function handleSubmit() {
        if (!validateCurrentStep()) {
            return;
        }

        // Final validation of all required fields
        if (!validateAllSteps()) {
            alert('Please complete all required fields before submitting. Check each step for errors.');
            return;
        }

        const data = collectFormData();
        const emailBody = buildEmailBody(data);

        // Build mailto link
        const subject = encodeURIComponent('New Client Onboarding Submission - ' + (data.businessName || 'Client'));
        const body = encodeURIComponent(emailBody);
        const mailtoLink = 'mailto:' + CONFIG.recipientEmail + '?subject=' + subject + '&body=' + body;

        // Open email client
        window.location.href = mailtoLink;

        // Show success modal
        setTimeout(function () {
            successModal.classList.add('active');
        }, 500);

        // Clear draft
        localStorage.removeItem(CONFIG.draftKey);
    }

    // ============================================
    // Validate All Steps
    // ============================================
    function validateAllSteps() {
        for (let i = 1; i <= CONFIG.totalSteps; i++) {
            const stepEl = document.getElementById('step' + i);
            if (!stepEl) continue;

            const requiredInputs = stepEl.querySelectorAll('[required]');
            for (let j = 0; j < requiredInputs.length; j++) {
                const input = requiredInputs[j];
                if (input.type === 'radio') {
                    const group = stepEl.querySelectorAll('input[name="' + input.name + '"]');
                    const checked = Array.from(group).some(function (r) { return r.checked; });
                    if (!checked) return false;
                } else if (input.type === 'checkbox') {
                    if (!input.checked) return false;
                } else if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!input.value.trim() || !emailRegex.test(input.value.trim())) return false;
                } else {
                    if (!input.value.trim()) return false;
                }
            }
        }
        return true;
    }

    // ============================================
    // Build Email Body
    // ============================================
    function buildEmailBody(data) {
        const labels = getFieldLabels();
        let body = '=== WEBDEV CLIENT ONBOARDING FORM ===\n\n';
        body += 'Submitted: ' + new Date().toLocaleString() + '\n\n';
        body += '----------------------------------------\n\n';

        const sections = {
            'BUSINESS & GOALS': ['businessName', 'businessType', 'goals', 'goals_other', 'differentiator'],
            'CONTENT & PAGES': ['pages', 'pages_other', 'contentStatus', 'contentNotes'],
            'DESIGN & STYLE': ['hasBranding', 'website1', 'website2', 'website3', 'website_notes', 'designStyle', 'colorPreferences'],
            'FUNCTIONALITY': ['functionality', 'functionality_other', 'payments', 'integration'],
            'TECHNICAL': ['domain', 'domain_name', 'hosting', 'emailNeeds', 'seo'],
            'EXISTING ASSETS': ['assets', 'assetNotes', 'facebook', 'instagram', 'linkedin', 'other_social'],
            'TARGET AUDIENCE': ['audienceDesc', 'sources', 'mainAction', 'competitor1', 'competitor2', 'competitor3'],
            'LEGAL & FINAL': ['legal', 'timeline', 'specific_date', 'budget', 'contactEmail']
        };

        Object.keys(sections).forEach(function (sectionName) {
            body += '--- ' + sectionName + ' ---\n';
            let sectionHasContent = false;

            sections[sectionName].forEach(function (key) {
                const value = data[key];
                if (value === '' || value === null || value === undefined) return;
                if (Array.isArray(value) && value.length === 0) return;

                const label = labels[key] || formatLabel(key);
                const displayValue = Array.isArray(value) ? value.join(', ') : value;
                body += label + ': ' + displayValue + '\n';
                sectionHasContent = true;
            });

            if (!sectionHasContent) {
                body += '(No information provided)\n';
            }
            body += '\n';
        });

        body += '----------------------------------------\n';
        body += 'End of submission\n';

        return body;
    }

    // ============================================
    // Save Draft
    // ============================================
    function saveDraft() {
        const data = collectFormData();
        try {
            localStorage.setItem(CONFIG.draftKey, JSON.stringify({
                data: data,
                step: currentStep,
                savedAt: new Date().toISOString()
            }));

            // Visual feedback
            const originalText = saveDraftBtn.innerHTML;
            saveDraftBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            saveDraftBtn.classList.add('saved');

            setTimeout(function () {
                saveDraftBtn.innerHTML = originalText;
                saveDraftBtn.classList.remove('saved');
            }, 2000);
        } catch (e) {
            console.warn('Could not save draft:', e);
            alert('Could not save draft. Your browser may have storage disabled.');
        }
    }

    // ============================================
    // Save Draft Silently
    // ============================================
    function saveDraftSilent() {
        try {
            const data = collectFormData();
            localStorage.setItem(CONFIG.draftKey, JSON.stringify({
                data: data,
                step: currentStep,
                savedAt: new Date().toISOString()
            }));
        } catch (e) {
            // Silent fail
        }
    }

    // ============================================
    // Load Draft
    // ============================================
    function loadDraft() {
        try {
            const saved = localStorage.getItem(CONFIG.draftKey);
            if (!saved) return;

            const draft = JSON.parse(saved);
            if (!draft || !draft.data) return;

            // Ask user if they want to restore
            const savedDate = new Date(draft.savedAt).toLocaleString();
            const restore = confirm('A saved draft was found from ' + savedDate + '.\n\nWould you like to restore it?');

            if (!restore) {
                localStorage.removeItem(CONFIG.draftKey);
                return;
            }

            // Restore data
            Object.keys(draft.data).forEach(function (key) {
                const value = draft.data[key];
                const elements = form.querySelectorAll('[name="' + key + '"]');

                elements.forEach(function (el) {
                    if (el.type === 'radio') {
                        if (el.value === value) el.checked = true;
                    } else if (el.type === 'checkbox') {
                        if (Array.isArray(value)) {
                            el.checked = value.indexOf(el.value) !== -1;
                        } else {
                            el.checked = value === el.value || value === true;
                        }
                    } else {
                        el.value = value;
                    }
                });
            });

            // Restore step
            if (draft.step && draft.step >= 1 && draft.step <= CONFIG.totalSteps) {
                goToStep('step' + draft.step);
            }

            // Reapply conditional states
            reapplyConditionalStates();

            // Notify
            setTimeout(function () {
                alert('Draft restored successfully!');
            }, 300);
        } catch (e) {
            console.warn('Could not load draft:', e);
        }
    }

})();