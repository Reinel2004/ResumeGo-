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

document.getElementById("profile-pic").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
        // Preview the uploaded image before sending to backend
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("image-preview").innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" width="150">`;
        };
        reader.readAsDataURL(file);

        // Send the image to Flask for processing
        const formData = new FormData();
        formData.append("file", file);

        fetch("http://127.0.0.1:5000/uploads", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.processedImageUrl) {
                // Show the processed image
                document.getElementById("image-preview").innerHTML = `<img src="${data.processedImageUrl}" alt="Processed Image" width="150">`;
            } else {
                console.error("Error processing image:", data.error);
            }
        })
        .catch(error => console.error("Error uploading file:", error));
    }
});
