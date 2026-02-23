const burgerMenu = document.querySelector('.burger-menu');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenu = document.querySelector('.close-menu');
const body = document.body;

function openMenu() {
    mobileMenu.classList.add('active');
    burgerMenu.classList.add('hidden');
    body.style.overflow = 'hidden'; 
}

function closeMenuFunc() {
    mobileMenu.classList.remove('active');
    burgerMenu.classList.remove('hidden');
    body.style.overflow = ''; 
}

burgerMenu.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeMenuFunc);

const mobileLinks = document.querySelectorAll('.mobile-nav a');
mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenuFunc);
});

mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
        closeMenuFunc();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenuFunc();
    }
});

function updateCartCount(count) {
    const itemNum = document.querySelector('.item-num');
    const itemNumMobile = document.querySelector('.item-num-mobile');
    
    if (itemNum) itemNum.textContent = count;
    if (itemNumMobile) itemNumMobile.textContent = count;
}

