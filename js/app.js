// Initialize Icons
lucide.createIcons();

// 1. Data State (Persistent)
let state = {
    jobs: JSON.parse(localStorage.getItem('hvac_data')) || [],
    reviewLink: localStorage.getItem('hvac_review_link') || "https://g.page/r/your-link-here/review"
};

// 2. Core Functions
function save() {
    localStorage.setItem('hvac_data', JSON.stringify(state.jobs));
    localStorage.setItem('hvac_review_link', state.reviewLink);
}

function toggleForm() {
    const el = document.getElementById('form-overlay');
    el.classList.toggle('hidden');
}

function submitForm() {
    const client = document.getElementById('f-client').value;
    const task = document.getElementById('f-task').value;
    const amount = parseFloat(document.getElementById('f-amount').value || 0);
    const type = document.getElementById('f-type').value;

    if (!client || !task) {
        alert("Enter a Client and Task description.");
        return;
    }

    const entry = {
        id: Date.now(),
        client,
        task,
        amount,
        type,
        status: 'Active', // New entries are always active
        date: new Date().toLocaleDateString('en-NZ'),
        xeroCode: type === 'Job' ? '200' : 'Draft' // Placeholder for Xero Sales Code
    };

    state.jobs.push(entry);
    save();
    toggleForm();
    
    // Clear inputs
    document.getElementById('f-client').value = '';
    document.getElementById('f-task').value = '';
    document.getElementById('f-amount').value = '';
    
    // Refresh view
    type === 'Quote' ? renderQuotes() : renderDashboard();
}

function completeJob(id) {
    const job = state.jobs.find(j => j.id === id);
    job.status = 'Paid';
    save();
    
    const msg = `Hi ${job.client}, thanks for choosing us today! We'd love a review: ${state.reviewLink}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).then(() => {
            alert("Job Marked Paid! Review request copied to clipboard.");
            renderDashboard();
        });
    } else {
        alert("Job Marked Paid!");
        renderDashboard();
    }
}

// 3. Rendering Views
function renderDashboard() {
    const activeJobs = state.jobs.filter(j => j.type === 'Job' && j.status === 'Active');
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xs font-black text-blue-600 uppercase tracking-widest">Active Jobs</h2>
            <p class="text-2xl font-bold text-gray-800">Field Schedule</p>
        </div>
        <div class="space-y-3">
            ${activeJobs.length === 0 ? '<p class="text-gray-400 py-10 text-center border-2 border-dashed rounded-2xl">No active jobs</p>' : ''}
            ${activeJobs.map(job => `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-gray-900 leading-tight">${job.client}</h3>
                        <p class="text-sm text-gray-500">${job.task}</p>
                        <p class="text-blue-600 font-bold mt-2 text-lg">$${(job.amount * 1.15).toFixed(2)} <span class="text-[10px] text-gray-400 font-normal">INC GST</span></p>
                    </div>
                    <button onclick="completeJob(${job.id})" class="bg-green-500 text-white p-4 rounded-2xl shadow-lg shadow-green-100">
                        <i data-lucide="check"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

function renderQuotes() {
    const quotes = state.jobs.filter(j => j.type === 'Quote' && j.status === 'Active');
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xs font-black text-orange-600 uppercase tracking-widest">Pending</h2>
            <p class="text-2xl font-bold text-gray-800">Quotes & Estimates</p>
        </div>
        <div class="space-y-3">
            ${quotes.length === 0 ? '<p class="text-gray-400 py-10 text-center border-2 border-dashed rounded-2xl">No pending quotes</p>' : ''}
            ${quotes.map(q => `
                <div class="bg-white p-5 rounded-2xl border border-gray-200">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-gray-800">${q.client}</h3>
                            <p class="text-sm text-gray-500">${q.task}</p>
                            <p class="text-gray-900 font-bold mt-2">$${(q.amount * 1.15).toFixed(2)}</p>
                        </div>
                        <span class="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-500 uppercase">Quote</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

// Start App
renderDashboard();
