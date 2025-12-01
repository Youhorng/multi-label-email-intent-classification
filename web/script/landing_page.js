const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

mobileMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
  const icon = mobileMenuBtn.querySelector("i");
  if (mobileMenu.classList.contains("hidden")) {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  } else {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  }
});

function generateNavLinks() {
  const desktopNav = document.getElementById("desktop-nav");
  const mobileNav = document.getElementById("mobile-nav");

  if (desktopNav) {
    desktopNav.innerHTML = navItems
      .map(
        (item) => `
          <a
            href="${item.href}"
            class="text-gray-700 hover:text-blue-500 text-base lg:text-xl font-medium transition"
          >${item.text}</a>
        `
      )
      .join("");
  }

  if (mobileNav) {
    const mobileLinks = navItems
      .map(
        (item) => `
          <a
            href="${item.href}"
            class="block text-gray-700 hover:text-blue-500 hover:bg-gray-50 px-3 py-2 rounded-lg transition mobile-nav-link"
          >${item.text}</a>
        `
      )
      .join("");

    // Insert mobile links before the Sign In button
    mobileNav.innerHTML = mobileLinks + mobileNav.innerHTML;
  }
}

// Close mobile menu when clicking on a link
const mobileLinks = mobileMenu.querySelectorAll("a");
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    const icon = mobileMenuBtn.querySelector("i");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  });
});

const featureCards = [
  {
    gradient: "bg-gradient-to-tr from-[#1D53CF] to-[#26A9E0]",
    icon: "fas fa-chart-line",
    title: "Analytics Dashboard",
    description:
      "Visualize email trends, track patterns, and gain insights into your communication habits with comprehensive analytics.",
  },
  {
    gradient: "bg-gradient-to-bl from-[#1D53CF] to-[#26A9E0]",
    icon: "fas fa-project-diagram",
    title: "AI Classification",
    description:
      "Smart AI automatically categorizes your emails into Work, Promotion, Social, Spam, and Other for instant organization.",
  },
  {
    gradient: "bg-gradient-to-tr from-[#1D53CF] to-[#26A9E0]",
    icon: "fas fa-pen-square",
    title: "Manual Input Form",
    description:
      "Paste any email content and get instant AI-powered classification with detailed category analysis.",
  },
  {
    gradient: "bg-gradient-to-bl from-[#1D53CF] to-[#26A9E0]",
    icon: "fab fa-google",
    title: "Gmail Integration",
    description:
      "Seamlessly connect with your Gmail account for automatic email fetching and real-time synchronization.",
  },
];

const howItWorksSteps = [
  {
    number: 1,
    title: "Connect Gmail",
    description:
      "Sign in securely with your Google account using OAuth authentication. Your credentials remain private and secure.",
  },
  {
    number: 2,
    title: "AI Classifier",
    description:
      "Our advanced AI model automatically analyzes and categorizes all your emails into relevant categories instantly.",
  },
  {
    number: 3,
    title: "Manage Efficiently",
    description:
      "Access your organized inbox, filter by category, and respond to important emails faster than ever before.",
  },
];

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "CEO & Founder",
    description: "Product visionary with 10+ years in email AI expert",
    image: "./images/photo1.JPG",
    gradient: "from-blue-200 to-blue-400",
  },
  {
    name: "Sarah Chen",
    role: "Lead AI Engineer",
    description: "ML expert specializing in NLP and classification",
    image: "./images/photo2.jpeg",
    gradient: "from-pink-200 to-pink-400",
  },
  {
    name: "Alex Johnson",
    role: "CEO & Founder",
    description: "Product visionary with 10+ years",
    image: "./images/photo3.jpeg",
    gradient: "from-blue-200 to-blue-400",
  },
  {
    name: "Sarah Chen",
    role: "Lead AI Engineer",
    description: "ML expert specializing in NLP",
    image: "./images/photo4.JPG",
    gradient: "from-pink-200 to-pink-400",
  },
  {
    name: "Sarah Chen",
    role: "Lead AI Engineer",
    description: "ML expert specializing in NLP",
    image: "./images/photo2.jpeg",
    gradient: "from-pink-200 to-pink-400",
  },
];

const footerData = {
  sections: [
    {
      title: "Product",
      links: [
        { text: "Features", href: "#features" },
        { text: "How it Works", href: "#how" },
        { text: "Pricing", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", href: "#about" },
        { text: "Contact", href: "#" },
        { text: "Login", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", href: "#" },
        { text: "Terms of Service", href: "#" },
        { text: "Security", href: "#" },
      ],
    },
  ],
  socialLinks: [
    { icon: "fab fa-twitter", href: "#" },
    { icon: "fab fa-linkedin", href: "#" },
    { icon: "fab fa-github", href: "#" },
  ],
};

const navItems = [
  { text: "Home", href: "#home" },
  { text: "Key Features", href: "#features" },
  { text: "How it works", href: "#how" },
  { text: "About us", href: "#about" },
];

window.onload = function () {
  generateNavLinks();

  const cardsContainer = document.getElementById("feature-cards-container");
  const stepsContainer = document.getElementById("how-it-works-steps");
  const teamContainer = document.getElementById("team-members");

  const footerLinksContainer = document.getElementById("footer-links");
  const socialLinksContainer = document.getElementById("social-links");

  if (cardsContainer) {
    cardsContainer.innerHTML = featureCards
      .map(
        (card) => `
            <div class="${card.gradient} opacity-75 rounded-3xl p-10 text-white shadow-xl text-left min-h-[340px] flex flex-col">
                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6">
                    <i class="${card.icon} text-blue-500 text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">${card.title}</h3>
                <p class="text-sm text-white leading-relaxed">
                    ${card.description}
                </p>
            </div>
        `
      )
      .join("");
  }

  if (stepsContainer) {
    stepsContainer.innerHTML = howItWorksSteps
      .map(
        (step) => `
            <div class="text-center px-4 md:px-6">
                <div class="w-24 h-24 bg-gradient-to-tl from-[#1D53CF] to-[#26A9E0] opacity-75 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg">${step.number}</div>
                <h3 class="text-5xl lg:text-4xl font-bold text-gray-900 mb-5 whitespace-nowrap">${step.title}</h3>
                <p class="text-lg text-gray-600 leading-relaxed text-center">
                    ${step.description}
                </p>
            </div>
        `
      )
      .join("");
  }

  if (teamContainer) {
    teamContainer.innerHTML = teamMembers
      .map(
        (member) => `
            <div class="text-center">
                <div class="max-h-[290px] w-42 mx-auto mb-3 rounded-3xl overflow-hidden bg-gradient-to-br ${member.gradient} shadow-lg">
                    <img src="${member.image}" alt="${member.name}" class="w-full h-full object-cover">
                </div>
                <h4 class="font-bold text-gray-900">${member.name}</h4>
                <p class="text-sm text-gray-500">${member.role}</p>
                <p class="text-xs text-gray-400 mt-1">${member.description}</p>
            </div>
        `
      )
      .join("");
  }

  if (footerLinksContainer) {
    footerLinksContainer.innerHTML = footerData.sections
      .map(
        (section) => `
          <div>
            <h4 class="font-bold text-white mb-3">${section.title}</h4>
            <ul class="space-y-2 text-sm">
              ${section.links
                .map(
                  (link) =>
                    `<li><a href="${link.href}" class="hover:text-blue-400">${link.text}</a></li>`
                )
                .join("")}
            </ul>
          </div>
        `
      )
      .join("");
  }

  if (socialLinksContainer) {
    socialLinksContainer.innerHTML = footerData.socialLinks
      .map(
        (social) =>
          `<a href="${social.href}" class="hover:text-blue-400"><i class="${social.icon}"></i></a>`
      )
      .join("");
  }
};
