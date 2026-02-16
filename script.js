// Menu Sticky
const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Menu Hambúrguer Mobile
if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Fechar menu ao clicar em um link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Smooth Scroll para links de navegação (apenas links internos)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Não aplicar se for um link de navegação dentro de um card de prêmio
        if (this.closest('.premio-card')) {
            return; // Deixa o link funcionar normalmente
        }
        
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Animações Reveal ao rolar
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

// Verificar elementos na carga inicial
window.addEventListener('load', revealOnScroll);

// Verificar elementos ao rolar
window.addEventListener('scroll', revealOnScroll);

// Intersection Observer para melhor performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Aplicar observer aos elementos reveal
revealElements.forEach(element => {
    observer.observe(element);
});

// Efeito parallax suave no hero (apenas em desktop)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    // Desabilitar parallax em dispositivos móveis para melhor performance
    if (hero && scrolled < window.innerHeight && window.innerWidth > 768) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    } else if (hero) {
        hero.style.transform = 'translateY(0)';
    }
});

// Adicionar efeito de hover nas imagens da galeria
const galleryItems = document.querySelectorAll('.masonry-item');

galleryItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Lightbox Modal
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCurrent = document.getElementById('lightboxCurrent');
const lightboxTotal = document.getElementById('lightboxTotal');

let currentImageIndex = 0;
let galleryImages = [];

// Coletar todas as imagens da galeria
function initGalleryImages() {
    galleryImages = Array.from(document.querySelectorAll('.masonry-item img')).map(img => ({
        src: img.src.replace('?w=800&q=80', '?w=1920&q=90'), // Usar versão maior da imagem
        alt: img.alt
    }));
    lightboxTotal.textContent = galleryImages.length;
}

// Abrir lightbox
function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
}

// Fechar lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
}

// Atualizar imagem no lightbox
function updateLightboxImage() {
    if (galleryImages.length > 0) {
        lightboxImage.src = galleryImages[currentImageIndex].src;
        lightboxImage.alt = galleryImages[currentImageIndex].alt;
        lightboxCurrent.textContent = currentImageIndex + 1;
    }
}

// Navegar para imagem anterior
function showPrevImage() {
    if (galleryImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }
}

// Navegar para próxima imagem
function showNextImage() {
    if (galleryImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }
}

// Event listeners para abrir lightbox ao clicar nas imagens
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        openLightbox(index);
    });
});

// Event listeners para controles do lightbox
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

// Fechar ao clicar no fundo (mas não na imagem)
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Navegação por teclado
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    }
});

// Inicializar imagens da galeria
initGalleryImages();

// Atualizar link ativo no menu ao rolar
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const updateActiveNav = () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', updateActiveNav);

// Adicionar classe active ao primeiro link por padrão
if (window.pageYOffset < 100) {
    document.querySelector('a[href="#hero"]')?.classList.add('active');
}

// Lazy loading para imagens (fallback para navegadores antigos)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback para navegadores que não suportam lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Adicionar animação suave ao carregar a página
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Prevenir scroll horizontal
document.body.style.overflowX = 'hidden';

// Adicionar efeito de brilho nos cards de prêmios
const premioCards = document.querySelectorAll('.premio-card');

premioCards.forEach(card => {
    // Só aplicar efeito se não for um link
    if (!card.href) {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))';
        });
    }
});

// Carrossel de imagens no background da seção de prêmios
const premiosSlides = document.querySelectorAll('.premios-slide');
let currentPremioSlide = 0;

if (premiosSlides.length > 0) {
    const rotatePremiosBackground = () => {
        premiosSlides[currentPremioSlide].classList.remove('active');
        currentPremioSlide = (currentPremioSlide + 1) % premiosSlides.length;
        premiosSlides[currentPremioSlide].classList.add('active');
    };

    // Rotacionar a cada 5 segundos
    setInterval(rotatePremiosBackground, 5000);
}
