// جلب العناصر من الواجهة
const ipaInput = document.getElementById('ipa-input');
const ipaLabel = document.getElementById('ipa-label-text');

const p12Input = document.getElementById('p12-input');
const p12Label = document.getElementById('p12-label-text');

const provInput = document.getElementById('prov-input');
const provLabel = document.getElementById('prov-label-text');

const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');

const signBtn = document.getElementById('sign-btn');
const statusText = document.getElementById('status-text');

// متغيرات لحفظ الملفات المرفوعة
let files = { ipa: null, p12: null, prov: null };

// 1. عند رفع ملف الـ IPA
ipaInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        files.ipa = e.target.files[0];
        ipaLabel.innerHTML = `✅ تم اختيار: ${files.ipa.name}`;
        ipaLabel.classList.replace('text-purple-400', 'text-green-400');
        step2.classList.remove('hidden');
    }
});

// 2. عند رفع ملف P12
p12Input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        files.p12 = e.target.files[0];
        p12Label.innerHTML = `✅ ${files.p12.name}`;
        checkIfReadyToSign();
    }
});

// 3. عند رفع ملف MobileProvision
provInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        files.prov = e.target.files[0];
        provLabel.innerHTML = `✅ ${files.prov.name}`;
        checkIfReadyToSign();
    }
});

function checkIfReadyToSign() {
    if (files.p12 && files.prov) {
        step3.classList.remove('hidden');
    }
}

// 4. عند الضغط على زر التوقيع (الربط الفعلي مع المحرك)
signBtn.addEventListener('click', async () => {
    const password = document.getElementById('cert-password').value;

    signBtn.disabled = true;
    signBtn.classList.add('opacity-50', 'cursor-not-allowed');
    statusText.classList.remove('hidden');
    statusText.innerText = "⏳ جاري إرسال الملفات للمحرك... يرجى الانتظار ولا تغلق الصفحة";

    try {
        // استدعاء ملف الـ Worker لمعالجة التوقيع بدون تجميد المتصفح
        const worker = new Worker('mobile-zsign-worker.js');

        worker.onmessage = function(e) {
            const msg = e.data;
            
            // إذا كان المحرك يرسل تقدم
            if (msg.type === 'progress' || msg.status) {
                statusText.innerText = "⚙️ " + (msg.message || msg.status);
            }
            
            // إذا اكتمل التوقيع
            if (msg.type === 'done' || msg.success || msg.blob || msg.data) {
                statusText.innerText = "🎉 تم التوقيع بنجاح! جاري التحميل...";
                statusText.classList.replace('text-gray-400', 'text-green-400');
                signBtn.innerText = "✅ اكتمل التوقيع";

                // إنشاء رابط لتحميل التطبيق الموقع
                const fileData = msg.blob || msg.data || msg.ipa;
                const blob = fileData instanceof Blob ? fileData : new Blob([fileData], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // تغيير اسم التطبيق ليحمل اسم متجرك
                a.download = files.ipa.name.replace('.ipa', '_HassanySigned.ipa');
                a.click();

                worker.terminate();
            }
            
            // إذا حدث خطأ
            if (msg.type === 'error' || msg.error) {
                statusText.innerText = "❌ حدث خطأ: " + (msg.message || msg.error);
                statusText.classList.replace('text-gray-400', 'text-red-400');
                signBtn.disabled = false;
                signBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                signBtn.innerText = "إعادة المحاولة";
                worker.terminate();
            }
        };

        worker.onerror = function(err) {
            statusText.innerText = "❌ حدث خطأ في محرك التوقيع.";
            statusText.classList.replace('text-gray-400', 'text-red-400');
            worker.terminate();
        };

        // قراءة الملفات لتجهيزها للمحرك
        const readAsArrayBuffer = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });

        const ipaBuffer = await readAsArrayBuffer(files.ipa);
        const p12Buffer = await readAsArrayBuffer(files.p12);
        const provBuffer = await readAsArrayBuffer(files.prov);

        statusText.innerText = "⏳ جاري التوقيع محلياً (قد يستغرق بعض الوقت للتطبيقات الكبيرة)...";

        // إرسال الملفات للمحرك ليبدأ التوقيع
        worker.postMessage({
            command: 'sign',
            ipa: ipaBuffer,
            p12: p12Buffer,
            prov: provBuffer,
            password: password,
            ipaName: files.ipa.name
        });

    } catch (error) {
        statusText.innerText = "❌ حدث خطأ أثناء تجهيز الملفات.";
        statusText.classList.replace('text-gray-400', 'text-red-400');
    }
});
