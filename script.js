const API_URL = window.location.origin;

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
      statusEl.innerText = "Reply sent successfully!";
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
}
