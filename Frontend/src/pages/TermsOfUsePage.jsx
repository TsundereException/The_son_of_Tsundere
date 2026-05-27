import { FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-[70vh] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-indigo prose-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-6">
            <FileText className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Умови використання
          </h1>
          <p className="text-xl text-gray-500">
            Остання редакція: 24 травня 2026 року
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 sm:p-10 border border-gray-100 mb-10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-0 mb-6">
            <CheckCircle2 className="w-6 h-6 text-indigo-500" />
            1. Загальні положення
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Використовуючи платформу <strong>Tsundere</strong>, ви погоджуєтеся з цими Умовами. 
            Платформа надає послуги розміщення оголошень про продаж та обмін товарів. Ми залишаємо за собою право змінювати ці Умови в будь-який час, публікуючи оновлену версію на цій сторінці.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-10 mb-6">
            <AlertCircle className="w-6 h-6 text-indigo-500" />
            2. Правила публікації
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Користувачі зобов'язуються публікувати достовірну інформацію про товари. Заборонено:
          </p>
          <ul className="space-y-3 text-gray-700 mb-6">
            <li className="flex gap-2"><span className="text-red-500 font-bold">•</span> Продавати заборонені законодавством України товари (зброя, наркотичні речовини тощо).</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">•</span> Створювати дублікати оголошень.</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">•</span> Використовувати нецензурну лексику в описах або чатах.</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">•</span> Публікувати чужі фотографії з інтернету замість реальних фото товару.</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-10 mb-6">
            <Scale className="w-6 h-6 text-indigo-500" />
            3. Відповідальність сторін
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Платформа виступає виключно як посередник між продавцем та покупцем. Хоча ми забезпечуємо функціонал безпечної угоди, відповідальність за якість товару лежить на продавці.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Адміністрація має право заблокувати обліковий запис користувача у випадку порушення правил платформи або надходження обґрунтованих скарг від інших учасників.
          </p>

          <div className="mt-10 p-6 bg-indigo-50 rounded-xl text-indigo-900 text-sm border border-indigo-100">
            Здійснюючи реєстрацію, ви підтверджуєте, що ознайомилися з цими Умовами та приймаєте їх у повному обсязі.
          </div>
        </div>
      </div>
    </div>
  );
}
