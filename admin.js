const API_URL = window.location.origin;

let currentAdminPassword = '';

// Admin login
async function adminLogin() {
  const password = document.getElementById('adminPassword').value;
  const statusEl = document.getElementById('loginStatus');
  
  if (!password) {
    showStatus(statusEl, 'Please enter admin password', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    
    if (data.success) {
      currentAdminPassword = password;
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      showStatus(statusEl, 'Login successful!', 'success');
      
      // Load initial data
      loadUsers();
      loadReplies();
      loadCurrentQuestion();
    } else {
      showStatus(statusEl, data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showStatus(statusEl, 'Server error. Please try again.', 'error');
  }
}

// Create new user
async function createUser() {
  const name = document.getElementById('newUserName').value.trim();
  const password = document.getElementById('newUserPassword').value.trim();
  const statusEl = document.getElementById('createUserStatus');

  if (!name || !password) {
    showStatus(statusEl, 'Please enter both name and password', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        adminPassword: currentAdminPassword, 
        name, 
        password 
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      showStatus(statusEl, 'User created successfully!', 'success');
      document.getElementById('newUserName').value = '';
      document.getElementById('newUserPassword').value = '';
      loadUsers(); // Refresh users list
    } else {
      showStatus(statusEl, data.error || 'Failed to create user', 'error');
    }
  } catch (err) {
    showStatus(statusEl, 'Server error. Please try again.', 'error');
  }
}

// Load current question
async function loadCurrentQuestion() {
  try {
    const res = await fetch(`${API_URL}/question`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('currentQuestion').value = data.question;
    }
  } catch (err) {
    console.error('Failed to load current question');
  }
}

// Update question
async function updateQuestion() {
  const question = document.getElementById('currentQuestion').value.trim();
  const statusEl = document.getElementById('questionStatus');

  if (!question) {
    showStatus(statusEl, 'Please enter a question', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        adminPassword: currentAdminPassword, 
        question 
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      showStatus(statusEl, 'Question updated successfully!', 'success');
    } else {
      showStatus(statusEl, data.error || 'Failed to update question', 'error');
    }
  } catch (err) {
    showStatus(statusEl, 'Server error. Please try again.', 'error');
  }
}

// Load users
async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/admin/users?adminPassword=${encodeURIComponent(currentAdminPassword)}`);
    if (res.ok) {
      const users = await res.json();
      displayUsers(users);
    } else {
      document.getElementById('usersList').innerHTML = '<p style="color: red;">Failed to load users</p>';
    }
  } catch (err) {
    document.getElementById('usersList').innerHTML = '<p style="color: red;">Server error</p>';
  }
}

// Display users
function displayUsers(users) {
  const usersListEl = document.getElementById('usersList');
  
  if (users.length === 0) {
    usersListEl.innerHTML = '<p>No users found.</p>';
    return;
  }

  usersListEl.innerHTML = users.map(user => {
    const status = user.is_deleted ? 'DEACTIVATED' : 'ACTIVE';
    const statusColor = user.is_deleted ? '#dc3545' : '#28a745';
    const actionButton = user.is_deleted 
      ? `<button class="btn" onclick="restoreUser('${user._id}', '${user.name}')">Restore User</button>`
      : `<button class="btn btn-danger" onclick="deleteUser('${user._id}', '${user.name}')">Deactivate User</button>`;
    
    return `
      <div class="user-item" style="border-left-color: ${statusColor};">
        <strong>Name:</strong> ${user.name}<br>
        <strong>Password:</strong> ${user.password}<br>
        <strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span><br>
        <strong>Created:</strong> ${new Date(user.created_at).toLocaleString()}<br>
        ${user.is_deleted && user.deleted_at ? `<strong>Deactivated:</strong> ${new Date(user.deleted_at).toLocaleString()}<br>` : ''}
        ${actionButton}
      </div>
    `;
  }).join('');
}

// Delete user (soft delete)
async function deleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to deactivate user "${userName}"? Their replies will be preserved and they can be restored later.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: currentAdminPassword })
    });

    const data = await res.json();
    
    if (res.ok) {
      alert('User deactivated successfully! Their replies are preserved.');
      loadUsers();
      loadReplies(); // Refresh replies to show updated status
    } else {
      alert(data.error || 'Failed to deactivate user');
    }
  } catch (err) {
    alert('Server error. Please try again.');
  }
}

// Restore user
async function restoreUser(userId, userName) {
  if (!confirm(`Are you sure you want to restore user "${userName}"?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}/restore`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: currentAdminPassword })
    });

    const data = await res.json();
    
    if (res.ok) {
      alert('User restored successfully!');
      loadUsers();
    } else {
      alert(data.error || 'Failed to restore user');
    }
  } catch (err) {
    alert('Server error. Please try again.');
  }
}

// Load replies
async function loadReplies() {
  try {
    const res = await fetch(`${API_URL}/admin/replies?adminPassword=${encodeURIComponent(currentAdminPassword)}`);
    if (res.ok) {
      const replies = await res.json();
      displayReplies(replies);
    } else {
      document.getElementById('repliesList').innerHTML = '<p style="color: red;">Failed to load replies</p>';
    }
  } catch (err) {
    document.getElementById('repliesList').innerHTML = '<p style="color: red;">Server error</p>';
  }
}

// Display replies
function displayReplies(replies) {
  const repliesListEl = document.getElementById('repliesList');
  
  if (replies.length === 0) {
    repliesListEl.innerHTML = '<p>No replies found.</p>';
    return;
  }

  repliesListEl.innerHTML = replies.map(reply => {
    // Check if user exists and get status
    const userStatus = reply.userId && reply.userId.name ? 'ACTIVE' : 'DEACTIVATED';
    const statusColor = userStatus === 'ACTIVE' ? '#28a745' : '#dc3545';
    
    return `
      <div class="reply-item">
        <strong>User:</strong> ${reply.userName} (Password: ${reply.userPassword}) 
        <span style="color: ${statusColor}; font-weight: bold; margin-left: 10px;">[${userStatus}]</span><br>
        <strong>Question:</strong> ${reply.question}<br>
        <strong>Reply:</strong> ${reply.reply}<br>
        <strong>Submitted:</strong> ${new Date(reply.created_at).toLocaleString()}
      </div>
    `;
  }).join('');
}

// Utility function to show status messages
function showStatus(element, message, type) {
  element.innerHTML = `<div class="status ${type}">${message}</div>`;
  setTimeout(() => {
    element.innerHTML = '';
  }, 5000);
}

// Logout
function logout() {
  currentAdminPassword = '';
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('adminPassword').value = '';
}

// Handle Enter key for admin login
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('adminPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      adminLogin();
    }
  });
});