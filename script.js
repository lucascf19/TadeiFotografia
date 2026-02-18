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

    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Smooth Scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.closest('.premio-card')) {
            return;
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

window.addEventListener('load', revealOnScroll);
window.addEventListener('scroll', revealOnScroll);

// Intersection Observer
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

revealElements.forEach(element => {
    observer.observe(element);
});

// Efeito parallax suave no hero (desktop)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero && scrolled < window.innerHeight && window.innerWidth > 768) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    } else if (hero) {
        hero.style.transform = 'translateY(0)';
    }
});

// =========================
// Lightbox da Galeria (por Álbum)
// =========================

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCurrent = document.getElementById('lightboxCurrent');
const lightboxTotal = document.getElementById('lightboxTotal');

let albumsData = [];        // [{ id, title, date, photos: [{ id, photo_url }] }]
let currentAlbumIndex = 0;
let currentPhotoIndex = 0;

function openAlbumLightbox(albumIndex, photoIndex = 0) {
    if (!albumsData[albumIndex]) return;
    currentAlbumIndex = albumIndex;
    currentPhotoIndex = photoIndex;
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
    if (!lightboxImage || !albumsData.length) return;

    const album = albumsData[currentAlbumIndex];
    if (!album || !album.photos || album.photos.length === 0) return;

    const photos = album.photos;
    const photo = photos[currentPhotoIndex];

    lightboxImage.src = photo.photo_url;
    lightboxImage.alt = album.title ? `Álbum ${album.title}` : 'Foto de casamento';

    if (lightboxCurrent) lightboxCurrent.textContent = String(currentPhotoIndex + 1);
    if (lightboxTotal) lightboxTotal.textContent = String(photos.length);
}

function showPrevImage() {
    const album = albumsData[currentAlbumIndex];
    if (!album || !album.photos || album.photos.length === 0) return;

    const total = album.photos.length;
    currentPhotoIndex = (currentPhotoIndex - 1 + total) % total;
    updateLightboxImage();
}

function showNextImage() {
    const album = albumsData[currentAlbumIndex];
    if (!album || !album.photos || album.photos.length === 0) return;

    const total = album.photos.length;
    currentPhotoIndex = (currentPhotoIndex + 1) % total;
    updateLightboxImage();
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
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
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
    if (!card.href) {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))`;
        });

        card.addEventListener('mouseleave', function () {
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
// Supabase - Galeria Dinâmica por Álbum
// =========================

// Configuração do Supabase (dados reais do projeto)
const SUPABASE_URL = 'https://qzklsvecqavpymtccawn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7sH23dn4JVNi0MKK6USLEQ_yQPYVeD3';

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

// Depoimentos (home)
const testimonialsGrid = document.getElementById('testimonialsGrid');
const testimonialsLoader = document.getElementById('testimonialsLoader');
const testimonialsError = document.getElementById('testimonialsError');
const testimonialsEmpty = document.getElementById('testimonialsEmpty');

function formatAlbumDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

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

        // Monta estrutura por álbum
        albumsData = (albums || []).map(album => {
            const albumPhotos = photos.filter(p => p.album_id === album.id);
            return {
                id: album.id,
                title: album.title,
                date: album.date,
                photos: albumPhotos
            };
        }).filter(album => album.photos && album.photos.length > 0);

        if (!albumsData.length) {
            if (galleryEmpty) galleryEmpty.hidden = false;
            return;
        }

        // Criar cards por álbum
        albumsData.forEach((album, albumIndex) => {
            const card = document.createElement('div');
            card.className = 'album-card';
            card.dataset.albumIndex = String(albumIndex);

            const carousel = document.createElement('div');
            carousel.className = 'album-carousel';

            const img = document.createElement('img');
            const firstPhoto = album.photos[0];
            img.src = firstPhoto.photo_url;
            img.alt = album.title ? `Álbum ${album.title}` : 'Foto de casamento';
            img.loading = 'lazy';

            carousel.appendChild(img);

            const info = document.createElement('div');
            info.className = 'album-info';

            const titleEl = document.createElement('h3');
            titleEl.className = 'album-title';
            titleEl.textContent = album.title || 'Álbum sem título';

            const dateEl = document.createElement('p');
            dateEl.className = 'album-date';
            const formattedDate = formatAlbumDate(album.date);
            dateEl.textContent = formattedDate ? formattedDate : '';

            info.appendChild(titleEl);
            if (formattedDate) info.appendChild(dateEl);

            card.appendChild(carousel);
            card.appendChild(info);

            // Clique abre lightbox para o álbum
            card.addEventListener('click', () => {
                openAlbumLightbox(albumIndex, 0);
            });

            // Pequeno hover via JS opcional (CSS já cobre boa parte)
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-6px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });

            galleryGrid.appendChild(card);

            // Carrossel automático dentro do card
            if (album.photos.length > 1) {
                let coverIndex = 0;
                setInterval(() => {
                    coverIndex = (coverIndex + 1) % album.photos.length;
                    const nextPhoto = album.photos[coverIndex];
                    img.style.opacity = '0';
                    setTimeout(() => {
                        img.src = nextPhoto.photo_url;
                        img.alt = album.title ? `Álbum ${album.title}` : 'Foto de casamento';
                        img.style.opacity = '1';
                    }, 200);
                }, 4000);
            }
        });
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

// =========================
// Supabase - Depoimentos
// =========================

function formatTestimonialDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

async function loadTestimonialsFromSupabase() {
    if (!supabaseClient || !testimonialsGrid) return;

    try {
        if (testimonialsLoader) testimonialsLoader.style.display = 'flex';
        if (testimonialsError) testimonialsError.textContent = '';
        if (testimonialsEmpty) testimonialsEmpty.hidden = true;
        testimonialsGrid.innerHTML = '';

        const { data: testimonials, error } = await supabaseClient
            .from('testimonials')
            .select('*')
            .order('wedding_date', { ascending: false })
            .limit(9);

        if (error) throw error;

        if (!testimonials || testimonials.length === 0) {
            if (testimonialsEmpty) testimonialsEmpty.hidden = false;
            return;
        }

        testimonials.forEach(testimonial => {
            const card = document.createElement('article');
            card.className = 'testimonial-card';

            const quote = document.createElement('div');
            quote.className = 'testimonial-quote-mark';
            quote.textContent = '“';

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'testimonial-content';

            const text = document.createElement('p');
            text.className = 'testimonial-text';
            text.textContent = testimonial.content;

            contentWrapper.appendChild(text);

            const footer = document.createElement('div');
            footer.className = 'testimonial-footer';

            if (testimonial.couple_photo_url) {
                const avatar = document.createElement('div');
                avatar.className = 'testimonial-avatar';
                const img = document.createElement('img');
                img.src = testimonial.couple_photo_url;
                img.alt = testimonial.couple_names || 'Noivos';
                img.loading = 'lazy';
                avatar.appendChild(img);
                footer.appendChild(avatar);
            }

            const meta = document.createElement('div');
            meta.className = 'testimonial-meta';

            const names = document.createElement('p');
            names.className = 'testimonial-names';
            names.textContent = testimonial.couple_names || 'Casal';

            meta.appendChild(names);

            const formattedDate = formatTestimonialDate(testimonial.wedding_date);
            if (formattedDate) {
                const date = document.createElement('p');
                date.className = 'testimonial-date';
                date.textContent = formattedDate;
                meta.appendChild(date);
            }

            footer.appendChild(meta);

            card.appendChild(quote);
            card.appendChild(contentWrapper);
            card.appendChild(footer);

            testimonialsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar depoimentos do Supabase:', error);
        if (testimonialsError) {
            testimonialsError.textContent = 'Não foi possível carregar os depoimentos.';
        }
    } finally {
        if (testimonialsLoader) testimonialsLoader.style.display = 'none';
    }
}

loadTestimonialsFromSupabase().catch(console.error);

