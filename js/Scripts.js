// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log("scripts.js loaded"); // Check if script loads

    // =======================
    // Header and Footer Scripts
    // =======================

    // Load the header
    fetch('R4-header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            const menuToggle = document.getElementById('menu-toggle');
            const menuItems = document.getElementById('menu-items');
            const menuLinks = document.querySelectorAll('.menu-items li a');
            const currentPage = window.location.pathname.split("/").pop();

            // Apply initial menu open state from localStorage
            const isMenuOpen = localStorage.getItem('menuOpen') === 'true';
            if (isMenuOpen) {
                menuItems.classList.add('show-menu');
                menuToggle.classList.add('rotate');
            }

            // Menu toggle functionality
            menuToggle.addEventListener('click', () => {
                menuItems.classList.toggle('show-menu');
                menuToggle.classList.toggle('rotate');
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
                menuToggle.setAttribute('aria-expanded', !isExpanded);

                // Save menu open state in localStorage
                localStorage.setItem('menuOpen', menuItems.classList.contains('show-menu'));
            });

            // Highlight selected menu link
            menuLinks.forEach(link => {
                const linkPage = link.getAttribute('href');
                link.addEventListener('click', () => {
                    menuLinks.forEach(item => item.parentElement.classList.remove('selected'));
                    link.parentElement.classList.add('selected');
                });
                if (linkPage === currentPage) {
                    link.parentElement.classList.add('selected');
                }
            });
        });

    // Load the footer
    fetch('R4-footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });

    // =======================
    // Homepage Scripts
    // =======================

    // Scroll-triggered background change for news section
    window.addEventListener('scroll', function() {
        const section = document.querySelector('.news-section');
        if (section) {
            section.classList.toggle('scrolled', window.scrollY > 100);
        }
    });

    // Image placeholder animation and overlay fade effect
    const placeholders = document.querySelectorAll('.image-placeholder');
    placeholders.forEach(placeholder => {
        placeholder.addEventListener('click', () => {
            placeholder.classList.toggle('open'); // Toggles the fade-out effect
        });
    });


	
    // Load newsfeed from Google Sheets
    async function loadNewsFeed() {
        try {
            const response = await fetch('https://spreadsheets.google.com/feeds/list/d/1IxUPbVBw2NsHmpB3Jo0T8tOQePD3sGHKLeqU0tb1j-M/od6/public/values?alt=json');
            const data = await response.json();
            const entries = data.feed.entry;
            const newsContainer = document.querySelector('.news-container');
            newsContainer.innerHTML = ''; // Clear existing content

            entries.forEach(entry => {
                const id = entry.gsx$id.$t;
                const imageUrl = entry.gsx$imageurl.$t;
                const headline = entry.gsx$headline.$t;

                const newsCard = document.createElement('div');
                newsCard.classList.add('news-card');
                newsCard.innerHTML = `
                    <img src="${imageUrl}" alt="${headline}">
                    <h3>${headline}</h3>
                    <a href="R4-News.html?post=${id}" class="content-link">Read More</a>
                `;
                newsContainer.appendChild(newsCard);
            });
        } catch (error) {
            console.error('Error loading news feed:', error);
        }
    }

    if (document.querySelector('.news-container')) {
        loadNewsFeed();
    }

	// Function to load individual news item by ID on R4-News.html
async function loadNewsPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');

    if (!postId) {
        console.error('No post ID provided in URL');
        return;
    }

    try {
        const response = await fetch('https://spreadsheets.google.com/feeds/list/d/1IxUPbVBw2NsHmpB3Jo0T8tOQePD3sGHKLeqU0tb1j-M/od6/public/values?alt=json');
        const data = await response.json();
        const entries = data.feed.entry;

        // Verify fetched data
        console.log("Fetched entries:", entries);

        const entry = entries.find(item => item.gsx$id.$t === postId);

        if (!entry) {
            console.error('Post not found');
            return;
        }

        // Verify the matched entry
        console.log("Matched entry:", entry);

        const newsImage = document.querySelector('.news-image');
        const newsHeader = document.querySelector('.news-header');
        const newsContent = document.querySelector('.news-content');

        // Verify content before setting
        console.log("Image URL:", entry.gsx$imageurl.$t);
        console.log("Headline:", entry.gsx$headline.$t);
        console.log("Body Copy:", entry.gsx$bodycopy.$t);

        newsImage.src = entry.gsx$imageurl.$t;
        newsImage.alt = entry.gsx$headline.$t;
        newsHeader.textContent = entry.gsx$headline.$t;
        newsContent.textContent = entry.gsx$bodycopy.$t;

    } catch (error) {
        console.error('Error loading news post:', error);
    }
}

// Run loadNewsPost() if we're on the news page
if (document.querySelector('.news-article')) {
    loadNewsPost();
}


    // =======================
    // Contact Page Scripts
    // =======================

    if (document.title === 'R4-Contact') {
        const phoneInput = document.getElementById('phone');
        const contactForm = document.getElementById('contact-form');
        const thankYouMessage = document.getElementById('thank-you-message');

        if (phoneInput) {
            phoneInput.addEventListener('input', function(event) {
                let input = event.target.value.replace(/\D/g, '');
                event.target.value = input.length > 6
                    ? `${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6, 10)}`
                    : input.length > 3
                    ? `${input.slice(0, 3)}-${input.slice(3)}`
                    : input;
            });
        }

        if (contactForm) {
            contactForm.addEventListener('submit', function(event) {
                event.preventDefault();
                contactForm.reset();
                thankYouMessage.style.display = 'block';

                const formData = new FormData(event.target);
                const message = `
                    Name: ${formData.get('name')}
                    Email: ${formData.get('email')}
                    Interests: ${Array.from(formData.getAll('interest')).join(', ')}
                    Message: ${formData.get('message')}
                `;
                console.log("Email format preview:", message);
            });
        }
    }

    // =======================
    // Login Page Scripts
    // =======================

    if (document.title === 'R4-Login') {
        const loginForm = document.getElementById('loginForm');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const emailErrorMessage = document.getElementById('emailErrorMessage');

        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                if (username && password) document.getElementById('loginErrorMessage').style.display = 'block';
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(event) {
                event.preventDefault();
                document.getElementById('forgotPasswordSection').style.display = 'block';
            });
        }

        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const email = document.getElementById('email');
                email.checkValidity() ? emailErrorMessage.style.display = 'block' : email.reportValidity();
            });
        }
    }

    // =======================
    // About Page Button Clicks
    // =======================

    function handleButtonClick(buttonId, contentId) {
        const allButtons = document.querySelectorAll('.reveal-button');
        const allContents = document.querySelectorAll('.info-content');
        const button = document.getElementById(buttonId);
        const content = document.getElementById(contentId);

        if (content.style.maxHeight === '0px' || content.style.maxHeight === '') {
            allContents.forEach((item) => { item.style.maxHeight = '0'; });
            allButtons.forEach((btn) => btn.classList.remove('active'));

            content.style.maxHeight = content.scrollHeight + 'px';
            button.classList.add('active');
        } else {
            content.style.maxHeight = '0';
            button.classList.remove('active');
        }
    }

    document.getElementById('investor-button').addEventListener('click', function() {
        handleButtonClick('investor-button', 'investor-content');
    });
    document.getElementById('companies-button').addEventListener('click', function() {
        handleButtonClick('companies-button', 'companies-content');
    });

});
