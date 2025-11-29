const API_BASE_URL = "http://0.0.0.0:8000";
const CLASSIFICATION_THRESHOLD = 0.55;

document.addEventListener("DOMContentLoaded", function () {
  const mobileSidebarBtn = document.getElementById("mobile-sidebar-btn");
  const mobileSidebar = document.getElementById("mobile-sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar");
  const classifyForm = document.getElementById("classify-form");
  const emptyState = document.getElementById("empty-state");
  const resultState = document.getElementById("result-state");

  function openMobileSidebar() {
    mobileSidebar.classList.remove("hidden");
  }

  function closeMobileSidebar() {
    mobileSidebar.classList.add("hidden");
  }

  if (mobileSidebarBtn) {
    mobileSidebarBtn.addEventListener("click", openMobileSidebar);
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", closeMobileSidebar);
  }

  if (mobileSidebar) {
    mobileSidebar.addEventListener("click", function (event) {
      if (event.target === mobileSidebar) {
        closeMobileSidebar();
      }
    });
  }

  function getCategoryColorClasses(category) {
    const categoryColors = {
      Business: "bg-blue-100 text-blue-700",
      Personal: "bg-purple-100 text-purple-700",
      Promotions: "bg-pink-100 text-pink-700",
      "Customer Support": "bg-red-100 text-red-700",
      "Job Application": "bg-indigo-100 text-indigo-700",
      "Finance & Bills": "bg-yellow-100 text-yellow-700",
      "Events & Invitations": "bg-green-100 text-green-700",
      "Travel & Bookings": "bg-teal-100 text-teal-700",
      Reminders: "bg-orange-100 text-orange-700",
      Newsletters: "bg-cyan-100 text-cyan-700",
    };

    return categoryColors[category] || "bg-gray-100 text-gray-700";
  }

  function displayCategoryLabels(predictions) {
    const labelsContainer = document.getElementById("result-labels");

    if (!predictions || predictions.length === 0) {
      labelsContainer.innerHTML =
        '<span class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">No category detected</span>';
      return;
    }

    const labelBadges = predictions
      .map((prediction) => {
        const colorClasses = getCategoryColorClasses(prediction.label);
        return `<span class="px-4 py-2 ${colorClasses} rounded-full text-sm font-medium">${prediction.label}</span>`;
      })
      .join("");

    labelsContainer.innerHTML = labelBadges;
  }

  // Display confidence scores with progress bars
  function displayConfidenceScores(probabilities) {
    const scoresContainer = document.getElementById("result-scores");

    if (!probabilities || probabilities.length === 0) {
      scoresContainer.innerHTML =
        '<p class="text-gray-400 text-sm">No scores available</p>';
      return;
    }

    const scoreElements = probabilities
      .map((item) => {
        const percentage = (item.score * 100).toFixed(1);
        const isAboveThreshold = item.score >= CLASSIFICATION_THRESHOLD;
        const barColor = isAboveThreshold ? "bg-blue-500" : "bg-gray-400";
        const textColor = isAboveThreshold ? "text-blue-600" : "text-gray-900";

        return `
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700">${item.label}</span>
              <span class="font-medium ${textColor}">${percentage}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="${barColor} h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
      })
      .join("");

    scoresContainer.innerHTML = scoreElements;
  }

  function displayEmailInfo(title, sender, receiveTime) {
    document.getElementById("result-title").textContent = title;
    document.getElementById("result-sender").textContent = sender;

    const formattedTime = new Date(receiveTime).toLocaleString();
    document.getElementById("result-time").textContent = formattedTime;
  }

  function showResults() {
    emptyState.classList.add("hidden");
    resultState.classList.remove("hidden");
  }

  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.dataset.originalContent = button.innerHTML;
      button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i><span class="ml-2">Classifying...</span>';
      button.disabled = true;
    } else {
      button.innerHTML = button.dataset.originalContent;
      button.disabled = false;
    }
  }

  // Call the classification API
  async function classifyEmail(emailText) {
    const url = `${API_BASE_URL}/predict?text=${encodeURIComponent(emailText)}&threshold=${CLASSIFICATION_THRESHOLD}&return_all=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  }

  // Handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault();

    const emailTitle = document.getElementById("email-title").value;
    const sender = document.getElementById("sender").value;
    const receiveTime = document.getElementById("receive-time").value;
    const emailContent = document.getElementById("email-content").value;

    const fullEmailText = `${emailTitle}\n\n${emailContent}`;
    const submitButton = classifyForm.querySelector('button[type="submit"]');

    try {
      setButtonLoading(submitButton, true);

      const apiResponse = await classifyEmail(fullEmailText);
      console.log("API Response:", apiResponse);

      showResults();
      displayCategoryLabels(apiResponse.predictions);
      displayConfidenceScores(apiResponse.all_probabilities);
      displayEmailInfo(emailTitle, sender, receiveTime);
    } catch (error) {
      console.error("Classification error:", error);
      alert(
        `Failed to classify email. Please check if the API is running at ${API_BASE_URL}/`
      );
    } finally {
      setButtonLoading(submitButton, false);
    }
  }

  // Set up form submission handler
  if (classifyForm) {
    classifyForm.addEventListener("submit", handleFormSubmit);
  }
});
