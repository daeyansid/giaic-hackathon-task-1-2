// app.ts
interface Education {
    school: string;
    degree: string;
    year: string;
}

interface Experience {
    company: string;
    position: string;
    duration: string;
    description: string;
}

class ResumeBuilder {
    private educationList: Education[] = [];
    private experienceList: Experience[] = [];
    private skills: string[] = [];
    private isFormLocked: boolean = false;
    private currentSection: string = 'personalInfo';

    constructor() {
        this.initializeEventListeners();
        this.loadSavedData();
        this.initializeNavigation();
    }

    private initializeEventListeners(): void {
        document.getElementById('addEducation')?.addEventListener('click', () => this.addEducation());
        document.getElementById('addExperience')?.addEventListener('click', () => this.addExperience());
        document.getElementById('addSkill')?.addEventListener('click', () => this.addSkill());
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveResume());
        document.getElementById('printBtn')?.addEventListener('click', () => this.printResume());
    }

    private toggleFormFields(disable: boolean): void {
        // Disable all input fields
        const inputs = document.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;
        inputs.forEach(input => {
            input.disabled = disable;
        });

        // Disable all buttons except Save and Print
        const buttons = document.querySelectorAll('button:not(#saveBtn):not(#printBtn)') as NodeListOf<HTMLButtonElement>;
        buttons.forEach(button => {
            button.disabled = disable;
        });

        // Visual feedback
        if (disable) {
            document.body.classList.add('form-locked');
            const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
            saveBtn.innerHTML = '<i class="fas fa-lock"></i> Unlock Form';
            saveBtn.classList.add('unlock-btn');
        } else {
            document.body.classList.remove('form-locked');
            const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Resume';
            saveBtn.classList.remove('unlock-btn');
        }
    }

    private addEducation(): void {
        const educationList = document.getElementById('educationList');
        const educationDiv = document.createElement('div');
        educationDiv.className = 'education-item';
        educationDiv.innerHTML = `
            <input type="text" placeholder="School Name">
            <input type="text" placeholder="Degree">
            <input type="text" placeholder="Year">
            <button onclick="this.parentElement.remove()">Remove</button>
        `;
        educationList?.appendChild(educationDiv);
    }

    private addExperience(): void {
        const experienceList = document.getElementById('experienceList');
        const experienceDiv = document.createElement('div');
        experienceDiv.className = 'experience-item';
        experienceDiv.innerHTML = `
            <input type="text" placeholder="Company">
            <input type="text" placeholder="Position">
            <input type="text" placeholder="Duration">
            <textarea placeholder="Description"></textarea>
            <button onclick="this.parentElement.remove()">Remove</button>
        `;
        experienceList?.appendChild(experienceDiv);
    }

    private addSkill(): void {
        const skillInput = document.getElementById('skillInput') as HTMLInputElement;
        const skillsList = document.getElementById('skillsList');
        
        if (skillInput.value.trim()) {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-item';
            skillDiv.textContent = skillInput.value;
            skillDiv.onclick = () => skillDiv.remove();
            skillsList?.appendChild(skillDiv);
            this.skills.push(skillInput.value);
            skillInput.value = '';
        }
    }

    private saveResume(): void {
        this.isFormLocked = !this.isFormLocked;
        this.toggleFormFields(this.isFormLocked);

        if (this.isFormLocked) {
            const personalInfo = {
                fullName: (document.getElementById('fullName') as HTMLInputElement).value,
                email: (document.getElementById('email') as HTMLInputElement).value,
                phone: (document.getElementById('phone') as HTMLInputElement).value,
                address: (document.getElementById('address') as HTMLTextAreaElement).value
            };

            localStorage.setItem('resumeData', JSON.stringify({
                personalInfo,
                education: this.educationList,
                experience: this.experienceList,
                skills: this.skills
            }));

            // Show success message
            const toast = document.createElement('div');
            toast.className = 'toast success';
            toast.innerHTML = '<i class="fas fa-check-circle"></i> Resume saved successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }

    private loadSavedData(): void {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Populate fields with saved data
            Object.entries(data.personalInfo).forEach(([key, value]) => {
                const element = document.getElementById(key) as HTMLInputElement;
                if (element) element.value = value as string;
            });
            // Load other sections...
        }
    }

    private printResume(): void {
        window.print();
    }

    private initializeNavigation(): void {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = (e.currentTarget as HTMLElement).dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Monitor scroll for section highlighting
        document.addEventListener('scroll', this.handleScroll.bind(this));
    }

    private navigateToSection(sectionId: string): void {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked nav item
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);
        navItem?.classList.add('active');

        // Scroll to section
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }

        this.currentSection = sectionId;
        this.updateProgress();
    }

    private handleScroll(): void {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop - 100 && 
                scrollPosition < sectionTop + sectionHeight - 100) {
                const sectionId = section.id;
                this.highlightNavItem(sectionId);
            }
        });
    }

    private highlightNavItem(sectionId: string): void {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
        activeNav?.classList.add('active');
    }

    private updateProgress(): void {
        const sections = ['personalInfo', 'education', 'experience', 'skills'];
        const currentIndex = sections.indexOf(this.currentSection);
        const progress = ((currentIndex + 1) / sections.length) * 100;

        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
}

// Initialize the resume builder
new ResumeBuilder();

// Add these styles to your CSS
const styles = `
.form-locked input:disabled,
.form-locked textarea:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
}

.unlock-btn {
    background-color: #dc2626 !important;
}

.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
}

.toast.success {
    background-color: #22c55e;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;