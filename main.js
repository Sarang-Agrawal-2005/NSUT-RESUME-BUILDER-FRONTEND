// main.js for NSUT ATS SCORER project

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', function() {
    
    // NSUT Format Guide button (patentBtn) - opens Overleaf template
    // const formatGuideBtn = document.getElementById('patentBtn');
    // if (formatGuideBtn) {
    //     formatGuideBtn.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         window.open('guidelines.html', '_blank');
    //     });
    // }

    // Guidelines nav-link - navigates to guidelines page
    const guidelinesLinks = document.querySelectorAll('.nav-link');
    guidelinesLinks.forEach(link => {
        if (link.textContent.trim() === 'Guidelines') {
            link.setAttribute('href', 'guidelines.html');
            link.addEventListener('click', function(e) {
                // Let the default navigation happen
                window.location.href = 'guidelines.html';
            });
        }
    });

    // Check Score button (getStartedBtn)
    const checkScoreBtn = document.getElementById('getStartedBtn');
    if (checkScoreBtn) {
        checkScoreBtn.addEventListener('click', function(e) {
            window.location.href = 'ats-scorer.html';
        });
    }

    // Upload Resume button (startBuildingBtn)
    // const uploadResumeBtn = document.getElementById('startBuildingBtn');
    // if (uploadResumeBtn) {
    //     uploadResumeBtn.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         // Add file upload functionality here
    //         alert('Resume upload functionality coming soon!');
    //     });
    // }

    const resumeTipsLinks = document.querySelectorAll('.nav-link');
    resumeTipsLinks.forEach(link => {
        if (link.textContent.trim() === 'Resume Tips') {
            link.setAttribute('href', 'resume-tips.html');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // For guidelines.html page - handle template actions
    const overleafBtn = document.querySelector('.btn[onclick*="overleaf"]');
    if (overleafBtn) {
        overleafBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://www.overleaf.com/latex/templates/nsut-tnp-resume/sxzbtkwmqsyg', '_blank');
        });
    }

    const downloadBtn = document.querySelector('.btn[onclick*="documents"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Create a link to download the PDF
            const link = document.createElement('a');
            link.href = 'documents/nsut-resume-template.pdf';
            link.download = 'nsut-resume-template.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Resume Builder navigation
    const buildResumeLinks = document.querySelectorAll('.nav-link');
    buildResumeLinks.forEach(link => {
        if (link.textContent.trim() === 'Build Resume') {
            link.setAttribute('href', 'resume-builder.html');
        }
    });

    // Build Resume button functionality
    const buildResumeBtn = document.getElementById('buildResumeBtn');
    if (buildResumeBtn) {
        buildResumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'resume-builder.html';
        });
    }

});

// Utility function to open URL in new tab
function openInNewTab(url) {
    window.open(url, '_blank');
}

// Function to handle file upload (for future implementation)
function handleFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            // Add your file processing logic here
            alert(`File "${file.name}" selected. Processing functionality coming soon!`);
        }
    });
    input.click();
}

// Add CSS for mobile menu animation
const style = document.createElement('style');
style.textContent = `
    .nav-links.mobile-active {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        border-top: 1px solid rgba(220, 38, 38, 0.1);
    }

    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    @media (min-width: 769px) {
        .nav-links.mobile-active {
            display: flex !important;
            flex-direction: row;
            position: static;
            background: none;
            backdrop-filter: none;
            padding: 0;
            box-shadow: none;
            border-top: none;
        }
    }
`;
document.head.appendChild(style);
