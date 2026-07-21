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
let files = {
    ipa: null,
    p12: null,
    prov: null
};

// 1. عند رفع ملف الـ IPA
ipaInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        files.ipa = e.target.files[0];
        ipaLabel.innerHTML = `✅ تم اختيار: ${files.ipa.name}`;
        ipaLabel.classList.replace('text-purple-400', 'text-green-400');
        
        // إظهار الخطوة الثانية (الشهادات) بحركة ذكية
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

// دالة للتحقق إذا كانت كل الملفات جاهزة لإظهار زر التوقيع
function checkIfReadyToSign() {
    if (files.p12 && files.prov) {
        // إظهار زر التوقيع
        step3.classList.remove('hidden');
    }
}

// 4. عند الضغط على زر التوقيع
signBtn.addEventListener('click', async () => {
    const password = document.getElementById('cert-password').value;
    
    // تغيير شكل الزر لإظهار التحميل
    signBtn.disabled = true;
    signBtn.classList.add('opacity-50', 'cursor-not-allowed');
    statusText.classList.remove('hidden');
    statusText.innerText = "⏳ جاري توقيع التطبيق محلياً... لا تغلق الصفحة";

    // --- منطقة ربط محرك ZSIGN ---
    /* 
       هنا يتم استدعاء دالة الـ zsign.wasm 
       بما أن هذا مشروع جديد، تحتاج تجيب ملف zsign.wasm وسكربت الربط الخاص بيه 
       من مشروع SylvaSigner اللي تكلمنا عنه، وتستدعي دالة التوقيع هنا.
    */

    // محاكاة وهمية لعملية التوقيع (لغرض التجربة حالياً)
    setTimeout(() => {
        statusText.innerText = "🎉 تم التوقيع بنجاح! جاري التجهيز للتثبيت...";
        statusText.classList.replace('text-gray-400', 'text-green-400');
        signBtn.innerText = "تحميل التطبيق الموقع";
        signBtn.disabled = false;
        signBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }, 3000);
});
