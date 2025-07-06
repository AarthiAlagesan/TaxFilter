// script.js
document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
});
// Add scroll event listener to change navbar background
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Toggle mobile menu
document.getElementById('menu-icon').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
});
function getStarted() {
    alert("Getting started with AI-powered tax filing!");
    // Add additional functionality for user sign-up or onboarding
  }
  