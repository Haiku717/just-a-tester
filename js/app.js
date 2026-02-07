// Initialize Lucide Icons
lucide.createIcons();

let jobs = JSON.parse(localStorage.getItem('trade_jobs')) || [];
let reviewLink = localStorage.getItem('review_link') || "";

document.getElementById('google-link').value = reviewLink;

function saveSettings() {
    reviewLink = document.getElementById('google-link').value;
    localStorage.setItem('review_link', reviewLink);
}

function addNewJob() {
    const client = prompt("Customer Name:");
    const task = prompt("Job Description (e.g. Heat Pump Service):");
    
    if (client && task) {
        const newJob = {
            id: Date.now(),
            client,
            task,
            status: 'active'
        };
        jobs.push(newJob);
        renderJobs();
    }
}

function completeJob(id) {
    const job = jobs.find(j => j.id === id);
    const message = `Hi ${job.client}, thanks for choosing us today! If you have a moment, we'd love a review: ${reviewLink}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
        alert("Job Completed! Review message copied to clipboard. Send it to the client now.");
        job.status = 'completed';
        renderJobs();
    });
}

function renderJobs() {
    localStorage.setItem('trade_jobs', JSON.stringify(jobs));
    const container = document.getElementById('job-list');
    container.innerHTML = '';

    if (jobs.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-gray-400">No active jobs. Tap + to start.</div>`;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center";
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-gray-800">${job.client}</h3>
                <p class="text-sm text-gray-500">${job.task}</p>
            </div>
            ${job.status === 'active' ? 
                `<button onclick="completeJob(${job.id})" class="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1">
                    <i data-lucide="check" size="16"></i> Finish
                </button>` : 
                `<span class="text-gray-400 text-sm font-medium">Completed</span>`
            }
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

renderJobs();
