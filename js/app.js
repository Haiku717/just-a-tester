// 1. Setup & Data Persistence
lucide.createIcons();
let state = {
    view: 'dashboard',
    jobs: JSON.parse(localStorage.getItem('hvac_jobs')) || [],
    settings: JSON.parse(localStorage.getItem('hvac_settings')) || { bizName: "My Trade Co", reviewLink: "", gstNumber: "" }
};

const save = () => localStorage.setItem('hvac_jobs', JSON.stringify(state.jobs));
const saveSettings = () => localStorage.setItem('hvac_settings', JSON.stringify(state.settings));

// 2. View Controller
function setView(viewName) {
    state.view = viewName;
    render();
}

// 3. Logic: Add Job / Quote
function createJob(type = 'Job') {
    const client = prompt("Client Name:");
    if (!client) return;
    const task = prompt(`${type} Description:`);
    const amount = parseFloat(prompt("Estimated Amount (Excl. GST):") || 0);

    const newJob = {
        id: Date.now(),
        client,
        task,
        amount,
        type: type, // 'Job' or 'Quote'
        status: type === 'Quote' ? 'Pending' : 'Active',
        date: new Date().toLocaleDateString()
    };

    state.jobs.push(newJob);
    save();
    render();
}

// 4. Logic: Conversion & Payment
function markAsPaid(id) {
    const job = state.jobs.find(j => j.id === id);
    job.status = 'Paid';
    // Trigger Review Copy
    const msg = `Hi ${job.client}, thanks for the business! Hope you're happy with the work. Would you mind leaving us a quick review? ${state.settings.reviewLink}`;
    navigator.clipboard.writeText(msg);
    alert("Invoiced marked PAID. Review request copied to clipboard!");
    save();
    render();
}

// 5. The Render Engine
function render() {
    const main = document.getElementById('job-list');
    
    // Stats for Dashboard
    const totalPending = state.jobs.filter(j => j.status === 'Active').reduce((acc, j) => acc + j.amount, 0);
    const overdueCount = state.jobs.filter(j => j.status === 'Active').length;

    if (state.view === 'dashboard') {
        main.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p class="text-xs text-blue-600 font-bold uppercase">Pipeline</p>
                    <p class="text-xl font-bold">$${(totalPending * 1.15).toFixed(2)} <span class="text-xs font-normal text-gray-500">inc. GST</span></p>
                </div>
                <div class="bg-orange-50 p-4 rounded-xl border border-orange-200 text-right">
                    <p class="text-xs text-orange-600 font-bold uppercase">Active Jobs</p>
                    <p class="text-xl font-bold">${overdueCount}</p>
                </div>
            </div>
            <div class="space-y-3">
                <h2 class="font-bold text-gray-700">In Progress</h2>
                ${renderJobList('Active')}
            </div>
        `;
    } else if (state.view === 'quotes') {
        main.innerHTML = `
            <h2 class="font-bold text-gray-700 mb-4">Quotes & Estimates</h2>
            <button onclick="createJob('Quote')" class="w-full bg-blue-100 text-blue-700 p-3 rounded-lg font-bold mb-4">+ Create New Quote</button>
            ${renderJobList('Pending', 'Quote')}
        `;
    }

    lucide.createIcons();
}

function renderJobList(status, typeFilter = 'Job') {
    const filtered = state.jobs.filter(j => j.status === status);
    if (filtered.length === 0) return `<p class="text-gray-400 text-center py-4">Nothing here yet.</p>`;
    
    return filtered.map(job => `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <h3 class="font-bold text-gray-800">${job.client}</h3>
                    <span class="text-[10px] bg-gray-100 px-1 rounded">${job.date}</span>
                </div>
                <p class="text-sm text-gray-500">${job.task}</p>
                <p class="text-sm font-bold text-blue-600">$${(job.amount * 1.15).toFixed(2)}</p>
            </div>
            <button onclick="markAsPaid(${job.id})" class="bg-green-600 text-white p-2 rounded-lg ml-2">
                <i data-lucide="check" size="18"></i>
            </button>
        </div>
    `).join('');
}

// Run initial render
render();
