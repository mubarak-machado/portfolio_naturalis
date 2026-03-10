// Modern Portfolio Script

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar transparency & styling on scroll
    const navbar = document.querySelector('.plugin-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(11, 12, 16, 0.95)'; // --surface-base solid
            navbar.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.background = 'rgba(11, 12, 16, 0.7)'; // Transparent
            navbar.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        }
    });

    // 2. Intersection Observer for buttery staggered entry animations
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach((el, index) => {
        // Stagger effect if elements are close together
        el.style.transitionDelay = `${(index % 4) * 100}ms`;
        observer.observe(el);
    });

    // 3. Smooth Anchor Scrolling with precise offset
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 4. Set Current Year in Footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // 5. Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formFeedback = document.getElementById('form-feedback');
    const loader = submitBtn?.querySelector('.spinner');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnIcon = submitBtn?.querySelector('svg');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // UI Feedback state
            loader?.classList.remove('hidden');
            if (btnText) btnText.style.opacity = '0.7';
            if (btnIcon) btnIcon.classList.add('hidden');
            submitBtn.disabled = true;
            formFeedback.classList.add('hidden');

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Simulated API Call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // const SUPABASE_URL = 'https://vxduxdimrcejrzmhwylq.functions.supabase.co/send-contact-email';
                // const response = await fetch(SUPABASE_URL, {
                //     method: 'POST',
                //     body: JSON.stringify(data),
                //     headers: { 'Content-Type': 'application/json' }
                // });
                // if (!response.ok) throw new Error('Falha no envio');
                
                formFeedback.innerText = 'Mensagem enviada com sucesso! Entrarei em contato em breve.';
                formFeedback.className = 'form-feedback bg-emerald-500/10 text-emerald-400 mt-6 text-center text-sm font-medium py-3 rounded-xl block';
                contactForm.reset();

            } catch (error) {
                formFeedback.innerText = 'Ops! Falha ao enviar a mensagem. Tente novamente mais tarde.';
                formFeedback.className = 'form-feedback bg-red-500/10 text-red-400 mt-6 text-center text-sm font-medium py-3 rounded-xl block';
            } finally {
                loader?.classList.add('hidden');
                if (btnIcon) btnIcon.classList.remove('hidden');
                if (btnText) btnText.style.opacity = '1';
                submitBtn.disabled = false;
            }
        });
    }
});
