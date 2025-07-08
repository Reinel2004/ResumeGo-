// Load face-api.js models on page load (for resumebuilder.html)
async function loadFaceApiModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/js/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/js/models');
    // Add more models if needed
}

if (window.faceapi) loadFaceApiModels();

// Helper to overlay suit on detected face
async function overlaySuitOnFace(imageElement, canvasElement, suitSrc) {
    const detection = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    if (!detection) return false;
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(imageElement, 0, 0, canvasElement.width, canvasElement.height);
    // Load suit overlay
    const suitImg = new Image();
    suitImg.src = suitSrc;
    await new Promise(res => { suitImg.onload = res; });
    // Example: Draw suit at fixed position (improve by using landmarks)
    ctx.drawImage(suitImg, canvasElement.width/2 - suitImg.width/2, canvasElement.height*0.6, suitImg.width, suitImg.height);
    return true;
}

function addEducation() {
    const educationSection = document.getElementById('education-section');
    const newEntry = document.createElement('div');
    newEntry.className = 'education-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Degree">
        <input type="text" placeholder="University">
        <input type="text" placeholder="Graduation Year">
    `;
    educationSection.appendChild(newEntry);
}

function addWork() {
    const workSection = document.getElementById('work-section');
    const newEntry = document.createElement('div');
    newEntry.className = 'work-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Job Title">
        <input type="text" placeholder="Company">
        <input type="text" placeholder="Duration">
    `;
    workSection.appendChild(newEntry);
}

function generateResume() {
    const resumePreview = document.getElementById('resume-preview');
    resumePreview.innerHTML = ''; // Clear previous content

    // Create resume container
    const resumeContainer = document.createElement('div');
    resumeContainer.className = 'resume-container';

    // Add profile image and header
    if (processedImageUrl) {
        const header = document.createElement('div');
        header.className = 'resume-header';
        header.innerHTML = `
            <img src="${processedImageUrl}" alt="Profile Picture" class="profile-img">
            <div class="header-info">
                <h2>${document.getElementById('name').value}</h2>
                <p>${document.getElementById('email').value}</p>
                <p>${document.getElementById('phone').value}</p>
            </div>
        `;
        resumeContainer.appendChild(header);
    }

    // Add education section
    const educationSection = document.createElement('div');
    educationSection.className = 'resume-section';
    educationSection.innerHTML = '<h3>Education</h3>';
    document.querySelectorAll('.education-entry').forEach(entry => {
        const inputs = entry.querySelectorAll('input');
        educationSection.innerHTML += `
            <div class="education-item">
                <p><strong>${inputs[0].value}</strong></p>
                <p>${inputs[1].value}</p>
                <p>${inputs[2].value}</p>
            </div>
        `;
    });
    resumeContainer.appendChild(educationSection);

    // Add work experience section
    const workSection = document.createElement('div');
    workSection.className = 'resume-section';
    workSection.innerHTML = '<h3>Work Experience</h3>';
    document.querySelectorAll('.work-entry').forEach(entry => {
        const inputs = entry.querySelectorAll('input');
        workSection.innerHTML += `
            <div class="work-item">
                <p><strong>${inputs[0].value}</strong></p>
                <p>${inputs[1].value}</p>
                <p>${inputs[2].value}</p>
            </div>
        `;
    });
    resumeContainer.appendChild(workSection);

 
    const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
    if (skills.length > 0) {
        const skillsSection = document.createElement('div');
        skillsSection.className = 'resume-section';
        skillsSection.innerHTML = `
            <h3>Skills</h3>
            <ul class="skills-list">
                ${skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>
        `;
        resumeContainer.appendChild(skillsSection);
    }

 
    const printButton = document.createElement('button');
    printButton.textContent = 'Print Resume';
    printButton.onclick = () => window.print();
    resumeContainer.appendChild(printButton);

    resumePreview.appendChild(resumeContainer);
}

let processedImageUrl = null;

// Profile photo upload logic for resumebuilder.html
const profileUploadInput = document.getElementById('profile-upload');
const previewImage = document.getElementById('previewImage');
const suitOverlayCheckbox = document.getElementById('suitOverlayCheckbox');

if (profileUploadInput && previewImage) {
    profileUploadInput.addEventListener('change', async function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function (e) {
                previewImage.src = e.target.result;
                // If suit overlay is checked, apply it
                if (suitOverlayCheckbox && suitOverlayCheckbox.checked) {
                    // Create a canvas to draw the overlay
                    let canvas = document.createElement('canvas');
                    canvas.width = previewImage.naturalWidth || 400;
                    canvas.height = previewImage.naturalHeight || 400;
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = async function() {
                        // Use the first suit as default, or let user pick
                        const suitSrc = '../assets/img/suit-overlay/suit-overlay-1.png';
                        await overlaySuitOnFace(img, canvas, suitSrc);
                        previewImage.src = canvas.toDataURL();
                    };
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

if (suitOverlayCheckbox && previewImage && profileUploadInput) {
    suitOverlayCheckbox.addEventListener('change', function() {
        // Re-trigger the change event to re-apply or remove the overlay
        if (profileUploadInput.files && profileUploadInput.files[0]) {
            const event = new Event('change');
            profileUploadInput.dispatchEvent(event);
        }
    });
}
