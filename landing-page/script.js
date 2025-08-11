// Navegação suave
document.addEventListener('DOMContentLoaded', function() {
    // Menu móvel toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    }
    
    // Configurar links de navegação suave
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#ffffff';
            header.style.backdropFilter = 'none';
        }
    });

    // Animação de contadores na seção hero
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200; // Velocidade da animação
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target') || +counter.innerText.replace(/[^\d]/g, '');
            const count = +counter.innerText.replace(/[^\d]/g, '') || 0;
            const increment = target / speed;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(() => animateCounters(), 1);
            } else {
                // Formatação final dos números
                if (target >= 1000000) {
                    counter.innerText = (target / 1000000).toFixed(1) + 'M';
                } else if (target >= 1000) {
                    counter.innerText = (target / 1000).toFixed(0) + 'K';
                } else {
                    counter.innerText = target + '+';
                }
            }
        });
    }

    // Iniciar animação dos contadores quando a seção estiver visível
    const heroSection = document.querySelector('.hero');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    });
    
    if (heroSection) {
        observer.observe(heroSection);
    }

    // Animação de digitação para o demo do Copilot
    function typeCode() {
        const codeLines = [
            "# Exemplo: Criando uma calculadora simples",
            "",
            "def calculadora(num1, num2, operacao):",
            "    \"\"\"",
            "    Função para realizar operações matemáticas básicas",
            "    \"\"\"",
            "    if operacao == '+':",
            "        return num1 + num2",
            "    elif operacao == '-':",
            "        return num1 - num2",
            "    elif operacao == '*':",
            "        return num1 * num2",
            "    elif operacao == '/':",
            "        if num2 != 0:",
            "            return num1 / num2",
            "        else:",
            "            return 'Erro: Divisão por zero'",
            "",
            "# GitHub Copilot sugere:",
            "# Teste da função",
            "resultado = calculadora(10, 5, '+')",
            "print(f'Resultado: {resultado}')"
        ];

        const codeContainer = document.querySelector('.typing-demo');
        if (!codeContainer) return;

        codeContainer.innerHTML = '';
        let lineIndex = 0;
        let charIndex = 0;
        
        function typeLine() {
            if (lineIndex < codeLines.length) {
                const currentLine = codeLines[lineIndex];
                
                if (charIndex < currentLine.length) {
                    const lineElement = codeContainer.children[lineIndex] || document.createElement('div');
                    if (!lineElement.parentNode) {
                        lineElement.className = 'code-line';
                        codeContainer.appendChild(lineElement);
                    }
                    
                    lineElement.innerHTML = currentLine.substring(0, charIndex + 1) + '<span class="cursor">|</span>';
                    charIndex++;
                    setTimeout(typeLine, 50);
                } else {
                    // Remove cursor da linha atual
                    const currentLineElement = codeContainer.children[lineIndex];
                    if (currentLineElement) {
                        currentLineElement.innerHTML = currentLine;
                    }
                    
                    lineIndex++;
                    charIndex = 0;
                    setTimeout(typeLine, 200);
                }
            }
        }
        
        typeLine();
    }

    // Iniciar animação de digitação quando a seção do Copilot estiver visível
    const copilotSection = document.querySelector('.copilot-section');
    const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(typeCode, 1000);
                codeObserver.unobserve(entry.target);
            }
        });
    });
    
    if (copilotSection) {
        codeObserver.observe(copilotSection);
    }

    // Animação de fade-in para elementos quando ficam visíveis
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.benefit-card, .case-card, .testimonial, .feature');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            animationObserver.observe(element);
        });
    }

    setupScrollAnimations();

    // Efeito parallax suave no hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Botão de voltar ao topo
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #3776ab 0%, #306998 100%);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollTopBtn);

    // Mostrar/esconder botão de voltar ao topo
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.transform = 'translateY(0)';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.transform = 'translateY(20px)';
        }
    });

    // Função para voltar ao topo
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Efeito hover nos botões
    const buttons = document.querySelectorAll('.btn-primary, .btn-hero, .btn-primary-large, .btn-secondary-large');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // CTA do WhatsApp (substitui o formulário de newsletter)
    const whatsappCTA = document.createElement('div');
    whatsappCTA.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; margin-top: 20px;">
            <h4 style="margin-bottom: 15px; color: #ffd43b;">� Junte-se ao nosso grupo no WhatsApp</h4>
            <p style="margin-bottom: 15px; opacity: 0.9;">Receba dicas exclusivas de Python, GitHub Copilot e participe de discussões com outros desenvolvedores!</p>
            <div style="text-align: center;">
                <a href="https://chat.whatsapp.com/BzkiXVkpjH8HmNegVMaQYf" target="_blank" rel="noopener noreferrer"
                   style="display: inline-flex; align-items: center; gap: 10px; background: #25D366; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);"
                   onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 30px rgba(37, 211, 102, 0.4)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(37, 211, 102, 0.3)'">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                    Entrar no Grupo WhatsApp
                </a>
            </div>
            <p style="font-size: 14px; margin-top: 15px; opacity: 0.8; text-align: center;">✅ Gratuito • ✅ Comunidade ativa • ✅ Conteúdo exclusivo</p>
        </div>
    `;

    // Adicionar CTA do WhatsApp à seção final CTA
    const finalCta = document.querySelector('.final-cta .container');
    if (finalCta) {
        finalCta.appendChild(whatsappCTA);
    }

    // Easter egg: Konami code
    let konamiCode = [];
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konami.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.toString() === konami.toString()) {
            // Ativar modo "Matrix"
            document.body.style.background = '#000';
            document.body.style.color = '#00ff00';
            
            const matrixText = document.createElement('div');
            matrixText.innerHTML = '🐍 PYTHON MASTER MODE ACTIVATED 🐍';
            matrixText.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: #00ff00;
                background: rgba(0, 0, 0, 0.9);
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                animation: pulse 2s infinite;
            `;
            
            document.body.appendChild(matrixText);
            
            setTimeout(() => {
                document.body.removeChild(matrixText);
                location.reload();
            }, 3000);
        }
    });

    console.log('🐍 Python + GitHub Copilot Landing Page carregada com sucesso!');
    console.log('💡 Dica: Experimente o código Konami para uma surpresa! ↑↑↓↓←→←→BA');
});
