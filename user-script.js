const API_URL = window.location.origin;

// Check user authentication
function checkUserAuth() {
  const userId = sessionStorage.getItem('userId');
  const userName = sessionStorage.getItem('userName');
  const userPassword = sessionStorage.getItem('userPassword');

  if (!userId || !userName || !userPassword) {
    alert('Please login first!');
    window.location.href = '/';
    return;
  }

  // Display user name
  document.getElementById('userName').textContent = userName;
}

// Load current question
async function loadQuestion() {
  try {
    const res = await fetch(`${API_URL}/question`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('questionText').textContent = data.question;
    } else {
      document.getElementById('questionText').textContent = "No question available at the moment.";
    }
  } catch (err) {
    document.getElementById('questionText').textContent = "Failed to load question.";
  }
}

// Send reply
async function sendReply() {
  const reply = document.getElementById("reply").value.trim();
  const statusEl = document.getElementById("status");
  
  if (!reply) {
    statusEl.innerText = "Reply cannot be empty!";
    statusEl.style.color = "red";
    return;
  }

  const userId = sessionStorage.getItem('userId');
  const userPassword = sessionStorage.getItem('userPassword');

  if (!userId || !userPassword) {
    statusEl.innerText = "Authentication error. Please login again.";
    statusEl.style.color = "red";
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId, 
        userPassword, 
        reply 
      }),
    });

    const data = await res.json();

    if (res.ok) {
      statusEl.innerText = "Reply sent successfully! Thank you for your response.";
      statusEl.style.color = "#28a745";
      document.getElementById("reply").value = "";
    } else {
      statusEl.innerText = data.error || "Failed to send reply.";
      statusEl.style.color = "red";
    }
  } catch (err) {
    statusEl.innerText = "Server error. Please try again.";
    statusEl.style.color = "red";
  }

  // Clear status after 5 seconds
  setTimeout(() => {
    statusEl.innerText = "";
  }, 5000);
}

// Logout function
function logout() {
  sessionStorage.clear();
  window.location.href = '/';
}

// Handle Enter key for reply submission
document.addEventListener('DOMContentLoaded', function() {
  const replyTextarea = document.getElementById('reply');
  if (replyTextarea) {
    replyTextarea.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        sendReply();
      }
    });
  }
});