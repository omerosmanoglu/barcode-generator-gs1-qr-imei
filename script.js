// Barkod Oluşturucu - Vue 3 Application

const { createApp, ref, computed, watch, nextTick, onMounted } = Vue;

createApp({
    setup() {
        // State
        const barcodeType = ref('code128');
        const inputText = ref('');
        const exportFormat = ref('svg');
        const barcodeWidth = ref(3);  // Default width for better readability
        const barcodeHeight = ref(120); // Default height for better readability
        const displayValue = ref(true); // Show human readable text
        const qrCodeSize = ref(300); // QR Code size
        const printColumns = ref(4); // Print layout columns (1-12)
        const barcodesPerPage = ref(12); // Barcodes per page for printing (1-50)
        const showBarcodeText = ref(false); // Show barcode text (default hidden)
        const labelSpacing = ref(0); // Horizontal spacing between labels (px)
        const lineSpacing = ref(0); // Vertical spacing between rows (px)
        const pageSettings = ref({
            pageType: 'A4',
            width: '210mm',
            height: '297mm',
            marginTop: '0cm',
            marginLeft: '0cm'
        });
        const generatedBarcodes = ref([]);
        const previewData = ref('');
        const isDarkMode = ref(false);
        const textareaRef = ref(null);
        const toastEl = ref(null);
        const autoGenModalEl = ref(null);
        const barcodesModalEl = ref(null);
        
        // QR Template Modal Refs
        const urlModalEl = ref(null);
        const vcardModalEl = ref(null);
        const smsModalEl = ref(null);
        const phoneModalEl = ref(null);
        const locationModalEl = ref(null);
        const calendarModalEl = ref(null);
        const emailModalEl = ref(null);
        const wifiModalEl = ref(null);
        const whatsappModalEl = ref(null);
        const gtinModalEl = ref(null);
        const foodModalEl = ref(null);
        const logisticsModalEl = ref(null);
        const agricultureModalEl = ref(null);
        const textileModalEl = ref(null);
        const imeiModalEl = ref(null);
        
        // QR Template Input Refs
        const urlInputEl = ref(null);
        const vcardInputEl = ref(null);
        const smsInputEl = ref(null);
        const phoneInputEl = ref(null);
        const locationInputEl = ref(null);
        const calendarInputEl = ref(null);
        const emailInputEl = ref(null);
        const wifiInputEl = ref(null);
        const whatsappInputEl = ref(null);
        const gtinInputEl = ref(null);
        const foodGtinInputEl = ref(null);
        const logisticsSsccInputEl = ref(null);
        const agricultureGtinInputEl = ref(null);
        const textileGtinInputEl = ref(null);
        const imeiTacInputEl = ref(null);
        
        // Template Management Refs
        const saveTemplateModalEl = ref(null);
        const pageSettingsModalEl = ref(null);
        const templateNameInputEl = ref(null);
        
        // QR Template State
        const clearBeforeAdd = ref(true);
        const qrTemplates = ref({
            url: { website: '' },
            vcard: {
                firstName: '',
                lastName: '',
                organization: '',
                title: '',
                mobile: '',
                workPhone: '',
                personalEmail: '',
                workEmail: '',
                website: '',
                address: '',
                city: '',
                country: '',
                postalCode: ''
            },
            sms: { countryCode: '+90', phone: '', message: '' },
            phone: { countryCode: '+90', phone: '' },
            location: { latitude: '', longitude: '', name: '', useGoogleMaps: true },
            calendar: {
                title: '',
                description: '',
                location: '',
                startDate: '',
                startTime: '',
                endDate: '',
                endTime: ''
            },
            email: { email: '', subject: '', body: '' },
            wifi: { encryption: 'WPA', ssid: '', password: '', hidden: false },
            whatsapp: { countryCode: '+90', phone: '', message: '' },
            gtin: { gtin: '', mfgDate: '', expDate: '', lotNo: '', serialNo: '' },
            food: { gtin: '', lotNo: '', bestBeforeDate: '', expiryDate: '', weight: '' },
            logistics: { sscc: '', quantity: '', lotNo: '', bestBeforeDate: '', expiryDate: '', deliveryGLN: '', locationGLN: '' },
            agriculture: { gtin: '', lotNo: '', packingDate: '', bestBeforeDate: '', weight: '', originCountry: '' },
            textile: { gtin: '', serialNo: '', lotNo: '', additionalCode: '', customerPartNo: '' },
            imei: { tac: '', startNum: 100, endNum: 150, increment: 1, haneSayisi: 15, imeiCount: 0 }
        });
        
        // Template Management State
        const templateName = ref('');
        const savedTemplates = ref([]);
        const selectedTemplateId = ref('');
        const STORAGE_KEY = 'qBarkod';
        
        // Auto Generator State
        const autoGen = ref({
            prefix: '869',
            suffix: '',
            startNum: 1,
            endNum: 100,
            increment: 1,
            mask: '$$$$$$$$$'
        });

        // Toast State
        const toastTitle = ref('');
        const toastMessage = ref('');
        const toastType = ref('success');
        const toastIcon = ref('bi-check-circle-fill');

        // Modal instances
        let autoGenModal = null;
        let barcodesModal = null;
        let saveTemplateModal = null;
        let pageSettingsModal = null;
        let urlModal = null;
        let vcardModal = null;
        let smsModal = null;
        let phoneModal = null;
        let locationModal = null;
        let calendarModal = null;
        let emailModal = null;
        let wifiModal = null;
        let whatsappModal = null;
        let gtinModal = null;
        let foodModal = null;
        let logisticsModal = null;
        let agricultureModal = null;
        let textileModal = null;
        let imeiModal = null;

        // Computed
        const lineCount = computed(() => {
            return inputText.value.trim() ? inputText.value.trim().split('\n').length : 0;
        });

        const charCount = computed(() => {
            return inputText.value.length;
        });

        const firstLine = computed(() => {
            const lines = inputText.value.trim().split('\n');
            return lines[0]?.trim() || '';
        });

        const firstQRBlock = computed(() => {
            const text = inputText.value.trim();
            if (!text) return '';
            
            // QR Code için -----QR----- ayracı varsa ilk bloğu al
            if (text.includes('-----QR-----')) {
                const blocks = text.split('-----QR-----').filter(block => block.trim());
                return blocks[0]?.trim() || '';
            }
            
            // Ayraç yoksa ilk satırı al
            const lines = text.split('\n');
            return lines[0]?.trim() || '';
        });

        // Auto Generator Computed Properties
        const autoGenPrefixLength = computed(() => {
            return (autoGen.value.prefix || '').length;
        });

        const autoGenSuffixLength = computed(() => {
            return (autoGen.value.suffix || '').length;
        });

        const autoGenMaskLength = computed(() => {
            return (autoGen.value.mask || '').length;
        });

        const autoGenMaskDollarCount = computed(() => {
            const mask = autoGen.value.mask || '';
            return (mask.match(/\$/g) || []).length;
        });

        const autoGenMaskSpecialCount = computed(() => {
            return autoGenMaskLength.value - autoGenMaskDollarCount.value;
        });

        const autoGenTotalLength = computed(() => {
            return autoGenPrefixLength.value + autoGenMaskLength.value + autoGenSuffixLength.value;
        });

        const autoGenBarcodeCount = computed(() => {
            const start = autoGen.value.startNum || 0;
            const end = autoGen.value.endNum || 0;
            const increment = autoGen.value.increment || 1;
            
            if (end < start) return 0;
            
            return Math.floor((end - start) / increment) + 1;
        });

        const autoGenEndNumLength = computed(() => {
            return (autoGen.value.endNum || 0).toString().length;
        });

        const autoGenWarning = computed(() => {
            if (autoGenEndNumLength.value > autoGenMaskDollarCount.value && autoGenMaskDollarCount.value > 0) {
                return `⚠️ Bitiş numarası ${autoGenEndNumLength.value} karakter, ancak maske sayısal kısmı ${autoGenMaskDollarCount.value} karakter! Maske en az ${autoGenEndNumLength.value} adet $ işareti (${Array(autoGenEndNumLength.value).fill('$').join('')}) içermelidir.`;
            }
            return '';
        });

        // Food/Gıda AI Computed Property - Miktara göre doğru 310X seçer
        const selectedFoodAI = computed(() => {
            const weight = qrTemplates.value.food.weight;
            if (!weight) return '';
            
            const weightStr = String(weight);
            const parts = weightStr.split('.');
            const decimalPlaces = parts.length > 1 ? parts[1].length : 0;
            
            // Decimal places'e göre AI code seç: 3100-3105 aralığında
            const aiCode = 3100 + Math.min(decimalPlaces, 4);
            return aiCode.toString();
        });

        // Agriculture/Tarım AI Computed Property - Ağırlığa göre 310X seçer
        const selectedAgricultureAI = computed(() => {
            const weight = qrTemplates.value.agriculture.weight;
            if (!weight) return '';
            
            const weightStr = String(weight);
            const parts = weightStr.split('.');
            const decimalPlaces = parts.length > 1 ? parts[1].length : 0;
            
            const aiCode = 3100 + Math.min(decimalPlaces, 4);
            return aiCode.toString();
        });

        // IMEI Count Computed
        const imeiCount = computed(() => {
            const { tac, startNum, endNum, increment } = qrTemplates.value.imei;
            if (!tac || tac.length !== 8 || startNum >= endNum || increment <= 0) {
                return 0;
            }
            return Math.floor((endNum - startNum) / increment) + 1;
        });

        // Update IMEI count when inputs change
        watch(() => qrTemplates.value.imei.startNum, (newVal) => {
            qrTemplates.value.imei.imeiCount = imeiCount.value;
        });

        watch(() => qrTemplates.value.imei.endNum, (newVal) => {
            qrTemplates.value.imei.imeiCount = imeiCount.value;
        });

        watch(() => qrTemplates.value.imei.increment, (newVal) => {
            qrTemplates.value.imei.imeiCount = imeiCount.value;
        });

        // Watchers
        watch(barcodeType, () => {
            updatePreview();
        });

        watch(firstLine, () => {
            if (barcodeType.value !== 'qrcode') {
                updatePreview();
            }
        });

        watch(firstQRBlock, () => {
            if (barcodeType.value === 'qrcode') {
                updatePreview();
            }
        });

        watch(isDarkMode, (newVal) => {
            document.documentElement.setAttribute('data-bs-theme', newVal ? 'dark' : 'light');
        });

        // Watch selectedTemplateId - auto load when selected
        watch(selectedTemplateId, (newVal) => {
            if (newVal) {
                loadTemplate();
            }
        });

        // Methods

        /**
         * Calculate EAN-13 check digit
         */
        function calculateEAN13CheckDigit(code) {
            if (code.length !== 12) return null;
            
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                const digit = parseInt(code[i]);
                sum += (i % 2 === 0) ? digit : digit * 3;
            }
            
            const checkDigit = (10 - (sum % 10)) % 10;
            return checkDigit.toString();
        }

        /**
         * Apply mask correctly - replace $ with digits
         */
        function applyMaskCorrect(num, mask) {
            const numStr = num.toString();
            const dollarCount = (mask.match(/\$/g) || []).length;
            const paddedNum = numStr.padStart(dollarCount, '0');
            
            let result = mask;
            let numIndex = 0;
            result = result.replace(/\$/g, () => paddedNum[numIndex++] || '0');
            
            return result;
        }

        /**
         * Open auto generator modal
         */
        function openAutoGenModal() {
            if (autoGenModal) {
                autoGenModal.show();
            }
        }

        /**
         * Generate automatic barcodes
         */
        function generateAuto() {
            try {
                const { prefix, suffix, startNum, endNum, increment, mask } = autoGen.value;
                
                if (startNum > endNum) {
                    showToast('Hata', 'Başlangıç numarası bitiş numarasından büyük olamaz', 'danger');
                    return;
                }

                if (endNum - startNum > 10000) {
                    showToast('Uyarı', 'Maksimum 10.000 satır oluşturulabilir', 'warning');
                    return;
                }

                let generated = [];
                for (let i = startNum; i <= endNum; i += increment) {
                    const maskedNum = applyMaskCorrect(i, mask);
                    const fullCode = prefix + maskedNum + suffix;
                    generated.push(fullCode);
                }

                inputText.value = generated.join('\n');
                showToast('Başarılı', `${generated.length} adet barkod verisi oluşturuldu`, 'success');
                
                // Close modal
                if (autoGenModal) {
                    autoGenModal.hide();
                }
            } catch (error) {
                showToast('Hata', error.message, 'danger');
            }
        }

        /**
         * Update live preview based on first line
         */
        function updatePreview() {
            // QR Code için firstQRBlock, diğerleri için firstLine kullan
            if (barcodeType.value === 'qrcode') {
                previewData.value = firstQRBlock.value;
            } else {
                previewData.value = firstLine.value;
            }

            if (!previewData.value) {
                return;
            }

            nextTick(() => {
                try {
                    if (barcodeType.value === 'ean13') {
                        renderEAN13Preview(previewData.value);
                    } else if (barcodeType.value === 'code128') {
                        renderCode128Preview(previewData.value);
                    } else if (barcodeType.value === 'qrcode') {
                        renderQRPreview(previewData.value);
                    }
                } catch (error) {
                    console.error('Preview error:', error);
                }
            });
        }

        /**
         * Render EAN-13 preview
         */
        function renderEAN13Preview(data) {
            let code = data.replace(/\D/g, '');
            
            if (code.length === 12) {
                const checkDigit = calculateEAN13CheckDigit(code);
                code = code + checkDigit;
            }

            if (code.length !== 13) {
                return;
            }

            JsBarcode("#previewBarcode", code, {
                format: "EAN13",
                width: 2,
                height: 100,
                displayValue: displayValue.value,
                margin: 10
            });
        }

        /**
         * Render Code128 preview
         */
        function renderCode128Preview(data) {
            if (!data) return;
            
            JsBarcode("#previewBarcode", data, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: displayValue.value,
                margin: 10
            });
        }

        /**
         * Render QR Code preview
         */
        function renderQRPreview(data) {
            const container = document.getElementById('qrPreview');
            container.innerHTML = '';
            
            new QRCode(container, {
                text: data,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        /**
         * Get smart display text for QR Code
         */
        /**
         * Get QR code type as short string (for filename)
         */
        function getQRType(data) {
            if (data.startsWith('BEGIN:VCARD')) {
                return 'vcard';
            } else if (data.startsWith('SMSTO:')) {
                return 'sms';
            } else if (data.startsWith('tel:')) {
                return 'telefon';
            } else if (data.startsWith('geo:') || data.includes('maps.google.com')) {
                return 'konum';
            } else if (data.startsWith('BEGIN:VEVENT')) {
                return 'takvim';
            } else if (data.startsWith('mailto:')) {
                return 'email';
            } else if (data.startsWith('WIFI:')) {
                return 'wifi';
            } else if (data.includes('wa.me')) {
                return 'whatsapp';
            } else if (data.startsWith('http://') || data.startsWith('https://')) {
                return 'url';
            }
            return 'qrcode';
        }

        function getQRDisplayText(data) {
            // Detect QR type and return appropriate label
            if (data.startsWith('http://') || data.startsWith('https://')) {
                return '🌐 URL: ' + data.substring(0, 40) + (data.length > 40 ? '...' : '');
            } else if (data.startsWith('BEGIN:VCARD')) {
                const nameMatch = data.match(/FN:([^\n]+)/);
                return '👤 VCard: ' + (nameMatch ? nameMatch[1] : 'İletişim Kartı');
            } else if (data.startsWith('SMSTO:')) {
                const phoneMatch = data.match(/SMSTO:([^:]+)/);
                return '💬 SMS: ' + (phoneMatch ? phoneMatch[1] : 'Mesaj');
            } else if (data.startsWith('tel:')) {
                return '📞 Telefon: ' + data.substring(4);
            } else if (data.startsWith('geo:') || data.includes('maps.google.com')) {
                return '📍 Konum';
            } else if (data.startsWith('BEGIN:VEVENT')) {
                const titleMatch = data.match(/SUMMARY:([^\n]+)/);
                return '📅 Takvim: ' + (titleMatch ? titleMatch[1] : 'Etkinlik');
            } else if (data.startsWith('mailto:')) {
                const emailMatch = data.match(/mailto:([^?]+)/);
                return '✉️ E-Posta: ' + (emailMatch ? emailMatch[1] : 'Mail');
            } else if (data.startsWith('WIFI:')) {
                const ssidMatch = data.match(/S:([^;]+)/);
                return '📶 WiFi: ' + (ssidMatch ? ssidMatch[1] : 'Ağ');
            } else if (data.includes('wa.me')) {
                const phoneMatch = data.match(/wa\.me\/([0-9]+)/);
                return '🟢 WhatsApp: ' + (phoneMatch ? '+' + phoneMatch[1] : 'Mesaj');
            }
            
            // Default: Show first 50 characters
            return data.substring(0, 50) + (data.length > 50 ? '...' : '');
        }

        /**
         * Generate all barcodes and show modal
         */
        async function generateBarcodes() {
            try {
                // Parse QR codes with -----QR----- separator for QR Code type
                let lines;
                if (barcodeType.value === 'qrcode') {
                    // Eğer -----QR----- ayracı varsa, blok blok parse et
                    if (inputText.value.includes('-----QR-----')) {
                        const qrBlocks = inputText.value.split('-----QR-----').filter(block => block.trim());
                        lines = qrBlocks.map(block => block.trim());
                    } else {
                        // Ayraç yoksa her satır için ayrı QR oluştur
                        lines = inputText.value.trim().split('\n').filter(line => line.trim());
                    }
                } else {
                    lines = inputText.value.trim().split('\n').filter(line => line.trim());
                }
                
                if (lines.length === 0) {
                    showToast('Uyarı', 'Lütfen barkod verisi girin', 'warning');
                    return;
                }

                if (lines.length > 10000) {
                    showToast('Uyarı', 'Maksimum 10.000 satır işlenebilir', 'warning');
                    return;
                }

                generatedBarcodes.value = [];

                // Validate EAN-13
                if (barcodeType.value === 'ean13') {
                    for (let line of lines) {
                        const code = line.replace(/\D/g, '');
                        if (code.length !== 12 && code.length !== 13) {
                            showToast('Hata', `EAN-13 için veri 12 veya 13 hane olmalıdır: ${line}`, 'danger');
                            return;
                        }
                    }
                }

                // Generate barcodes
                for (let line of lines) {
                    let processedData = line.trim();
                    let displayText = processedData;
                    
                    let qrType = null;
                    
                    if (barcodeType.value === 'ean13') {
                        let code = processedData.replace(/\D/g, '');
                        if (code.length === 12) {
                            const checkDigit = calculateEAN13CheckDigit(code);
                            code = code + checkDigit;
                        }
                        processedData = code;
                        displayText = code;
                    } else if (barcodeType.value === 'qrcode') {
                        // QR Code için display text'i akıllıca belirle
                        displayText = getQRDisplayText(processedData);
                        qrType = getQRType(processedData);
                    }

                    generatedBarcodes.value.push({
                        data: processedData,
                        displayText: displayText,
                        type: barcodeType.value,
                        qrType: qrType
                    });
                }

                await nextTick();
                
                showToast('Başarılı', `${generatedBarcodes.value.length} adet barkod oluşturuldu`, 'success');
                
                // Show modal
                if (barcodesModal) {
                    barcodesModal.show();
                }

                // Render barcodes after modal is shown
                setTimeout(() => {
                    renderAllBarcodes();
                }, 300);
                
            } catch (error) {
                showToast('Hata', error.message, 'danger');
            }
        }



        /**
         * Luhn code oluşturucu - IMEI vb. şeyler için
         */
        function jsLuhn(tacKod, baslangic, bitis, artis = 1, haneSayisi = 15) {
            const sonucListesi = [];
            let mevcutSayi = baslangic;

            while (mevcutSayi <= bitis) {
                // Dinamik artan sayıyı soluna sıfır ekleyerek string'e çeviriyoruz
                const dolguUzunlugu = haneSayisi - 1 - tacKod.length;
                const sayiString = String(mevcutSayi).padStart(dolguUzunlugu, '0');
                
                // 14 haneli taban IMEI oluşturuluyor
                const taban14 = tacKod + sayiString;

                let toplam = 0;

                // 14 haneyi tek tek dönerek Luhn toplamını buluyoruz
                for (let i = 0; i < taban14.length; i++) {
                    let basamak = parseInt(taban14.charAt(i), 10);

                    // JavaScript'te indeks 0'dan başladığı için tek indeksler (1, 3, 5...) 
                    // aslında 2., 4. ve 6. hanelere denk gelir.
                    if (i % 2 !== 0) {
                        basamak *= 2;
                        if (basamak > 9) {
                            basamak -= 9;
                        }
                    }

                    toplam += basamak;
                }

                // Luhn Kontrol Basamağı (Check Digit) Hesaplama
                const kontrolBasamagi = (10 - (toplam % 10)) % 10;

                // 15 haneli tam IMEI'yi listeye ekle
                sonucListesi.push(taban14 + kontrolBasamagi);

                // Belirtilen artış miktarı kadar arttırıyoruz
                mevcutSayi += artis;
            }

            return sonucListesi;
        }

        /**
         * Render all generated barcodes
         */
        function renderAllBarcodes() {
            generatedBarcodes.value.forEach((barcode, index) => {
                const container = document.getElementById(`barcode-${index}`);
                if (!container) return;
                
                container.innerHTML = '';

                try {
                    if (barcode.type === 'ean13') {
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        container.appendChild(svg);
                        JsBarcode(svg, barcode.data, {
                            format: "EAN13",
                            width: barcodeWidth.value,
                            height: barcodeHeight.value,
                            displayValue: displayValue.value,
                            margin: 10
                        });
                    } else if (barcode.type === 'code128') {
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        container.appendChild(svg);
                        JsBarcode(svg, barcode.data, {
                            format: "CODE128",
                            width: barcodeWidth.value,
                            height: barcodeHeight.value,
                            displayValue: displayValue.value,
                            margin: 10
                        });
                    } else if (barcode.type === 'qrcode') {
                        new QRCode(container, {
                            text: barcode.data,
                            width: qrCodeSize.value,
                            height: qrCodeSize.value,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    }
                } catch (error) {
                    console.error(`Error rendering barcode ${index}:`, error);
                }
            });
        }

        /**
         * Download as ZIP
         */
        async function downloadZip() {
            try {
                if (generatedBarcodes.value.length === 0) {
                    showToast('Uyarı', 'Önce barkod oluşturun', 'warning');
                    return;
                }

                showToast('İşleniyor', 'ZIP dosyası hazırlanıyor...', 'info');

                const zip = new JSZip();
                const format = exportFormat.value;

                for (let i = 0; i < generatedBarcodes.value.length; i++) {
                    const barcode = generatedBarcodes.value[i];
                    const container = document.getElementById(`barcode-${i}`);
                    
                    // Create filename based on barcode type
                    let filename;
                    if (barcode.type === 'qrcode' && barcode.qrType) {
                        // QR Code: use type-based naming
                        filename = `${barcode.qrType}-${String(i + 1).padStart(4, '0')}.${format}`;
                    } else if (barcode.type === 'ean13' || barcode.type === 'code128') {
                        // EAN-13 & Code128: use barcode data as filename
                        const sanitizedData = barcode.data.replace(/[/\\:*?"<>|]/g, '_');
                        filename = `${sanitizedData}.${format}`;
                    } else {
                        // Fallback
                        filename = `barcode-${String(i + 1).padStart(4, '0')}.${format}`;
                    }

                    if (format === 'svg') {
                        const svgElement = container.querySelector('svg');
                        if (svgElement) {
                            const svgData = new XMLSerializer().serializeToString(svgElement);
                            zip.file(filename, svgData);
                        } else if (barcode.type === 'qrcode') {
                            // QR Code canvas to PNG for SVG format
                            const canvas = container.querySelector('canvas');
                            if (canvas) {
                                const dataUrl = canvas.toDataURL('image/png');
                                const base64Data = dataUrl.split(',')[1];
                                zip.file(filename.replace('.svg', '.png'), base64Data, { base64: true });
                            }
                        }
                    } else if (format === 'png') {
                        try {
                            const dataUrl = await htmlToImage.toPng(container, {
                                backgroundColor: '#ffffff',
                                pixelRatio: 3,  // Higher quality for better readability
                                quality: 1.0,
                                width: container.offsetWidth,
                                height: container.offsetHeight
                            });
                            const base64Data = dataUrl.split(',')[1];
                            zip.file(filename, base64Data, { base64: true });
                        } catch (error) {
                            console.error(`Error converting ${i} to PNG:`, error);
                        }
                    }
                }

                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `barcodes-export-${Date.now()}.zip`);
                
                showToast('Başarılı', 'ZIP dosyası indirildi', 'success');
            } catch (error) {
                showToast('Hata', 'ZIP oluşturulurken hata: ' + error.message, 'danger');
            }
        }

        /**
         * Print barcodes - Opens print preview for barcode grid
         */
        function printBarcodes() {
            if (generatedBarcodes.value.length === 0) {
                showToast('Uyarı', 'Önce barkod oluşturun', 'warning');
                return;
            }

            // Update dynamic print styles
            updatePrintStyles();

            // Trigger browser print dialog
            window.print();
        }

        /**
         * Update dynamic print styles based on user settings
         */
        function updatePrintStyles() {
            // Remove existing dynamic style
            const existingStyle = document.getElementById('dynamic-print-styles');
            if (existingStyle) {
                existingStyle.remove();
            }

            // Create new style element
            const style = document.createElement('style');
            style.id = 'dynamic-print-styles';
            style.innerHTML = `
                @media print {
                    @page {
                        size: ${pageSettings.value.pageType === 'A4' ? 'A4' : 
                               pageSettings.value.pageType === 'Letter' ? 'letter' : 
                               pageSettings.value.width + ' ' + pageSettings.value.height};
                        margin-top: ${pageSettings.value.marginTop};
                        margin-left: ${pageSettings.value.marginLeft};
                        margin-right: ${pageSettings.value.marginLeft};
                        margin-bottom: ${pageSettings.value.marginTop};
                    }

                    #barcode-grid .col {
                        padding-right: ${labelSpacing.value}px !important;
                    }

                    #barcode-grid .barcode-item {
                        margin-bottom: ${lineSpacing.value}px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Check if page break should be added after this barcode
         */
        function shouldAddPageBreak(index) {
            const isLastItem = index === generatedBarcodes.value.length - 1;
            const isPageEnd = (index + 1) % barcodesPerPage.value === 0;
            return isPageEnd && !isLastItem;
        }

        /**
         * Show toast notification
         */
        function showToast(title, message, type = 'success') {
            toastTitle.value = title;
            toastMessage.value = message;
            toastType.value = type;
            
            const icons = {
                success: 'bi-check-circle-fill',
                danger: 'bi-x-circle-fill',
                warning: 'bi-exclamation-triangle-fill',
                info: 'bi-info-circle-fill'
            };
            toastIcon.value = icons[type] || icons.success;

            const toast = new bootstrap.Toast(toastEl.value);
            toast.show();
        }

        /**
         * Get placeholder text
         */
        function getPlaceholder() {
            const placeholders = {
                ean13: 'Her satıra bir EAN-13 kodu yazın (12 hane olarak veya Check Digit ile 13 hane olarak yazabilirsiniz.)\n\nÖrnek:\n869123456789\n869123456790\n8690000000005\n869123456791',
                code128: 'Her satıra bir metin yazın\n\nÖrnek:\nABC123\nSTOK-001\nQPORTAL-2026',
                qrcode: 'QR Code için -----QR----- ayracı kullanın\n\nÖrnek:\n-----QR-----\nhttps://qportal.com.tr\n-----QR-----\nhttps://example.com\n\nVeya Hazır QR Şablonlarını kullanın!'
            };
            return placeholders[barcodeType.value] || '';
        }

        /**
         * Toggle dark mode
         */
        function toggleTheme() {
            isDarkMode.value = !isDarkMode.value;
            localStorage.setItem('darkMode', isDarkMode.value);
        }

        /**
         * Clear input
         */
        function clearInput() {
            inputText.value = '';
            previewData.value = '';
            showToast('Temizlendi', 'Veri girişi temizlendi', 'info');
        }

        /**
         * Select all text
         */
        function selectAll() {
            if (textareaRef.value) {
                textareaRef.value.select();
                showToast('Seçildi', 'Tüm metin seçildi', 'info');
            }
        }

        /**
         * Copy input to clipboard
         */
        async function copyInput() {
            try {
                await navigator.clipboard.writeText(inputText.value);
                showToast('Kopyalandı', 'Metin panoya kopyalandı', 'success');
            } catch (error) {
                showToast('Hata', 'Kopyalama başarısız', 'danger');
            }
        }

        /**
         * Clear all
         */
        function clearAll() {
            inputText.value = '';
            previewData.value = '';
            generatedBarcodes.value = [];
            showToast('Temizlendi', 'Tüm veriler temizlendi', 'info');
        }

        // ============================================
        // TEMPLATE MANAGEMENT FUNCTIONS
        // ============================================

        /**
         * Load saved templates from localStorage
         */
        function loadSavedTemplates() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    savedTemplates.value = JSON.parse(stored);
                }
            } catch (error) {
                console.error('Error loading templates:', error);
                savedTemplates.value = [];
            }
        }



        /**
         * Open save template modal
         */
        function openSaveTemplateModal() {
            templateName.value = '';
            if (saveTemplateModal) {
                saveTemplateModal.show();
                // Auto focus template name input
                nextTick(() => {
                    if (templateNameInputEl.value) {
                        templateNameInputEl.value.focus();
                    }
                });
            }
        }

        /**
         * Open page settings modal
         */
        function openPageSettingsModal() {
            if (pageSettingsModal) {
                pageSettingsModal.show();
            }
        }

        /**
         * Save current template to localStorage
         * TODO: İleride backend API'ye gönderilecek
         */
        function saveTemplate() {
            if (!templateName.value.trim()) {
                showToast('Uyarı', 'Lütfen şablon adı girin', 'warning');
                return;
            }

            if (!inputText.value.trim()) {
                showToast('Uyarı', 'Lütfen barkod verisi girin', 'warning');
                return;
            }

            try {
                const template = {
                    id: Date.now().toString(),
                    name: templateName.value.trim(),
                    barcodeType: barcodeType.value,
                    exportFormat: exportFormat.value,
                    barcodeWidth: barcodeWidth.value,
                    barcodeHeight: barcodeHeight.value,
                    displayValue: displayValue.value,
                    qrCodeSize: qrCodeSize.value,
                    data: inputText.value,
                    printSettings: {
                        printColumns: printColumns.value,
                        barcodesPerPage: barcodesPerPage.value,
                        labelSpacing: labelSpacing.value,
                        lineSpacing: lineSpacing.value,
                        pageSettings: { ...pageSettings.value }
                    },
                    timestamp: Date.now()
                };

                savedTemplates.value.push(template);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTemplates.value));

                showToast('Başarılı', 'Şablon başarıyla kaydedildi', 'success');
                
                if (saveTemplateModal) {
                    saveTemplateModal.hide();
                }
            } catch (error) {
                showToast('Hata', 'Şablon kaydedilemedi: ' + error.message, 'danger');
            }
        }

        /**
         * Load selected template
         * TODO: İleride backend API'den çekilecek
         */
        function loadTemplate() {
            if (!selectedTemplateId.value) {
                showToast('Uyarı', 'Lütfen bir şablon seçin', 'warning');
                return;
            }

            try {
                const template = savedTemplates.value.find(t => t.id === selectedTemplateId.value);
                if (!template) {
                    showToast('Hata', 'Şablon bulunamadı', 'danger');
                    return;
                }

                // Load template data
                barcodeType.value = template.barcodeType;
                exportFormat.value = template.exportFormat;
                barcodeWidth.value = template.barcodeWidth;
                barcodeHeight.value = template.barcodeHeight;
                displayValue.value = template.displayValue;
                qrCodeSize.value = template.qrCodeSize;
                inputText.value = template.data;

                // Load print settings if available
                if (template.printSettings) {
                    printColumns.value = template.printSettings.printColumns || 4;
                    barcodesPerPage.value = template.printSettings.barcodesPerPage || 12;
                    labelSpacing.value = template.printSettings.labelSpacing || 0;
                    lineSpacing.value = template.printSettings.lineSpacing || 0;
                    if (template.printSettings.pageSettings) {
                        pageSettings.value = { ...template.printSettings.pageSettings };
                    }
                }

                showToast('Başarılı', `"${template.name}" şablonu yüklendi`, 'success');
            } catch (error) {
                showToast('Hata', 'Şablon yüklenemedi: ' + error.message, 'danger');
            }
        }

        /**
         * Delete selected template
         */
        function deleteTemplate() {
            if (!selectedTemplateId.value) {
                showToast('Uyarı', 'Lütfen bir şablon seçin', 'warning');
                return;
            }

            if (!confirm('Bu şablonu silmek istediğinizden emin misiniz?')) {
                return;
            }

            try {
                savedTemplates.value = savedTemplates.value.filter(t => t.id !== selectedTemplateId.value);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTemplates.value));

                showToast('Başarılı', 'Şablon silindi', 'success');
                selectedTemplateId.value = '';
            } catch (error) {
                showToast('Hata', 'Şablon silinemedi: ' + error.message, 'danger');
            }
        }

        // ============================================
        // QR TEMPLATE FUNCTIONS
        // ============================================

        /**
         * Open QR Template Modal
         */
        function openQRTemplate(type) {
            const modals = {
                url: urlModal,
                vcard: vcardModal,
                sms: smsModal,
                phone: phoneModal,
                location: locationModal,
                calendar: calendarModal,
                email: emailModal,
                wifi: wifiModal,
                whatsapp: whatsappModal,
                gtin: gtinModal,
                food: foodModal,
                logistics: logisticsModal,
                agriculture: agricultureModal,
                textile: textileModal,
                imei: imeiModal
            };

            const modal = modals[type];
            if (modal) {
                modal.show();
                
                // Auto focus first input
                nextTick(() => {
                    const inputRefs = {
                        url: urlInputEl,
                        vcard: vcardInputEl,
                        sms: smsInputEl,
                        phone: phoneInputEl,
                        location: locationInputEl,
                        calendar: calendarInputEl,
                        email: emailInputEl,
                        wifi: wifiInputEl,
                        whatsapp: whatsappInputEl,
                        gtin: gtinInputEl,
                        food: foodGtinInputEl,
                        logistics: logisticsSsccInputEl,
                        agriculture: agricultureGtinInputEl,
                        textile: textileGtinInputEl,
                        imei: imeiTacInputEl
                    };
                    
                    if (inputRefs[type] && inputRefs[type].value) {
                        inputRefs[type].value.focus();
                    }
                });
            }
        }

        /**
         * Sanitize QR text - removes Turkish characters and converts line breaks to spaces
         * Used for all QR types (SMS, WhatsApp, Email, WiFi, URL, etc.)
         */
        function sanitizeQRText(text) {
            if (!text) return '';
            
            // Turkish character replacement map
            const turkishCharMap = {
                'Ü': 'U', 'Ğ': 'G', 'İ': 'I', 'Ş': 'S', 'Ç': 'C', 'Ö': 'O',
                'ü': 'u', 'ğ': 'g', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ö': 'o'
            };
            
            // Replace Turkish characters
            let sanitized = text;
            for (const [turkish, ascii] of Object.entries(turkishCharMap)) {
                sanitized = sanitized.replace(new RegExp(turkish, 'g'), ascii);
            }
            
            // Convert line breaks to spaces
            return sanitized.replace(/\r?\n/g, ' ');
        }

        /**
         * Sanitize VCard/iCalendar field values
         * Applies QR text sanitization + VCard/iCalendar special character escaping
         */
        function sanitizeVCardField(text) {
            if (!text) return '';
            
            // First apply general QR sanitization (Turkish chars + line breaks to space)
            let sanitized = sanitizeQRText(text);
            
            // Then apply VCard/iCalendar escaping
            return sanitized
                .replace(/\\/g, '\\\\')  // Backslash escape
                .replace(/;/g, '\\;')    // Semicolon escape
                .replace(/,/g, '\\,');    // Comma escape
        }

        /**
         * Format date string from YYYY-MM-DD to YYMMDD format for GTIN/UDI
         * Example: 2025-06-10 → 250610
         */
        function formatDateToYYMMDD(dateString) {
            if (!dateString) return '';
            
            // Parse YYYY-MM-DD format directly to avoid timezone issues
            const parts = String(dateString).split('-');
            if (parts.length !== 3) return '';
            
            const year = parts[0].slice(-2); // Last 2 digits of year (YYYY → YY)
            const month = String(parts[1]).padStart(2, '0'); // Month (MM)
            const day = String(parts[2]).padStart(2, '0'); // Day (DD)
            
            return `${year}${month}${day}`;
        }

        /**
         * Format weight for GS1 format (310X)
         * Converts decimal weight to 6-digit format
         * Examples: 12 → 000012, 12.3 → 000123, 12.34 → 001234, 12.340 → 012340, 12.3400 → 123400
         */
        function formatWeightForGS1(weight) {
            if (!weight) return '';
            
            // Remove decimal point and convert to string for digit counting
            const weightStr = String(weight);
            const numericOnly = weightStr.replace('.', '');
            
            // Pad to 6 digits with leading zeros
            return numericOnly.padStart(6, '0');
        }

        /**
         * Add QR Template to textarea
         */
        function addQRTemplate(type) {
            let qrContent = '';

            try {
                switch (type) {
                    case 'url':
                        if (!qrTemplates.value.url.website) {
                            showToast('Hata', 'Website adresi gereklidir', 'danger');
                            return;
                        }
                        qrContent = sanitizeQRText(qrTemplates.value.url.website);
                        break;

                    case 'vcard':
                        if (!qrTemplates.value.vcard.firstName) {
                            showToast('Hata', 'Ad gereklidir', 'danger');
                            return;
                        }
                        const v = qrTemplates.value.vcard;
                        const fullName = `${sanitizeVCardField(v.firstName)} ${sanitizeVCardField(v.lastName)}`.trim();
                        qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${fullName}`;
                        if (v.organization) qrContent += `\nORG:${sanitizeVCardField(v.organization)}`;
                        if (v.title) qrContent += `\nTITLE:${sanitizeVCardField(v.title)}`;
                        if (v.mobile) qrContent += `\nTEL;TYPE=CELL:${sanitizeVCardField(v.mobile)}`;
                        if (v.workPhone) qrContent += `\nTEL;TYPE=WORK:${sanitizeVCardField(v.workPhone)}`;
                        if (v.personalEmail) qrContent += `\nEMAIL;TYPE=HOME:${sanitizeVCardField(v.personalEmail)}`;
                        if (v.workEmail) qrContent += `\nEMAIL;TYPE=WORK:${sanitizeVCardField(v.workEmail)}`;
                        if (v.website) qrContent += `\nURL:${sanitizeVCardField(v.website)}`;
                        if (v.address || v.city || v.country || v.postalCode) {
                            qrContent += `\nADR:;;${sanitizeVCardField(v.address)};${sanitizeVCardField(v.city)};;${sanitizeVCardField(v.postalCode)};${sanitizeVCardField(v.country)}`;
                        }
                        qrContent += `\nEND:VCARD`;
                        break;

                    case 'sms':
                        if (!qrTemplates.value.sms.phone) {
                            showToast('Hata', 'Telefon numarası gereklidir', 'danger');
                            return;
                        }
                        const smsPhone = qrTemplates.value.sms.countryCode + qrTemplates.value.sms.phone.replace(/\s/g, '');
                        qrContent = `SMSTO:${smsPhone}:${sanitizeQRText(qrTemplates.value.sms.message)}`;
                        break;

                    case 'phone':
                        if (!qrTemplates.value.phone.phone) {
                            showToast('Hata', 'Telefon numarası gereklidir', 'danger');
                            return;
                        }
                        const phone = qrTemplates.value.phone.countryCode + qrTemplates.value.phone.phone.replace(/\s/g, '');
                        qrContent = `tel:${phone}`;
                        break;

                    case 'location':
                        const lat = qrTemplates.value.location.latitude;
                        const lng = qrTemplates.value.location.longitude;
                        const locationName = qrTemplates.value.location.name?.trim();
                        
                        if (qrTemplates.value.location.useGoogleMaps) {
                            // Google Maps format - name or coordinates or both
                            if (locationName && lat && lng) {
                                // Both name and coordinates provided
                                const query = `${locationName} ${lat},${lng}`;
                                qrContent = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
                            } else if (locationName) {
                                // Only name provided
                                qrContent = `https://maps.google.com/?q=${encodeURIComponent(locationName)}`;
                            } else if (lat && lng) {
                                // Only coordinates provided
                                qrContent = `https://maps.google.com/?q=${lat},${lng}`;
                            } else {
                                showToast('Hata', 'En az Konum Adı veya Koordinat gereklidir', 'danger');
                                return;
                            }
                        } else {
                            // Geo format (coordinates only)
                            if (!lat || !lng) {
                                showToast('Hata', 'Geo formatı için Enlem ve Boylam gereklidir', 'danger');
                                return;
                            }
                            qrContent = `geo:${lat},${lng}`;
                        }
                        break;

                    case 'calendar':
                        if (!qrTemplates.value.calendar.title || !qrTemplates.value.calendar.startDate) {
                            showToast('Hata', 'Başlık ve Başlangıç Tarihi gereklidir', 'danger');
                            return;
                        }
                        const cal = qrTemplates.value.calendar;
                        const startDateTime = `${cal.startDate}${cal.startTime ? 'T' + cal.startTime.replace(':', '') + '00' : ''}`.replace(/-/g, '');
                        const endDateTime = cal.endDate 
                            ? `${cal.endDate}${cal.endTime ? 'T' + cal.endTime.replace(':', '') + '00' : ''}`.replace(/-/g, '')
                            : startDateTime;
                        
                        qrContent = `BEGIN:VEVENT\nSUMMARY:${sanitizeVCardField(cal.title)}`;
                        if (cal.description) qrContent += `\nDESCRIPTION:${sanitizeVCardField(cal.description)}`;
                        if (cal.location) qrContent += `\nLOCATION:${sanitizeVCardField(cal.location)}`;
                        qrContent += `\nDTSTART:${startDateTime}`;
                        qrContent += `\nDTEND:${endDateTime}`;
                        qrContent += `\nEND:VEVENT`;
                        break;

                    case 'email':
                        if (!qrTemplates.value.email.email) {
                            showToast('Hata', 'E-Posta adresi gereklidir', 'danger');
                            return;
                        }
                        qrContent = `mailto:${qrTemplates.value.email.email}`;
                        const params = [];
                        if (qrTemplates.value.email.subject) params.push(`subject=${encodeURIComponent(sanitizeQRText(qrTemplates.value.email.subject))}`);
                        if (qrTemplates.value.email.body) params.push(`body=${encodeURIComponent(sanitizeQRText(qrTemplates.value.email.body))}`);
                        if (params.length > 0) qrContent += '?' + params.join('&');
                        break;

                    case 'wifi':
                        if (!qrTemplates.value.wifi.ssid) {
                            showToast('Hata', 'SSID gereklidir', 'danger');
                            return;
                        }
                        const wifi = qrTemplates.value.wifi;
                        const encType = wifi.encryption === 'nopass' ? 'nopass' : wifi.encryption;
                        qrContent = `WIFI:T:${encType};S:${sanitizeQRText(wifi.ssid)};`;
                        if (wifi.encryption !== 'nopass' && wifi.password) {
                            qrContent += `P:${sanitizeQRText(wifi.password)};`;
                        }
                        if (wifi.hidden) qrContent += `H:true;`;
                        qrContent += ';';
                        break;

                    case 'whatsapp':
                        if (!qrTemplates.value.whatsapp.phone) {
                            showToast('Hata', 'Telefon numarası gereklidir', 'danger');
                            return;
                        }
                        const waPhone = qrTemplates.value.whatsapp.countryCode.replace('+', '') + 
                                      qrTemplates.value.whatsapp.phone.replace(/\s/g, '');
                        qrContent = `https://wa.me/${waPhone}`;
                        if (qrTemplates.value.whatsapp.message) {
                            qrContent += `?text=${encodeURIComponent(sanitizeQRText(qrTemplates.value.whatsapp.message))}`;
                        }
                        break;

                    case 'gtin':
                        if (!qrTemplates.value.gtin.gtin) {
                            showToast('Hata', 'GTIN / UDI-DI gereklidir', 'danger');
                            return;
                        }
                        const gtin = qrTemplates.value.gtin;
                        qrContent = `(01)${gtin.gtin}`;
                        if (gtin.mfgDate) {
                            qrContent += `(11)${formatDateToYYMMDD(gtin.mfgDate)}`;
                        }
                        if (gtin.expDate) {
                            qrContent += `(17)${formatDateToYYMMDD(gtin.expDate)}`;
                        }
                        if (gtin.lotNo) {
                            qrContent += `(10)${gtin.lotNo}`;
                        }
                        if (gtin.serialNo) {
                            qrContent += `(21)${gtin.serialNo}`;
                        }
                        break;

                    case 'food':
                        if (!qrTemplates.value.food.gtin) {
                            showToast('Hata', 'GTIN / Ürün Kodu gereklidir', 'danger');
                            return;
                        }
                        const food = qrTemplates.value.food;
                        qrContent = `(01)${food.gtin}`;
                        if (food.lotNo) {
                            qrContent += `(10)${food.lotNo}`;
                        }
                        if (food.bestBeforeDate) {
                            qrContent += `(15)${formatDateToYYMMDD(food.bestBeforeDate)}`;
                        }
                        if (food.expiryDate) {
                            qrContent += `(17)${formatDateToYYMMDD(food.expiryDate)}`;
                        }
                        if (food.weight) {
                            const ai = selectedFoodAI.value;
                            const formattedWeight = formatWeightForGS1(food.weight);
                            qrContent += `(${ai})${formattedWeight}`;
                        }
                        break;

                    case 'logistics':
                        if (!qrTemplates.value.logistics.sscc) {
                            showToast('Hata', 'SSCC Numarası gereklidir', 'danger');
                            return;
                        }
                        const logistics = qrTemplates.value.logistics;
                        qrContent = `(00)${logistics.sscc}`;
                        if (logistics.quantity) {
                            qrContent += `(37)${logistics.quantity}`;
                        }
                        if (logistics.lotNo) {
                            qrContent += `(10)${logistics.lotNo}`;
                        }
                        if (logistics.bestBeforeDate) {
                            qrContent += `(15)${formatDateToYYMMDD(logistics.bestBeforeDate)}`;
                        }
                        if (logistics.expiryDate) {
                            qrContent += `(17)${formatDateToYYMMDD(logistics.expiryDate)}`;
                        }
                        if (logistics.deliveryGLN) {
                            qrContent += `(410)${logistics.deliveryGLN}`;
                        }
                        if (logistics.locationGLN) {
                            qrContent += `(414)${logistics.locationGLN}`;
                        }
                        break;

                    case 'agriculture':
                        if (!qrTemplates.value.agriculture.gtin) {
                            showToast('Hata', 'GTIN gereklidir', 'danger');
                            return;
                        }
                        const agriculture = qrTemplates.value.agriculture;
                        qrContent = `(01)${agriculture.gtin}`;
                        if (agriculture.lotNo) {
                            qrContent += `(10)${agriculture.lotNo}`;
                        }
                        if (agriculture.packingDate) {
                            qrContent += `(13)${formatDateToYYMMDD(agriculture.packingDate)}`;
                        }
                        if (agriculture.bestBeforeDate) {
                            qrContent += `(15)${formatDateToYYMMDD(agriculture.bestBeforeDate)}`;
                        }
                        if (agriculture.weight) {
                            const ai = selectedAgricultureAI.value;
                            const formattedWeight = formatWeightForGS1(agriculture.weight);
                            qrContent += `(${ai})${formattedWeight}`;
                        }
                        if (agriculture.originCountry) {
                            qrContent += `(422)${agriculture.originCountry}`;
                        }
                        break;

                    case 'textile':
                        if (!qrTemplates.value.textile.gtin) {
                            showToast('Hata', 'GTIN gereklidir', 'danger');
                            return;
                        }
                        const textile = qrTemplates.value.textile;
                        qrContent = `(01)${textile.gtin}`;
                        if (textile.additionalCode) {
                            qrContent += `(240)${textile.additionalCode}`;
                        }
                        if (textile.serialNo) {
                            qrContent += `(21)${textile.serialNo}`;
                        }
                        if (textile.lotNo) {
                            qrContent += `(10)${textile.lotNo}`;
                        }
                        if (textile.customerPartNo) {
                            qrContent += `(241)${textile.customerPartNo}`;
                        }
                        break;

                    case 'imei':
                        const imei = qrTemplates.value.imei;
                        if (!imei.tac || imei.tac.length < 1 || imei.tac.length > 8) {
                            showToast('Hata', 'TAC kodu 1-8 hane olmalıdır', 'danger');
                            return;
                        }
                        
                        // Call jsLuhn to generate IMEI array
                        const imeiArray = jsLuhn(imei.tac, imei.startNum, imei.endNum, imei.increment, imei.haneSayisi);
                        qrContent = imeiArray.join('\n');
                        break;
                }

                // Handle GTIN/UDI, Food, Logistics, Agriculture, Textile, IMEI - add as normal line without QR separator
                if (type === 'gtin' || type === 'food' || type === 'logistics' || type === 'agriculture' || type === 'textile' || type === 'imei') {
                    if (clearBeforeAdd.value) {
                        inputText.value = qrContent;
                    } else {
                        inputText.value += (inputText.value ? '\n' : '') + qrContent;
                    }
                } else {
                    // Add QR separator and content for other QR types
                    const qrBlock = `-----QR-----\n${qrContent}\n`;
                    
                    if (clearBeforeAdd.value) {
                        inputText.value = qrBlock;
                    } else {
                        inputText.value += (inputText.value ? '\n' : '') + qrBlock;
                    }
                }

                // Close modal
                const modals = {
                    url: urlModal,
                    vcard: vcardModal,
                    sms: smsModal,
                    phone: phoneModal,
                    location: locationModal,
                    calendar: calendarModal,
                    email: emailModal,
                    wifi: wifiModal,
                    whatsapp: whatsappModal,
                    gtin: gtinModal,
                    food: foodModal,
                    logistics: logisticsModal,
                    agriculture: agricultureModal,
                    textile: textileModal,
                    imei: imeiModal
                };
                
                if (modals[type]) {
                    modals[type].hide();
                }

                // Reset form
                resetQRTemplate(type);

                showToast('Başarılı', 'QR verisi eklendi', 'success');

            } catch (error) {
                showToast('Hata', error.message, 'danger');
            }
        }

        /**
         * Reset QR Template Form
         */
        function resetQRTemplate(type) {
            switch (type) {
                case 'url':
                    qrTemplates.value.url.website = '';
                    break;
                case 'vcard':
                    qrTemplates.value.vcard = {
                        firstName: '', lastName: '', organization: '', title: '',
                        mobile: '', workPhone: '', personalEmail: '', workEmail: '',
                        website: '', address: '', city: '', country: '', postalCode: ''
                    };
                    break;
                case 'sms':
                    qrTemplates.value.sms = { countryCode: '+90', phone: '', message: '' };
                    break;
                case 'phone':
                    qrTemplates.value.phone = { countryCode: '+90', phone: '' };
                    break;
                case 'location':
                    qrTemplates.value.location = { latitude: '', longitude: '', name: '', useGoogleMaps: true };
                    break;
                case 'calendar':
                    qrTemplates.value.calendar = {
                        title: '', description: '', location: '',
                        startDate: '', startTime: '', endDate: '', endTime: ''
                    };
                    break;
                case 'email':
                    qrTemplates.value.email = { email: '', subject: '', body: '' };
                    break;
                case 'wifi':
                    qrTemplates.value.wifi = { encryption: 'WPA', ssid: '', password: '', hidden: false };
                    break;
                case 'whatsapp':
                    qrTemplates.value.whatsapp = { countryCode: '+90', phone: '', message: '' };
                    break;
                case 'imei':
                    qrTemplates.value.imei = { tac: '', startNum: 100, endNum: 150, increment: 1, haneSayisi: 15, imeiCount: 0 };
                    break;
            }
        }

        // Lifecycle
        onMounted(() => {
            // Load theme preference
            const savedTheme = localStorage.getItem('darkMode');
            if (savedTheme === 'true') {
                isDarkMode.value = true;
            }

            // Initialize modals
            autoGenModal = new bootstrap.Modal(autoGenModalEl.value);
            barcodesModal = new bootstrap.Modal(barcodesModalEl.value);
            saveTemplateModal = new bootstrap.Modal(saveTemplateModalEl.value);
            pageSettingsModal = new bootstrap.Modal(pageSettingsModalEl.value);
            
            // Initialize QR Template Modals
            urlModal = new bootstrap.Modal(urlModalEl.value);
            vcardModal = new bootstrap.Modal(vcardModalEl.value);
            smsModal = new bootstrap.Modal(smsModalEl.value);
            phoneModal = new bootstrap.Modal(phoneModalEl.value);
            locationModal = new bootstrap.Modal(locationModalEl.value);
            calendarModal = new bootstrap.Modal(calendarModalEl.value);
            emailModal = new bootstrap.Modal(emailModalEl.value);
            wifiModal = new bootstrap.Modal(wifiModalEl.value);
            whatsappModal = new bootstrap.Modal(whatsappModalEl.value);
            gtinModal = new bootstrap.Modal(gtinModalEl.value);
            foodModal = new bootstrap.Modal(foodModalEl.value);
            logisticsModal = new bootstrap.Modal(logisticsModalEl.value);
            agricultureModal = new bootstrap.Modal(agricultureModalEl.value);
            textileModal = new bootstrap.Modal(textileModalEl.value);
            imeiModal = new bootstrap.Modal(imeiModalEl.value);

            // Load default barcode data from index.html
            if (typeof varsayilanBarkodlar !== 'undefined') {
                inputText.value = varsayilanBarkodlar;
            }
            updatePreview();
            
            // Load saved templates from localStorage
            loadSavedTemplates();
        });

        return {
            // State
            barcodeType,
            inputText,
            exportFormat,
            barcodeWidth,
            barcodeHeight,
            displayValue,
            qrCodeSize,
            printColumns,
            barcodesPerPage,
            showBarcodeText,
            labelSpacing,
            lineSpacing,
            pageSettings,
            generatedBarcodes,
            previewData,
            isDarkMode,
            textareaRef,
            toastEl,
            autoGenModalEl,
            barcodesModalEl,
            autoGen,
            toastTitle,
            toastMessage,
            toastType,
            toastIcon,
            
            // QR Template Refs
            urlModalEl,
            vcardModalEl,
            smsModalEl,
            phoneModalEl,
            locationModalEl,
            calendarModalEl,
            emailModalEl,
            wifiModalEl,
            whatsappModalEl,
            gtinModalEl,
            foodModalEl,
            logisticsModalEl,
            agricultureModalEl,
            textileModalEl,
            imeiModalEl,
            urlInputEl,
            vcardInputEl,
            smsInputEl,
            phoneInputEl,
            locationInputEl,
            calendarInputEl,
            emailInputEl,
            wifiInputEl,
            whatsappInputEl,
            gtinInputEl,
            foodGtinInputEl,
            logisticsSsccInputEl,
            agricultureGtinInputEl,
            textileGtinInputEl,
            imeiTacInputEl,
            
            // QR Template State
            clearBeforeAdd,
            qrTemplates,
            
            // Template Management
            saveTemplateModalEl,
            pageSettingsModalEl,
            templateNameInputEl,
            templateName,
            savedTemplates,
            selectedTemplateId,
            
            // Computed
            lineCount,
            charCount,
            firstLine,
            firstQRBlock,
            autoGenPrefixLength,
            autoGenSuffixLength,
            autoGenMaskLength,
            autoGenMaskDollarCount,
            autoGenMaskSpecialCount,
            autoGenTotalLength,
            autoGenBarcodeCount,
            autoGenEndNumLength,
            autoGenWarning,
            selectedFoodAI,
            selectedAgricultureAI,
            
            // Methods
            openAutoGenModal,
            generateAuto,
            updatePreview,
            generateBarcodes,
            downloadZip,
            printBarcodes,
            shouldAddPageBreak,
            getPlaceholder,
            toggleTheme,
            clearInput,
            selectAll,
            copyInput,
            clearAll,
            
            // QR Template Methods
            openQRTemplate,
            addQRTemplate,
            formatDateToYYMMDD,
            formatWeightForGS1,
            
            // Template Management Methods
            openSaveTemplateModal,
            openPageSettingsModal,
            saveTemplate,
            loadTemplate,
            deleteTemplate
        };
    }
}).mount('#app');
