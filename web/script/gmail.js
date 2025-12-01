const API_KEY = "AIzaSyDGnyh_Cdm48eLB4z_8Gxmf9pIJnXMUCHw";
const CLIENT_ID =
  "812299472977-2mea8dbh4rb5ut9i099cbkaht9h22k0v.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

let tokenClient;
let gapiInited = false;
let gisInited = false;

function updateStatus(message) {
  document.getElementById("status-text").textContent = message;
}

//  Loads and initializes the Gmail API client
function gapiLoaded() {
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
      ],
    });
    gapiInited = true;
    maybeStart();
  });
}

// This is part of the Google authentication flow for accessing Gmail data in your app.
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "",
  });
  gisInited = true;
  maybeStart();
}

function maybeStart() {
  // Only start the authentication and data fetching process when both gapi and gis are initialized
  if (!gapiInited || !gisInited) return;

  tokenClient.callback = async (resp) => {
    if (resp.error) {
      console.error("Token error:", resp);
      updateStatus("Authentication failed. Please try again.");
      return;
    }
    try {
      await fetchGmailData();
    } catch (e) {
      console.error("Fetch error:", e);
      updateStatus("Error fetching emails. Please try again.");
    }
  };

  if (!gapi.client.getToken()) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    fetchGmailData();
  }
}

async function fetchGmailData() {
  updateStatus("Fetching messages from Gmail...");

  try {
    const listRes = await gapi.client.gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      q: "category:primary",
    });
    console.log("Fetched message list:", listRes);

    if (!listRes.result.messages || listRes.result.messages.length === 0) {
      updateStatus("No messages found. Redirecting...");
      setTimeout(() => {
        window.location.href = "all_mail.html";
      }, 1500);
      return;
    }

    const emails = [];
    updateStatus(`Processing ${listRes.result.messages.length} messages...`);

    for (const msg of listRes.result.messages) {
      const msgRes = await gapi.client.gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });
      console.log("msgRes", msgRes);

      const payload = msgRes.result.payload || {};
      const headers = payload.headers || [];

      const subject =
        (headers.find((h) => h.name === "Subject") || {}).value ||
        "(no subject)";
      const from =
        (headers.find((h) => h.name === "From") || {}).value ||
        "(unknown sender)";
      const date = (headers.find((h) => h.name === "Date") || {}).value || "";
      const to = (headers.find((h) => h.name === "To") || {}).value || "";

      const bodyText = extractMessageBody(payload);
      const preview = bodyText
        ? bodyText.slice(0, 200).replace(/\s+/g, " ").trim()
        : "(no body)";

      const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, from, from];
      const senderName = senderMatch[1]?.trim() || from;
      const senderEmail = senderMatch[2]?.trim() || from;

      const categories = await getPredictions(subject, bodyText);

      emails.push({
        id: msg.id,
        sender: senderName,
        senderEmail: senderEmail,
        subject: subject,
        preview: preview,
        time: formatDate(date),
        date: date,
        to: to,
        content: bodyText,
        categories: categories.labels || [],
        scores: categories.scores || {},
      });
    }

    updateStatus("Storing emails...");
    try {
      const existingEmails = localStorage.getItem("gmail_emails");
      if (existingEmails) {
        localStorage.removeItem("gmail_emails");
      }

      localStorage.setItem("gmail_emails", JSON.stringify(emails));
      console.log(`Stored ${emails.length} emails in localStorage`);
      updateStatus(`Successfully stored ${emails.length} emails!`);

      // Redirect after success
      setTimeout(() => {
        window.location.href = "all_mail.html";
      }, 1000);
    } catch (storageError) {
      console.error("Storage error:", storageError);
      updateStatus("Error storing emails. Please try again.");
    }
  } catch (err) {
    console.error("Error fetching Gmail data:", err);
    updateStatus("Error fetching emails. Please try again.");
  }
}

async function getPredictions(subject, body) {
  try {
    const text = `${subject} ${body}`.trim();

    const response = await fetch(
      `http://0.0.0.0:8000/predict?text=${encodeURIComponent(text)}&threshold=0.55&return_all=false`
    );

    if (!response.ok) {
      console.error("API error:", response.status);
      return { labels: [], scores: {} };
    }

    const data = await response.json();
    const predictions = data.predictions.slice(0, 2);
    const labels = predictions.map((p) => p.label);
    const scores = {};
    predictions.forEach((p) => {
      scores[p.label] = p.score;
    });

    return { labels, scores };
  } catch (error) {
    console.error("Error getting predictions:", error);
    return { labels: [], scores: {} };
  }
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

function extractMessageBody(payload) {
  const parts = [];

  function walk(part) {
    if (!part) return;
    if (part.parts && part.parts.length) {
      part.parts.forEach(walk);
    } else {
      parts.push(part);
    }
  }

  walk(payload);

  const candidate =
    parts.find((p) => p.mimeType === "text/plain") ||
    (payload.mimeType === "text/plain" ? payload : null);

  if (!candidate || !candidate.body || !candidate.body.data) return "";

  const body = candidate.body.data;
  const decoded = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
  return decoded;
}

window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
