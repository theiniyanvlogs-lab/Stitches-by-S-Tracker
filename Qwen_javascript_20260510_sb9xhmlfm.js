let transactions = [];
let userEmail = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setDefaultDate();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    // For demo, we'll use a simple email input
    // In production, implement Firebase Auth
    const email = prompt("Enter your email (e.g., callpavithra52@gmail.com):");
    if (email) {
        userEmail = email;
        loadTransactions();
    } else {
        updateSyncStatus('❌ Authentication required', 'error');
    }
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('transactionForm').addEventListener('submit', addTransaction);
    document.getElementById('searchInput').addEventListener('input', filterAndRender);
    document.getElementById('filterMonth').addEventListener('change', filterAndRender);
    document.getElementById('pdfReportBtn').addEventListener('click', generatePDFReport);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    document.getElementById('exportBtn').addEventListener('click', exportData);
}

// Add transaction
async function addTransaction(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now().toString(),
        userEmail: userEmail,
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        updateSyncStatus('💾 Saving...', '');
        await db.collection('transactions').add(transaction);
        
        document.getElementById('transactionForm').reset();
        setDefaultDate();
        
        updateSyncStatus('✅ Transaction added!', 'synced');
        setTimeout(() => updateSyncStatus('✅ Live synced', 'synced'), 2000);
    } catch (err) {
        console.error('Error:', err);
        updateSyncStatus('❌ Error saving', 'error');
    }
}

// Load transactions
async function loadTransactions() {
    updateSyncStatus('🔄 Loading...', '');
    
    try {
        const snapshot = await db.collection('transactions')
            .where('userEmail', '==', userEmail)
            .orderBy('date', 'desc')
            .get();
        
        transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTransactions();
        updateSummary();
        updateSyncStatus('✅ Live synced', 'synced');
    } catch (err) {
        console.error('Error loading:', err);
        updateSyncStatus('❌ Sync error', 'error');
    }
}

// Render transactions
function renderTransactions(data = transactions) {
    const list = document.getElementById('transactionsList');
    
    if (data.length === 0) {
        list.innerHTML = '<p class="empty-msg">No transactions yet. Add your first transaction!</p>';
        return;
    }
    
    list.innerHTML = data.map(t => `
        <div class="transaction-item ${t.type}">
            <div class="transaction-info">
                <h4>${t.category}</h4>
                <p>📅 ${formatDate(t.date)} • ${t.description}</p>
            </div>
            <div class="transaction-amount">
                ${t.type === 'income' ? '+' : '-'}₹${t.amount.toFixed(2)}
            </div>
            <button class="btn-delete" onclick="deleteTransaction('${t.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    
    try {
        updateSyncStatus('🗑️ Deleting...', '');
        await db.collection('transactions').doc(id).delete();
        
        transactions = transactions.filter(t => t.id !== id);
        renderTransactions();
        updateSummary();
        
        updateSyncStatus('✅ Deleted!', 'synced');
        setTimeout(() => updateSyncStatus('✅ Live synced', 'synced'), 2000);
    } catch (err) {
        console.error('Error:', err);
        updateSyncStatus('❌ Delete failed', 'error');
    }
}

// Filter and render
function filterAndRender() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const monthFilter = document.getElementById('filterMonth').value;
    
    let filtered = transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(search) || 
                           t.category.toLowerCase().includes(search);
        
        let matchMonth = true;
        if (monthFilter === 'current') {
            const now = new Date();
            const tDate = new Date(t.date);
            matchMonth = tDate.getMonth() === now.getMonth() && 
                        tDate.getFullYear() === now.getFullYear();
        } else if (monthFilter === 'last') {
            const now = new Date();
            const tDate = new Date(t.date);
            const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            matchMonth = tDate.getMonth() === lastMonth && tDate.getFullYear() === lastYear;
        }
        
        return matchSearch && matchMonth;
    });
    
    renderTransactions(filtered);
}

// Update summary
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${expenses.toFixed(2)}`;
    document.getElementById('netBalance').textContent = `₹${balance.toFixed(2)}`;
}

// Generate PDF Report
function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    
    // Header
    doc.setFontSize(20);
    doc.text('Stitches by S: Financial Report', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    doc.text(`User: ${userEmail}`, 105, 28, { align: 'center' });
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Total Credit: ${totalIncome.toFixed(2)}`, 14, 40);
    doc.text(`Total Debit: ${totalExpenses.toFixed(2)}`, 80, 40);
    doc.text(`Net Balance: ${netBalance.toFixed(2)}`, 150, 40);
    
    // Table
    const tableColumn = ["Date", "Category", "Credit (Income)", "Debit (Expense)", "Description"];
    const tableRows = transactions.map(t => [
        t.date,
        t.category,
        t.type === 'income' ? t.amount.toFixed(2) : '-',
        t.type === 'expense' ? t.amount.toFixed(2) : '-',
        t.description
    ]);
    
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [45, 52, 54] },
        styles: { fontSize: 9 }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text('Powered by iniyan.talkies', 105, 285, { align: 'center' });
    
    // Save
    doc.save(`StitchesByS_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    updateSyncStatus('📄 PDF Report generated!', 'synced');
}

// Clear all data
async function clearAllData() {
    if (!confirm('⚠️ Delete ALL transactions? This cannot be undone!')) return;
    
    try {
        updateSyncStatus('🗑️ Clearing...', '');
        const snapshot = await db.collection('transactions')
            .where('userEmail', '==', userEmail)
            .get();
        
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        transactions = [];
        renderTransactions();
        updateSummary();
        
        updateSyncStatus('✅ All data cleared', 'synced');
    } catch (err) {
        console.error('Error:', err);
        updateSyncStatus('❌ Clear failed', 'error');
    }
}

// Export data
function exportData() {
    const data = {
        userEmail: userEmail,
        exportDate: new Date().toISOString(),
        totalTransactions: transactions.length,
        transactions: transactions
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stitches_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    updateSyncStatus('💾 Data exported!', 'synced');
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

// Update sync status
function updateSyncStatus(msg, status) {
    const el = document.getElementById('syncStatus');
    document.getElementById('syncText').textContent = msg;
    el.className = 'sync-status ' + status;
}