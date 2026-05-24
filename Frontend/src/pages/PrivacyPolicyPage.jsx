import { ShieldCheck, EyeOff, Server, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[70vh] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-indigo prose-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Політика конфіденційності
          </h1>
          <p className="text-xl text-gray-500">
            Остання редакція: 24 травня 2026 року
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 sm:p-10 border border-gray-100 mb-10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-0 mb-6">
            <EyeOff className="w-6 h-6 text-indigo-500" />
            1. Збір інформації
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Ми збираємо мінімально необхідний обсяг персональних даних для забезпечення роботи платформи <strong>Tsundere</strong>. 
            Це включає ваше ім'я, адресу електронної пошти, номер телефону та дані про ваше місто. Ці дані потрібні для створення профілю, комунікації з іншими користувачами та оформлення безпечної угоди (доставки).
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-10 mb-6">
            <Database className="w-6 h-6 text-indigo-500" />
            2. Використання даних
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">•</span> Забезпечення роботи сервісу та обробка транзакцій.</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">•</span> Захист від шахрайства та зловживань.</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">•</span> Покращення користувацького досвіду та розробка нових функцій.</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">•</span> Надсилання важливих сповіщень щодо ваших оголошень та покупок.</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-10 mb-6">
            <Server className="w-6 h-6 text-indigo-500" />
            3. Захист та зберігання
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Всі дані надійно шифруються та зберігаються на захищених серверах. Ми не передаємо ваші дані третім особам у рекламних цілях. 
            Ваш пароль хешується, і ми не маємо до нього доступу.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ви маєте право у будь-який момент видалити свій обліковий запис разом з усією історією оголошень та повідомлень через налаштування профілю.
          </p>
          
          <div className="mt-10 p-6 bg-indigo-50 rounded-xl text-indigo-900 text-sm border border-indigo-100">
            Якщо у вас є запитання щодо нашої Політики конфіденційності, будь ласка, зверніться за адресою: <a href="mailto:privacy@tsundere.com" className="font-bold underline">privacy@tsundere.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
