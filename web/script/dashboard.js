const overviewCards = [
  {
    id: "total-mails",
    label: "Total mails",
    icon: "fa-envelope",
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    // percentage: "+11.01%",
    percentageColor: "text-green-500",
  },
  {
    id: "new-mail",
    label: "New mail",
    icon: "fa-envelope-open",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    // percentage: "+11.01%",
    percentageColor: "text-green-500",
  },
  {
    id: "promotion",
    label: "Promotion",
    icon: "fa-tag",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    // percentage: "+11.01%",
    percentageColor: "text-green-500",
    dynamicLabel: true,
  },
  {
    id: "business",
    label: "Business",
    icon: "fa-briefcase",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
    // percentage: "+11.01%",
    percentageColor: "text-green-500",
    dynamicLabel: true,
  },
];

function renderOverviewCards() {
  const container = document.getElementById("overview-cards");

  container.innerHTML = overviewCards
    .map(
      (card) => `
  <div class="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
    <div class="flex items-center space-x-3 mb-3">
      <div class="w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center">
        <i class="fas ${card.icon} ${card.iconColor}"></i>
      </div>
      <span class="text-gray-600 font-medium" ${card.dynamicLabel ? `data-label="${card.id}"` : ""}>
        ${card.label}
      </span>
    </div>
    <div class="flex items-end justify-between">
      <h3 class="text-3xl font-bold text-gray-900" data-stat="${card.id}">
        0
      </h3>
      <div class="flex items-center space-x-1 ${card.percentageColor} text-sm">      
      </div>
    </div>
  </div>
`
    )
    .join("");
}

// Mobile sidebar toggle
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
  return [];
}

function calculateStats(emails) {
  const stats = {
    totalMails: emails.length,
    newMail: 0,
    labelCounts: {},
    recentEmails: [],
    dailyCounts: {},
  };

  // Get the last 7 days
  const today = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    last7Days.push(dateStr);
    stats.dailyCounts[dateStr] = 0;
  }

  emails.forEach((email) => {
    // Count emails by date
    const emailDate = new Date(email.date);
    const emailDateStr = emailDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (stats.dailyCounts.hasOwnProperty(emailDateStr)) {
      stats.dailyCounts[emailDateStr]++;
    }

    // Count by category
    if (email.categories && email.categories.length > 0) {
      email.categories.forEach((category) => {
        stats.labelCounts[category] = (stats.labelCounts[category] || 0) + 1;
      });
    }

    // Check if new (within last 24 hours)
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    if (emailDate > oneDayAgo) {
      stats.newMail++;
    }
  });

  // Get recent 3 emails
  stats.recentEmails = emails
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return stats;
}

// Update UI with data
function updateDashboard() {
  const emails = loadEmailsFromStorage();
  const stats = calculateStats(emails);

  document.querySelector('[data-stat="total-mails"]').textContent =
    stats.totalMails.toLocaleString();
  document.querySelector('[data-stat="new-mail"]').textContent =
    stats.newMail.toLocaleString();

  // Get top 2 categories
  const sortedLabels = Object.entries(stats.labelCounts).sort(
    (a, b) => b[1] - a[1]
  );

  if (sortedLabels.length > 0) {
    document.querySelector('[data-stat="promotion"]').textContent =
      sortedLabels[0][1].toLocaleString();
    document.querySelector('[data-label="promotion"]').textContent =
      sortedLabels[0][0];
  }

  if (sortedLabels.length > 1) {
    document.querySelector('[data-stat="business"]').textContent =
      sortedLabels[1][1].toLocaleString();
    document.querySelector('[data-label="business"]').textContent =
      sortedLabels[1][0];
  }

  // Update recent emails
  updateRecentEmails(stats.recentEmails);

  // Update charts
  updateLineChart(stats.dailyCounts);
  updateBarChart(stats.labelCounts);
  updateDoughnutChart(stats.labelCounts, stats.totalMails);
}

// Update recent emails section
function updateRecentEmails(emails) {
  const container = document.getElementById("recent-emails");
  if (!emails.length) {
    container.innerHTML =
      '<p class="text-gray-500 text-sm">No recent emails</p>';
    return;
  }

  container.innerHTML = emails
    .map(
      (email, index) => `
      <div class="${index < emails.length - 1 ? "pb-4 border-b border-gray-100" : "pb-4"}">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-gray-900 text-sm">
            ${email.sender}
          </h4>
          <span class="text-xs text-gray-500">${email.time}</span>
        </div>
        <p class="text-xs text-gray-500 mb-2 line-clamp-2">
          ${email.subject}
        </p>
        ${
          email.categories && email.categories.length > 0
            ? `
          <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            ${email.categories[0]}
          </span>
        `
            : ""
        }
      </div>
    `
    )
    .join("");
}

// Update line chart with daily counts
function updateLineChart(dailyCounts) {
  const labels = Object.keys(dailyCounts);
  const data = Object.values(dailyCounts);

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Mail",
          data: data,
          borderColor: "#60A5FA",
          backgroundColor: "rgba(96, 165, 250, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: Math.ceil(Math.max(...data) / 4) },
        },
      },
    },
  });
}

// Update bar chart with label counts
function updateBarChart(labelCounts) {
  const sortedLabels = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labels = sortedLabels.map(([label]) =>
    label.length > 10 ? label.substring(0, 10) + "..." : label
  );
  const data = sortedLabels.map(([, count]) => count);

  const colors = [
    "#93C5FD",
    "#6EE7B7",
    "#1F2937",
    "#60A5FA",
    "#C084FC",
    "#86EFAC",
  ];

  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.slice(0, data.length),
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: Math.ceil(Math.max(...data) / 4) },
        },
      },
    },
  });
}

// Update doughnut chart with distribution
function updateDoughnutChart(labelCounts, totalMails) {
  const sortedLabels = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const labels = sortedLabels.map(([label]) => label);
  const data = sortedLabels.map(([, count]) =>
    ((count / totalMails) * 100).toFixed(1)
  );

  // Calculate "Other"
  const topThreeCount = sortedLabels.reduce((sum, [, count]) => sum + count, 0);
  const otherPercentage = (
    ((totalMails - topThreeCount) / totalMails) *
    100
  ).toFixed(1);

  labels.push("Other");
  data.push(otherPercentage);

  // Update legend
  const legendContainer = document.getElementById("doughnut-legend");
  const colors = ["#1F2937", "#60A5FA", "#86EFAC", "#C084FC"];

  legendContainer.innerHTML = labels
    .map(
      (label, index) => `
      <div class="flex items-center justify-between md:justify-start md:space-x-12">
        <div class="flex items-center space-x-3">
          <span class="w-3 h-3 rounded-full" style="background-color: ${colors[index]}"></span>
          <span class="text-sm md:text-base text-gray-700">${label}</span>
        </div>
        <span class="text-sm md:text-base font-semibold text-gray-900">${data[index]}%</span>
      </div>
    `
    )
    .join("");

  const doughnutCtx = document.getElementById("doughnutChart").getContext("2d");
  new Chart(doughnutCtx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      cutout: "65%",
    },
  });
}

// Mobile sidebar toggle
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

window.onload = function () {
  renderOverviewCards();
  updateDashboard();
};
