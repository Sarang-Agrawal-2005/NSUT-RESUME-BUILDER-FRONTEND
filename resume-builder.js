class ResumeBuilder {
    constructor() {
        // Auto-detect environment
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:8000' 
            : 'https://nsut-ats-scorer-backend.onrender.com'; // Update with your production URL
            
        this.currentData = {};
        this.debounceTimer = null;
        this.internshipCount = 0;
        this.projectCount = 0;
        this.positionCount = 0;
        
        this.initializeEventListeners();
        this.loadFromLocalStorage();
        this.setupConditionalSections();
    }

    initializeEventListeners() {
        // Form inputs - auto-save and live preview
        const formInputs = document.querySelectorAll('#resumeForm input, #resumeForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveToLocalStorage();
                this.schedulePreviewUpdate();
            });
        });

        // Action buttons
        const compileBtn = document.getElementById('compileBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (compileBtn) {
            compileBtn.addEventListener('click', () => this.updatePreview());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadResume());
        }

        // Conditional sections
        const includeClass12 = document.getElementById('includeClass12');
        const includeClass10 = document.getElementById('includeClass10');
        
        if (includeClass12) {
            includeClass12.addEventListener('change', (e) => {
                this.toggleSection('class12Section', e.target.checked);
            });
        }
        
        if (includeClass10) {
            includeClass10.addEventListener('change', (e) => {
                this.toggleSection('class10Section', e.target.checked);
            });
        }
    }

    setupConditionalSections() {
        // Initially hide conditional sections
        const class12Section = document.getElementById('class12Section');
        const class10Section = document.getElementById('class10Section');
        
        if (class12Section) {
            class12Section.style.display = 'none';
        }
        
        if (class10Section) {
            class10Section.style.display = 'none';
        }
    }

    toggleSection(sectionId, show) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    }

    schedulePreviewUpdate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updatePreview();
        }, 2000); // Update 2 seconds after user stops typing
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('resumeForm'));
        const data = {
            personal: {
                name: formData.get('fullName') || '',
                phone: formData.get('phone') || '',
                email: formData.get('email') || '',
                linkedin: formData.get('linkedin') || ''
            },
            education: {
                degree: formData.get('degree') || '',
                year: formData.get('gradYear') || '',
                cgpa: formData.get('cgpa') || ''
            },
            internships: this.collectDynamicItems('internships'),
            projects: this.collectDynamicItems('projects'),
            positions: this.collectDynamicItems('positions'),
            achievements: this.collectAchievements(),
            skills: formData.get('skills') || ''
        };

        // Add conditional education data
        const includeClass12 = document.getElementById('includeClass12');
        if (includeClass12 && includeClass12.checked) {
            data.education.class12 = true;
            data.education.school12 = formData.get('school12') || '';
            data.education.year12 = formData.get('year12') || '';
            data.education.marks12 = formData.get('marks12') || '';
        }

        const includeClass10 = document.getElementById('includeClass10');
        if (includeClass10 && includeClass10.checked) {
            data.education.class10 = true;
            data.education.school10 = formData.get('school10') || '';
            data.education.year10 = formData.get('year10') || '';
            data.education.marks10 = formData.get('marks10') || '';
        }

        return data;
    }

    collectDynamicItems(type) {
        const container = document.getElementById(`${type}Container`);
        if (!container) return [];
        
        const items = [];
        
        container.querySelectorAll('.dynamic-item').forEach(item => {
            try {
                if (type === 'internships') {
                    const titleInput = item.querySelector('[name$="Title"]');
                    const companyInput = item.querySelector('[name$="Company"]');
                    const locationInput = item.querySelector('[name$="Location"]');
                    const startDateInput = item.querySelector('[name$="StartDate"]');
                    const endDateInput = item.querySelector('[name$="EndDate"]');
                    const responsibilitiesInput = item.querySelector('[name$="Responsibilities"]');
                    
                    if (titleInput && companyInput) {
                        items.push({
                            title: titleInput.value || '',
                            company: companyInput.value || '',
                            location: locationInput ? locationInput.value : '',
                            duration: `${startDateInput ? startDateInput.value : ''} - ${endDateInput ? endDateInput.value : ''}`,
                            responsibilities: responsibilitiesInput ? this.splitTextareaContent(responsibilitiesInput.value) : []
                        });
                    }
                } else if (type === 'projects') {
                    const titleInput = item.querySelector('[name$="Title"]');
                    const descriptionInput = item.querySelector('[name$="Description"]');
                    
                    if (titleInput) {
                        items.push({
                            title: titleInput.value || '',
                            descriptions: descriptionInput ? this.splitTextareaContent(descriptionInput.value) : []
                        });
                    }
                } else if (type === 'positions') {
                    const titleInput = item.querySelector('[name$="Title"]');
                    const organizationInput = item.querySelector('[name$="Organization"]');
                    const startDateInput = item.querySelector('[name$="StartDate"]');
                    const endDateInput = item.querySelector('[name$="EndDate"]');
                    const responsibilitiesInput = item.querySelector('[name$="Responsibilities"]');
                    
                    if (titleInput && organizationInput) {
                        items.push({
                            title: titleInput.value || '',
                            organization: organizationInput.value || '',
                            duration: `${startDateInput ? startDateInput.value : ''} - ${endDateInput ? endDateInput.value : ''}`,
                            responsibilities: responsibilitiesInput ? this.splitTextareaContent(responsibilitiesInput.value) : []
                        });
                    }
                }
            } catch (error) {
                console.warn(`Error collecting data for ${type}:`, error);
            }
        });
        
        return items;
    }

    collectAchievements() {
        const achievementsElement = document.getElementById('achievements');
        if (!achievementsElement) return [];
        
        const achievementsText = achievementsElement.value;
        return this.splitTextareaContent(achievementsText);
    }

    splitTextareaContent(content) {
        if (!content) return [];
        return content.split('\n').filter(line => line.trim()).map(line => line.trim());
    }

    async updatePreview() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const previewFrame = document.getElementById('previewFrame');
        const placeholder = document.getElementById('previewPlaceholder');

        try {
            if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            }

            const data = this.collectFormData();

            // Show placeholder if required field (e.g., name) is missing
            if (!data.personal.name) {
            if (placeholder) placeholder.style.display = 'flex';
            if (previewFrame) previewFrame.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            return;
            } else {
            if (placeholder) placeholder.style.display = 'none';
            if (previewFrame) previewFrame.style.display = 'block';
            }

            const response = await fetch(`${this.apiUrl}/api/compile-resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
            });

            if (!response.ok) {
            let errorDetail = 'Unknown error';
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorData.error || errorDetail;
                console.error('Server error details:', errorData);
            } catch (e) {
                errorDetail = await response.text();
            }
            throw new Error(`Server error (${response.status}): ${errorDetail}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            if (result.compilation_failed || result.latex_source) {
                this.showLatexFallback(result);
            } else {
                throw new Error(result.error || 'Compilation failed');
            }
            } else {
            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);
            if (previewFrame) {
                previewFrame.src = pdfUrl;
            }
            }
        } catch (error) {
            console.error('Preview update failed:', error);
            this.showErrorMessage(`Preview failed: ${error.message}`);
            // Optionally, show the placeholder again if there's an error
            const placeholder = document.getElementById('previewPlaceholder');
            const previewFrame = document.getElementById('previewFrame');
            if (placeholder) placeholder.style.display = 'flex';
            if (previewFrame) previewFrame.style.display = 'none';
        } finally {
            if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            }
        }
    }


    async downloadResume() {
        try {
            const data = this.collectFormData();
            
            // Validate required fields
            if (!data.personal.name) {
                alert('Name is required to generate resume');
                return;
            }
            
            const response = await fetch(`${this.apiUrl}/api/compile-resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.latex_source) {
                    // Show LaTeX fallback for download
                    this.downloadLatexSource(errorData.latex_source, data.personal.name);
                    return;
                }
                throw new Error('Failed to generate resume');
            }

            // Check if response is JSON (fallback) or PDF (success)
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (result.latex_source) {
                    this.downloadLatexSource(result.latex_source, data.personal.name);
                } else {
                    throw new Error('No downloadable content available');
                }
            } else {
                // Handle PDF download
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${data.personal.name.replace(/\s+/g, '_')}_NSUT_Resume.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
        } catch (error) {
            console.error('Download failed:', error);
            alert(`Failed to download resume: ${error.message}`);
        }
    }

    downloadLatexSource(latexSource, name) {
        // Download LaTeX source as .tex file
        const blob = new Blob([latexSource], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_NSUT_Resume.tex`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('LaTeX source file downloaded! Upload this to Overleaf.com to generate your PDF.');
    }

    showLatexFallback(result) {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;
        
        const fallbackHTML = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        
                        .latex-code { background: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 2px; margin: 2px 0; width: 100%; height: 100%; }
                        textarea { width: 100%; height: 460px; font-family: 'Courier New', monospace; font-size: 15px; border: 1px solid #D1D5DB; border-radius: 1px;  resize: none;}
                        .btn { background: #DC2626; color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
                        .btn:hover { background: #B91C1C; }
                        .success-note { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 10px; border-radius: 6px; margin: 10px 0; color: #166534; }
                    </style>
                </head>
                <body>

                    <div class="latex-code">

                        <textarea readonly id="latexCode">${result.latex_source || 'No LaTeX source available'}</textarea>
                        <button class="btn" onclick="copyToClipboard()">Copy Code</button>
                        <button class="btn" onclick="window.open('https://www.overleaf.com', '_blank')">Open Overleaf</button>

                        <ol style="text-align:left;font-size:0.95rem;margin-left:1rem;">
                            <li>Copy Provided Latex Code and go to Overleaf</li>
                            <li>Create a Blank Project and paste code onto editor</li>
                            <li>Click Compile to generate your Resume</li>
                        </ol>
                    </div>

                    <script>
                        function copyToClipboard() {
                            const textarea = document.getElementById('latexCode');
                            textarea.select();
                            textarea.setSelectionRange(0, 99999);
                            document.execCommand('copy');
                            alert('✅ LaTeX code copied to clipboard!');
                        }
                        
                        function downloadLatex() {
                            const textarea = document.getElementById('latexCode');
                            const blob = new Blob([textarea.value], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'NSUT_Resume.tex';
                            a.click();
                            URL.revokeObjectURL(url);
                            alert('✅ LaTeX file downloaded! Upload this to Overleaf.com');
                        }
                    </script>
                </body>
            </html>
        `;
        
        const blob = new Blob([fallbackHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
    }

    showErrorMessage(message) {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;
        
        const errorHTML = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; line-height: 1.6; }
                        .error-container { max-width: 600px; margin: 0 auto; background: #FEF3F2; border: 1px solid #FECACA; border-radius: 12px; padding: 30px; }
                        .error-icon { font-size: 4rem; color: #DC2626; margin-bottom: 20px; }
                        .error-title { color: #DC2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 15px; }
                        .error-message { color: #666; margin-bottom: 25px; font-size: 1rem; word-wrap: break-word; }
                        .btn { background: #DC2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 500; margin: 5px; }
                        .btn:hover { background: #B91C1C; }
                        .troubleshooting { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left; }
                        .troubleshooting h4 { margin-top: 0; color: #374151; }
                        .troubleshooting ul { margin: 10px 0; padding-left: 20px; }
                        .troubleshooting li { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <div class="error-icon">⚠️</div>
                        <div class="error-title">Resume Generation Failed</div>
                        <div class="error-message">${message}</div>
                        
                        <div class="troubleshooting">
                            <h4>Troubleshooting Steps:</h4>
                            <ul>
                                <li>Make sure your <strong>Name</strong> field is filled</li>
                                <li>Check your internet connection</li>
                                <li>Try refreshing the page</li>
                                <li>Clear your browser cache</li>
                            </ul>
                        </div>
                        
                        <button class="btn" onclick="window.parent.location.reload()">🔄 Refresh Page</button>
                        <button class="btn" onclick="clearData()" style="background: #6B7280;">🗑️ Clear Data</button>
                    </div>
                    
                    <script>
                        function clearData() {
                            if (confirm('This will clear all your form data. Are you sure?')) {
                                localStorage.removeItem('resumeBuilderData');
                                window.parent.location.reload();
                            }
                        }
                    </script>
                </body>
            </html>
        `;
        
        const blob = new Blob([errorHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
    }

    saveToLocalStorage() {
        try {
            const data = this.collectFormData();
            localStorage.setItem('resumeBuilderData', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('resumeBuilderData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.populateForm(data);
            } catch (error) {
                console.error('Failed to load saved data:', error);
                // Clear corrupted data
                localStorage.removeItem('resumeBuilderData');
            }
        }
    }

    populateForm(data) {
        try {
            // Populate personal information
            if (data.personal) {
                const fullNameEl = document.getElementById('fullName');
                const phoneEl = document.getElementById('phone');
                const emailEl = document.getElementById('email');
                const linkedinEl = document.getElementById('linkedin');
                
                if (fullNameEl) fullNameEl.value = data.personal.name || '';
                if (phoneEl) phoneEl.value = data.personal.phone || '';
                if (emailEl) emailEl.value = data.personal.email || '';
                if (linkedinEl) linkedinEl.value = data.personal.linkedin || '';
            }

            // Populate education
            if (data.education) {
                const degreeEl = document.getElementById('degree');
                const gradYearEl = document.getElementById('gradYear');
                const cgpaEl = document.getElementById('cgpa');
                
                if (degreeEl) degreeEl.value = data.education.degree || '';
                if (gradYearEl) gradYearEl.value = data.education.year || '';
                if (cgpaEl) cgpaEl.value = data.education.cgpa || '';
                
                // Handle conditional sections
                if (data.education.class12) {
                    const includeClass12 = document.getElementById('includeClass12');
                    if (includeClass12) {
                        includeClass12.checked = true;
                        this.toggleSection('class12Section', true);
                    }
                }
                
                if (data.education.class10) {
                    const includeClass10 = document.getElementById('includeClass10');
                    if (includeClass10) {
                        includeClass10.checked = true;
                        this.toggleSection('class10Section', true);
                    }
                }
            }

            // Populate other sections
            const skillsEl = document.getElementById('skills');
            if (skillsEl && data.skills) {
                skillsEl.value = data.skills;
            }

            const achievementsEl = document.getElementById('achievements');
            if (achievementsEl && data.achievements && Array.isArray(data.achievements)) {
                achievementsEl.value = data.achievements.join('\n');
            }
        } catch (error) {
            console.error('Error populating form:', error);
        }
    }
}

// Dynamic item management functions
function addInternship() {
    const container = document.getElementById('internshipsContainer');
    if (!container) return;
    
    const itemId = `internship_${Date.now()}`;
    
    const internshipHTML = `
        <div class="dynamic-item" data-id="${itemId}">
            <div class="dynamic-header">
                <h4>Internship</h4>
                <button type="button" class="remove-btn" onclick="removeItem('${itemId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Position Title *</label>
                    <input type="text" name="${itemId}Title" required>
                </div>
                <div class="form-group">
                    <label>Company *</label>
                    <input type="text" name="${itemId}Company" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="${itemId}Location">
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="text" name="${itemId}StartDate" placeholder="Jun 2023">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="text" name="${itemId}EndDate" placeholder="Aug 2023">
                </div>
            </div>
            <div class="form-group">
                <label>Key Responsibilities (one per line)</label>
                <textarea name="${itemId}Responsibilities" rows="3" placeholder="Enter each responsibility on a new line"></textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', internshipHTML);
    addEventListenersToNewItem();
}

function addProject() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    const itemId = `project_${Date.now()}`;
    
    const projectHTML = `
        <div class="dynamic-item" data-id="${itemId}">
            <div class="dynamic-header">
                <h4>Project</h4>
                <button type="button" class="remove-btn" onclick="removeItem('${itemId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-group">
                <label>Project Title *</label>
                <input type="text" name="${itemId}Title" required>
            </div>
            <div class="form-group">
                <label>Description & Tech Stack (one per line)</label>
                <textarea name="${itemId}Description" rows="3" placeholder="Enter project description and tech stack, one point per line"></textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', projectHTML);
    addEventListenersToNewItem();
}

function addPosition() {
    const container = document.getElementById('positionsContainer');
    if (!container) return;
    
    const itemId = `position_${Date.now()}`;
    
    const positionHTML = `
        <div class="dynamic-item" data-id="${itemId}">
            <div class="dynamic-header">
                <h4>Position of Responsibility</h4>
                <button type="button" class="remove-btn" onclick="removeItem('${itemId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Position Title *</label>
                    <input type="text" name="${itemId}Title" required>
                </div>
                <div class="form-group">
                    <label>Organization *</label>
                    <input type="text" name="${itemId}Organization" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="text" name="${itemId}StartDate" placeholder="Jan 2023">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="text" name="${itemId}EndDate" placeholder="Dec 2023">
                </div>
            </div>
            <div class="form-group">
                <label>Key Responsibilities (one per line)</label>
                <textarea name="${itemId}Responsibilities" rows="4" placeholder="Enter each responsibility on a new line"></textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', positionHTML);
    addEventListenersToNewItem();
}

function removeItem(itemId) {
    const item = document.querySelector(`[data-id="${itemId}"]`);
    if (item) {
        item.remove();
        // Trigger save and preview update
        if (window.resumeBuilder) {
            window.resumeBuilder.saveToLocalStorage();
            window.resumeBuilder.schedulePreviewUpdate();
        }
    }
}

function addEventListenersToNewItem() {
    // Add event listeners to newly created form elements
    if (window.resumeBuilder) {
        const lastDynamicItem = document.querySelector('.dynamic-item:last-child');
        if (lastDynamicItem) {
            const newInputs = lastDynamicItem.querySelectorAll('input, textarea');
            newInputs.forEach(input => {
                input.addEventListener('input', () => {
                    window.resumeBuilder.saveToLocalStorage();
                    window.resumeBuilder.schedulePreviewUpdate();
                });
            });
        }
    }
}

// Initialize resume builder when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.resumeBuilder = new ResumeBuilder();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeBuilder;
}

