// ATS Scorer JavaScript
class ATSScorer {
    constructor() {
        this.apiUrl = 'https://nsut-resume-builder-backend.onrender.com'; // Backend URL
        this.currentFile = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Drag and Drop
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');

        // Drop zone events
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dropZone.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Browse button
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', this.switchTab.bind(this));
        });

        // Close sidebar
        document.getElementById('closeSidebar').addEventListener('click', this.closeSidebar.bind(this));

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const getStartedBtn = document.getElementById('getStartedBtn');
        const uploadResumeBtn = document.getElementById('startBuildingBtn');
        
        if (getStartedBtn) {
            getStartedBtn.onclick = () => window.location.href = 'ats-scorer.html';
        }
        
        if (uploadResumeBtn) {
            uploadResumeBtn.onclick = () => window.location.href = 'ats-scorer.html';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('dropZone').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('dropZone').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('dropZone').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFile(file) {
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.uploadFile(file);
    }

    validateFile(file) {
        // Check file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            return false;
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return false;
        }

        return true;
    }

    async uploadFile(file) {
        const uploadSection = document.getElementById('uploadSection');
        const resultsSection = document.getElementById('resultsSection');
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        try {
            // Show progress
            uploadProgress.style.display = 'block';
            
            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Upload file with progress
            const response = await fetch(`${this.apiUrl}/upload-resume`, {
                method: 'POST',
                body: formData
            });

            // Simulate progress for demo
            this.simulateProgress(progressFill, progressText);

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            // Hide upload section and show results
            setTimeout(() => {
                uploadSection.style.display = 'none';
                resultsSection.style.display = 'flex';
                this.displayResults(result, file);
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload resume. Please try again.');
            uploadProgress.style.display = 'none';
        }
    }

    simulateProgress(progressFill, progressText) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                progressText.textContent = 'Processing...';
            }
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 200);
    }

    displayResults(data, file) {
        // Show sidebar
        const sidebar = document.getElementById('sidebar');
        const contentArea = document.getElementById('contentArea');
        
        sidebar.classList.add('active');
        contentArea.classList.add('with-sidebar');

        // Update scores
        this.updateScores(data);

        // Display PDF
        this.displayPDF(file);

        // Display suggestions
        this.displaySuggestions(data.suggestions);
    }

    updateScores(data) {
        // Overall score
        document.getElementById('overallScore').textContent = data.overall_score;
        
        // Update score circle
        const scoreCircle = document.querySelector('.score-circle');
        const percentage = (data.overall_score / 100) * 360;
        scoreCircle.style.background = `conic-gradient(var(--primary-red) 0deg, var(--primary-red) ${percentage}deg, var(--gray-200) ${percentage}deg)`;

        // Section scores
        const sectionScoresContainer = document.getElementById('sectionScores');
        const sectionsHTML = Object.entries(data.section_scores)
            .map(([section, score]) => `
                <div class="section-score">
                    <span class="section-name">${this.formatSectionName(section)}</span>
                    <span class="section-value">${score}%</span>
                </div>
            `).join('');
        
        sectionScoresContainer.innerHTML = `<h3>Section Breakdown</h3>${sectionsHTML}`;

        // Quick stats
        document.getElementById('keywordsFound').textContent = data.keywords_found;
        document.getElementById('sectionsDetected').textContent = data.sections_detected;
        document.getElementById('formatScore').textContent = `${data.format_score}%`;
    }

    formatSectionName(section) {
        return section.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    displayPDF(file) {
        const resumeViewer = document.getElementById('resumeViewer');
        const fileURL = URL.createObjectURL(file);
        resumeViewer.src = fileURL;
    }

    displaySuggestions(suggestions) {
        const suggestionsList = document.getElementById('suggestionsList');
        
        const suggestionsHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-title">${suggestion.title}</div>
                <div class="suggestion-description">${suggestion.description}</div>
                <span class="suggestion-priority priority-${suggestion.priority}">
                    ${suggestion.priority.toUpperCase()} PRIORITY
                </span>
            </div>
        `).join('');
        
        suggestionsList.innerHTML = suggestionsHTML;
    }

    switchTab(e) {
        const tabName = e.target.closest('.tab-btn').dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.closest('.tab-btn').classList.add('active');
        
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const contentArea = document.getElementById('contentArea');
        
        sidebar.classList.remove('active');
        contentArea.classList.remove('with-sidebar');
    }
}

// Initialize ATS Scorer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ATSScorer();
});
