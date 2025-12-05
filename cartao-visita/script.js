// Dados do Cartão de Visitas
const cardData = {
    name: "Mizael Bragatti",
    jobTitle: "Desenvolvedor Full Stack",
    company: "Tech Solutions LTDA",
    phone: "+55 11 98044-9766",
    phoneRaw: "+5511980449766",
    email: "mizabgt@gmail.com",
    location: "São Paulo, SP",
    website: "https://sites.google.com/view/miza",
    websiteDisplay: "sites.google.com/view/miza",
    profilePhoto: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231e3a8a;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230f172a;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='150' height='150'/%3E%3Ctext fill='%23b8860b' font-family='Arial,sans-serif' font-size='60' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dy='.35em'%3EMB%3C/text%3E%3C/svg%3E",
    social: {
        linkedin: "https://www.linkedin.com/in/mizael-bragatti/",
        github: "https://github.com/MizaBragatti",
        instagram: "https://www.instagram.com/mizabragatti/",
        twitter: "https://x.com/mizabgt",
        youtube: "https://www.youtube.com/@mizabgt",
        whatsapp: "https://wa.me/5511980449766"
    }
};

// Preenche os dados no cartão ao carregar a página
function populateCard() {
    document.getElementById('name').textContent = cardData.name;
    document.getElementById('jobTitle').textContent = cardData.jobTitle;
    document.getElementById('company').textContent = cardData.company;
    document.getElementById('phone').textContent = cardData.phone;
    document.getElementById('phone').href = `tel:${cardData.phoneRaw}`;
    document.getElementById('email').textContent = cardData.email;
    document.getElementById('email').href = `mailto:${cardData.email}`;
    document.getElementById('location').textContent = cardData.location;
    document.getElementById('website').textContent = cardData.websiteDisplay;
    document.getElementById('website').href = cardData.website;
    document.getElementById('profilePhoto').src = cardData.profilePhoto;
    
    // Atualiza links das redes sociais
    document.getElementById('linkedinLink').href = cardData.social.linkedin;
    document.getElementById('githubLink').href = cardData.social.github;
    document.getElementById('instagramLink').href = cardData.social.instagram;
    document.getElementById('twitterLink').href = cardData.social.twitter;
    document.getElementById('youtubeLink').href = cardData.social.youtube;
    document.getElementById('whatsappLink').href = cardData.social.whatsapp;
}

// Gera QR Code
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ''; // Limpa QR code anterior
    
    // URL atual da página (você pode substituir por URL personalizada)
    const currentURL = window.location.href;
    
    // Ajusta tamanho do QR Code baseado no tamanho da tela
    const isMobile = window.innerWidth <= 600;
    const qrSize = isMobile ? Math.min(window.innerWidth - 100, 220) : 256;
    
    new QRCode(qrContainer, {
        text: currentURL,
        width: qrSize,
        height: qrSize,
        colorDark: "#1f2937",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Salva contato em formato vCard (.vcf)
function saveContact() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
TITLE:${cardData.jobTitle}
ORG:${cardData.company}
TEL;TYPE=CELL:${cardData.phoneRaw}
EMAIL:${cardData.email}
URL:${cardData.website}
ADR;TYPE=WORK:;;${cardData.location};;;
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Baixa o QR Code como imagem
function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    
    if (!canvas) {
        alert('QR Code não encontrado. Aguarde a geração.');
        return;
    }
    
    // Converte canvas para imagem
    canvas.toBlob(function(blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QRCode_${cardData.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    });
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', function() {
    populateCard();
    generateQRCode();
    
    // Regenera QR Code ao redimensionar a janela (para ajustar tamanho mobile)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            generateQRCode();
        }, 250);
    });
});
