// js/banner.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del slider
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const timerBar = document.querySelector('.timer-bar');
    
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000; // 5 segundos
    let timerWidth = 0;
    let timerInterval;
    
    // Inicializar banner
    function initBanner() {
        showSlide(currentSlide);
        startAutoPlay();
        startTimer();
        
        // Event listeners para controles
        prevBtn.addEventListener('click', showPrevSlide);
        nextBtn.addEventListener('click', showNextSlide);
        
        // Event listeners para indicadores
        indicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                const slideIndex = parseInt(this.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });
        
        // Pausar al interactuar
        const banner = document.querySelector('.banner');
        banner.addEventListener('mouseenter', pauseSlider);
        banner.addEventListener('mouseleave', resumeSlider);
        
        // Cambiar automáticamente el timer
        window.addEventListener('focus', resumeSlider);
        window.addEventListener('blur', pauseSlider);
    }
    
    // Mostrar slide específico
    function showSlide(index) {
        // Asegurar que el índice esté dentro de los límites
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        // Ocultar todas las slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Desactivar todos los indicadores
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        currentSlide = index;
        
        // Mostrar slide actual
        slides[currentSlide].classList.add('active');
        
        // Activar indicador correspondiente
        indicators[currentSlide].classList.add('active');
        
        // Reiniciar timer
        resetTimer();
    }
    
    // Ir a slide específico
    function goToSlide(index) {
        showSlide(index);
        resetAutoPlay();
    }
    
    // Slide anterior
    function showPrevSlide() {
        showSlide(currentSlide - 1);
        resetAutoPlay();
    }
    
    // Slide siguiente
    function showNextSlide() {
        showSlide(currentSlide + 1);
        resetAutoPlay();
    }
    
    // Autoplay
    function startAutoPlay() {
        slideInterval = setInterval(() => {
            showNextSlide();
        }, slideDuration);
    }
    
    function pauseSlider() {
        clearInterval(slideInterval);
        clearInterval(timerInterval);
    }
    
    function resumeSlider() {
        startAutoPlay();
        startTimer();
    }
    
    function resetAutoPlay() {
        pauseSlider();
        startAutoPlay();
        resetTimer();
    }
    
    // Timer visual
    function startTimer() {
        timerWidth = 0;
        timerBar.style.width = '0%';
        
        timerInterval = setInterval(() => {
            timerWidth += 100 / (slideDuration / 100);
            timerBar.style.width = timerWidth / slides.length + '%';
            
            if (timerWidth >= 100) {
                timerWidth = 0;
            }
        }, 100);
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        startTimer();
    }
    
    // Efecto de animación para el texto
    function animateText() {
        const slogan = document.querySelector('.slogan-highlight');
        const originalText = slogan.textContent;
        
        // Efecto de brillo intermitente
        setInterval(() => {
            slogan.style.textShadow = '0 0 10px rgba(210, 179, 113, 0.7)';
            setTimeout(() => {
                slogan.style.textShadow = 'none';
            }, 300);
        }, 3000);
    }
    
    // Efecto de parpadeo para CTA
    function animateCTA() {
        const ctaButton = document.querySelector('.promo-btn');
        
        setInterval(() => {
            ctaButton.classList.add('pulse-effect');
            setTimeout(() => {
                ctaButton.classList.remove('pulse-effect');
            }, 1000);
        }, 5000);
    }
    
    // CSS para efecto de pulso
    const style = document.createElement('style');
    style.textContent = `
        .pulse-effect {
            animation: ctaPulse 1s ease;
        }
        
        @keyframes ctaPulse {
            0% { box-shadow: 0 6px 20px rgba(196, 159, 79, 0.4); }
            50% { box-shadow: 0 6px 30px rgba(196, 159, 79, 0.8); }
            100% { box-shadow: 0 6px 20px rgba(196, 159, 79, 0.4); }
        }
    `;
    document.head.appendChild(style);
    
    // Inicializar
    initBanner();
    animateText();
    animateCTA();
    
    // Ajustar banner al redimensionar ventana
    window.addEventListener('resize', function() {
        // Forzar reflow para ajustar imágenes
        slides.forEach(slide => {
            const img = slide.querySelector('.slide-img');
            img.style.animation = 'none';
            setTimeout(() => {
                img.style.animation = 'zoomEffect 20s linear infinite';
            }, 10);
        });
    });
});