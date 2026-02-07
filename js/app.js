// Initialize state properly
let state = {
    jobs: JSON.parse(localStorage.getItem('hvac_data')) || [],
    reviewLink: localStorage.getItem('hvac_review_link') || "https://g.page/r/your-link/review",
    currentView: 'dashboard'
};

// Utility to save to localStorage
function persist() {
    localStorage.setItem('hvac_data', JSON.stringify(state.jobs));
    localStorage.setItem('hvac_review_link', state.reviewLink);
}

// Toggle the entry form
function toggleForm() {
    const el = document.getElementById('form-overlay');
    el.classList.toggle('hidden');
}

// Submit the form without popups
function submitForm() {
    const client = document.getElementById('f-client').value;
    const task = document.getElementById('f-task').value;
    const amount = parseFloat(document.getElementById('f-amount').value || 0);
    const type = document.getElementById('f-type').value;

    if (!client || !task) {
        alert("Please enter a Client and Task");
        return;
    }

    const newEntry = {
        id: Date.now(),
        client,
        task,
        amount,
        type,
        status: 'Active', // Ensure every new entry is 'Active' so it shows up
        date: new Date().toLocaleDateString('en-NZ')
    };

    state.jobs.push(newEntry);
    persist();
    toggleForm();
    
    // Reset fields
    document.getElementById('f-client').value = '';
    document.getElementById('f-task').value = '';
    document.getElementById('f-amount').value = '';

    // Route user to the correct view
    type === 'Quote' ? renderQuotes() : renderDashboard();
}

// Complete Job & Copy Review
function completeJob(id) {
    const job = state.jobs.find(j => j.id === id);
    job.status = 'Completed';
    persist();
    
    const reviewMsg = `Hi ${job.client}, thanks for the work today! If you have a moment, we'd love a Google review: ${state.reviewLink}`;
    
    navigator.clipboard.writeText(reviewMsg).then(() => {
        alert("Success! Job closed and review link copied to your clipboard.");
        renderDashboard();
    }).catch(() => {
        alert("Job closed! (Tip: Enable clipboard permissions for auto-copy)");
        renderDashboard();
    });
}

// Render Dashboard (Active Jobs)
function renderDashboard() {
    state.currentView = 'dashboard';
    const container = document.getElementById('app-content');
    const activeJobs = state.jobs.filter(j => j.type === 'Job' && j.status === 'Active');

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-black text-gray-800">My Jobs</h2>
            <p class="text-sm text-gray-500">${activeJobs.length} active jobs on the go</p>
        </div>
        <div class="space-y-4">
            ${activeJobs.length === 0 ? '<div class="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">No active jobs. Tap + to add one.</div>' : ''}
            ${activeJobs.map(job => `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-gray-900">${job.client}</h3>
                        <p class="text-xs text-gray-500 mb-2">${job.task}</p>
                        <p class="text-blue-700 font-bold">$${(job.amount * 1.15).toFixed(2)} <span class="text-[10px] opacity-50">INC GST</span></p>
                    </div>
                    <button onclick="completeJob(${job.id})" class="bg-blue-600 text-white h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <i data-lucide="check-check"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

// Render Quotes
function renderQuotes() {
    state.currentView = 'quotes';
    const container = document.getElementById('app-content');
    const quotes = state.jobs.filter(j => j.type === 'Quote' && j.status === 'Active');

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-black text-gray-800">Quotes</h2>
            <p class="text-sm text-gray-500">Pending estimates</p>
        </div>
        <div class="space-y-4">
            ${quotes.length === 0 ? '<div class="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">No pending quotes.</div>' : ''}
            ${quotes.map(q => `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-bold text-gray-900">${q.client}</h3>
                    <p class="text-xs text-gray-500 mb-2">${q.task}</p>
                    <div class="flex justify-between items-center">
                        <p class="text-gray-900 font-bold">$${(q.amount * 1.15).toFixed(2)}</p>
                        <button onclick="alert('Convert to Job coming soon!')" class="text-xs font-bold text-blue-600 uppercase tracking-widest">Convert to Job</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});
