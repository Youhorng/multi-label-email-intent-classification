// Function to load emails from localStorage
function loadEmailsFromStorage() {
  const storedEmails = localStorage.getItem("gmail_emails");

  if (storedEmails) {
    try {
      return JSON.parse(storedEmails);
    } catch (e) {
      console.error("Error parsing stored emails:", e);
      return [];
    }
  }

  // Return empty array if no emails stored
  return [];
}

// Load emails from localStorage
let emails = loadEmailsFromStorage();

// Add filter functionality
let currentLabelFilter = "all";
let currentSortOrder = "newest";

// Function to get category color classes
function getCategoryColorClasses(category) {
  const colorMap = {
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
    "Personal Communication": "bg-blue-100 text-blue-700",
    "Work & Professional": "bg-green-100 text-green-700",
  };
  return colorMap[category] || "bg-gray-100 text-gray-700";
}

// Function to update email detail view
function updateEmailDetail(email) {
  document.getElementById("email-subject").textContent = email.subject;
  document.getElementById("email-sender").textContent = email.sender;

  const senderEmailEl = document.getElementById("email-sender-email");
  senderEmailEl.textContent = `to ${email.to || "me"}`;

  const avatarLetter = email.sender.charAt(0).toUpperCase();
  document.getElementById("email-avatar").textContent = avatarLetter;

  document.getElementById("email-time").textContent = email.time;

  const categoriesContainer = document.getElementById("email-categories");
  if (email.categories && email.categories.length > 0) {
    categoriesContainer.innerHTML = email.categories
      .map(
        (category) =>
          `<span class="inline-block px-3 py-1 ${getCategoryColorClasses(category)} text-sm font-medium rounded-full">
                  ${category}
                </span>`
      )
      .join("");
    categoriesContainer.style.display = "flex";
  } else {
    categoriesContainer.style.display = "none";
  }

  document.getElementById("email-content").innerHTML = email.content;
  document.getElementById("email-detail").classList.remove("hidden");
  document.getElementById("email-detail").classList.add("md:flex");
}

// Function to render email list with filters
function renderEmailList() {
  const emailListContainer = document.getElementById("email-list");

  // Check if emails array is empty
  if (emails.length === 0) {
    emailListContainer.innerHTML = `
                <div class="p-8 text-center">
                  <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 text-lg font-medium mb-2">No emails found</p>
                  <p class="text-gray-400 text-sm mb-4">Please sync your Gmail account first</p>
                  <a href="gmail.html" class="inline-block px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                    Sync Gmail
                  </a>
                </div>
              `;
    return;
  }

  let filteredEmails = [...emails];

  if (currentLabelFilter !== "all") {
    filteredEmails = filteredEmails.filter(
      (email) =>
        email.categories && email.categories.includes(currentLabelFilter)
    );
  }

  // Sort emails
  if (currentSortOrder === "newest") {
    filteredEmails.sort((a, b) => new Date(b.time) - new Date(a.time));
  } else if (currentSortOrder === "oldest") {
    filteredEmails.sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  if (filteredEmails.length === 0) {
    emailListContainer.innerHTML = `
            <div class="p-8 text-center">
              <i class="fas fa-filter text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500 text-lg font-medium mb-2">No emails found</p>
              <p class="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          `;
    return;
  }

  emailListContainer.innerHTML = filteredEmails
    .map(
      (email, index) => `
              <div
                class="email-item border-l-4 ${index === 0 ? "border-blue-500 bg-blue-50" : "border-transparent"} p-4 cursor-pointer hover:bg-${index === 0 ? "blue" : "gray"}-${index === 0 ? "100" : "50"} transition"
                data-email-id="${email.id}"
              >
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-gray-900 text-base md:text-lg">
                    ${email.sender}
                  </h3>
                  <span class="text-sm text-gray-500">${email.time}</span>
                </div>
                <p class="text-sm md:text-base font-medium text-gray-800 mb-1">
                  ${email.subject}
                </p>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                  ${email.preview}
                </p>
                ${
                  email.categories && email.categories.length > 0
                    ? `<div class="flex flex-wrap gap-1 mt-2">
                        ${email.categories
                          .map(
                            (category) =>
                              `<span class="inline-block px-2 py-0.5 ${getCategoryColorClasses(category)} text-xs font-medium rounded-full">
                                ${category}
                              </span>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }
              </div>
            `
    )
    .join("");

  // Add click event listeners
  attachEmailClickListeners();

  // Load first email by default
  if (filteredEmails.length > 0) {
    updateEmailDetail(filteredEmails[0]);
  }
}

// Function to attach click listeners to email items
function attachEmailClickListeners() {
  const emailItems = document.querySelectorAll(".email-item");
  const mobileEmailDetail = document.getElementById("mobile-email-detail");

  emailItems.forEach((item) => {
    item.addEventListener("click", function () {
      const emailId = this.getAttribute("data-email-id");
      const selectedEmail = emails.find((email) => email.id === emailId);

      emailItems.forEach((i) => {
        i.classList.remove("border-blue-500", "bg-blue-50");
        i.classList.add("border-transparent");
      });

      this.classList.remove("border-transparent");
      this.classList.add("border-blue-500", "bg-blue-50");

      if (selectedEmail) {
        updateEmailDetail(selectedEmail);
      }

      if (window.innerWidth < 768) {
        mobileEmailDetail?.classList.remove("hidden");
      }
    });
  });
}

const mobileSidebarBtn = document.getElementById("mobile-sidebar-btn");
const mobileSidebar = document.getElementById("mobile-sidebar");
const closeSidebar = document.getElementById("close-sidebar");

if (mobileSidebarBtn) {
  mobileSidebarBtn.addEventListener("click", () => {
    mobileSidebar.classList.remove("hidden");
  });
}

if (closeSidebar) {
  closeSidebar.addEventListener("click", () => {
    mobileSidebar.classList.add("hidden");
  });
}

mobileSidebar?.addEventListener("click", (e) => {
  if (e.target === mobileSidebar) {
    mobileSidebar.classList.add("hidden");
  }
});

// Initialize email list and filter functionality on page load
document.addEventListener("DOMContentLoaded", () => {
  renderEmailList();

  const labelFilterBtn = document.getElementById("label-filter-btn");
  const labelDropdown = document.getElementById("label-dropdown");

  if (labelFilterBtn && labelDropdown) {
    labelFilterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      labelDropdown.classList.toggle("hidden");
      const sortDropdown = document.getElementById("sort-dropdown");
      sortDropdown?.classList.add("hidden");
    });

    document.querySelectorAll("[data-label]").forEach((option) => {
      option.addEventListener("click", function () {
        const label = this.getAttribute("data-label");
        const labelText = this.textContent.trim();

        currentLabelFilter = label;
        labelFilterBtn.querySelector("span").textContent =
          label === "all" ? "All labels" : labelText;
        labelDropdown.classList.add("hidden");
        renderEmailList();
      });
    });
  }

  const sortFilterBtn = document.getElementById("sort-filter-btn");
  const sortDropdown = document.getElementById("sort-dropdown");

  if (sortFilterBtn && sortDropdown) {
    sortFilterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      sortDropdown.classList.toggle("hidden");
      labelDropdown?.classList.add("hidden");
    });

    document.querySelectorAll("[data-sort]").forEach((option) => {
      option.addEventListener("click", function () {
        const sort = this.getAttribute("data-sort");
        const sortText = this.textContent.trim();

        currentSortOrder = sort;
        sortFilterBtn.querySelector("span").textContent = sortText;
        sortDropdown.classList.add("hidden");
        renderEmailList();
      });
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", function () {
    labelDropdown?.classList.add("hidden");
    sortDropdown?.classList.add("hidden");
  });
});
