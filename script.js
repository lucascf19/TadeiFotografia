// =========================
// Navegação e UI Geral
// =========================

// Menu Sticky
const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
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

// =========================
// Lightbox da Galeria
// =========================

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCurrent = document.getElementById('lightboxCurrent');
const lightboxTotal = document.getElementById('lightboxTotal');

let currentImageIndex = 0;
let galleryImages = [];

function initGalleryImages() {
    const images = document.querySelectorAll('.masonry-item img');
    galleryImages = Array.from(images).map(img => ({
        src: img.src,
        alt: img.alt
    }));
    if (lightboxTotal) {
        lightboxTotal.textContent = galleryImages.length;
    }
}

function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    if (lightbox) {
        lightbox.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function updateLightboxImage() {
    if (!lightboxImage || galleryImages.length === 0) return;
    const item = galleryImages[currentImageIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    if (lightboxCurrent) {
        lightboxCurrent.textContent = currentImageIndex + 1;
    }
}

function showPrevImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

function showNextImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

function setupGalleryInteractions() {
    const galleryItems = document.querySelectorAll('.masonry-item');

    galleryItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    initGalleryImages();
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        showPrevImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
});

// =========================
// Navegação ativa no menu
// =========================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const updateActiveNav = () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (current && link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', updateActiveNav);

if (window.pageYOffset < 100) {
    document.querySelector('a[href="#hero"]')?.classList.add('active');
}

// =========================
// Lazy loading fallback
// =========================

if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// =========================
// Efeitos adicionais
// =========================

// Animação suave ao carregar a página
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Prevenir scroll horizontal
document.body.style.overflowX = 'hidden';

// Efeito de brilho nos cards de prêmios
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

    setInterval(rotatePremiosBackground, 5000);
}

// =========================
// Supabase - Galeria Dinâmica
// =========================

// Configuração do Supabase (substitua pelos dados reais do projeto)
const SUPABASE_URL = 'https://qzklsvecqavpymtccawn.supabase.co'; // TODO: alterar
const SUPABASE_ANON_KEY = 'sb_publishable_7sH23dn4JVNi0MKK6USLEQ_yQPYVeD3'; // TODO: alterar

let supabaseClient = null;

if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
    }
} else {
    console.warn('Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY.');
}

const galleryGrid = document.getElementById('galleryGrid');
const galleryLoader = document.getElementById('galleryLoader');
const galleryError = document.getElementById('galleryError');
const galleryEmpty = document.getElementById('galleryEmpty');

async function loadGalleryFromSupabase() {
    if (!supabaseClient || !galleryGrid) return;

    try {
        if (galleryLoader) galleryLoader.style.display = 'flex';
        if (galleryError) galleryError.textContent = '';
        if (galleryEmpty) galleryEmpty.hidden = true;
        galleryGrid.innerHTML = '';

        // Carrega álbuns
        const { data: albums, error: albumsError } = await supabaseClient
            .from('albums')
            .select('*')
            .order('date', { ascending: false });

        if (albumsError) throw albumsError;

        // Carrega fotos
        const { data: photos, error: photosError } = await supabaseClient
            .from('photos')
            .select('*');

        if (photosError) throw photosError;

        if (!photos || photos.length === 0) {
            if (galleryEmpty) galleryEmpty.hidden = false;
            return;
        }

        const albumsById = new Map();
        (albums || []).forEach(album => {
            albumsById.set(album.id, album);
        });

        photos.forEach(photo => {
            const album = albumsById.get(photo.album_id);

            const item = document.createElement('div');
            item.className = 'masonry-item';

            if (album?.title) {
                item.dataset.albumTitle = album.title;
            }

            const img = document.createElement('img');
            img.src = photo.photo_url;
            img.alt = album?.title ? `Álbum ${album.title}` : 'Foto de casamento';
            img.loading = 'lazy';

            item.appendChild(img);
            galleryGrid.appendChild(item);
        });

        setupGalleryInteractions();
    } catch (error) {
        console.error('Erro ao carregar galeria do Supabase:', error);
        if (galleryError) {
            galleryError.textContent = 'Não foi possível carregar a galeria. Verifique a configuração do Supabase.';
        }
    } finally {
        if (galleryLoader) galleryLoader.style.display = 'none';
    }
}

// Carregar galeria dinâmica ao iniciar
loadGalleryFromSupabase().catch(console.error);
