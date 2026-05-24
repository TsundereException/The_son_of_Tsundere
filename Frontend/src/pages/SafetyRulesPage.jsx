import { Shield, Lock, CreditCard, ExternalLink, AlertTriangle, MessageSquare } from 'lucide-react';

const SAFETY_RULES = [
  {
    icon: MessageSquare,
    title: "Спілкуйтеся лише в чаті платформи",
    description: "Шахраї часто намагаються перевести спілкування в Viber, Telegram або інші месенджери, щоб обійти системи захисту платформи. Залишаючись у нашому чаті, ви зберігаєте історію переписки, яка допоможе у разі спірних ситуацій.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: ExternalLink,
    title: "Не переходьте за сторонніми посиланнями",
    description: "Ніколи не відкривайте посилання, які вам надсилають в особисті повідомлення (наприклад, нібито 'посилання на оплату', 'правила' чи 'оформлення накладної'). Всі дії з оплати та оформлення відбуваються лише на нашому офіційному сайті.",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: CreditCard,
    title: "Не розголошуйте особисті дані",
    description: "Нікому не передавайте CVV-код, термін дії картки, паролі з SMS або ПІН-коди. Для переказу коштів потрібен лише 16-значний номер картки. Справжня служба підтримки ніколи не запитає у вас паролі.",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Shield,
    title: "Користуйтеся безпечною угодою",
    description: "Це найнадійніший спосіб покупки та продажу. Гроші резервуються на нашій платформі і переказуються продавцю лише після того, як ви оглянете та заберете товар на пошті. Це захищає вас від передоплат та відправок 'в нікуди'.",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    icon: AlertTriangle,
    title: "Перевіряйте товар при отриманні",
    description: "Завжди оглядайте посилку у відділенні пошти, перш ніж підписувати документи про отримання. Якщо товар не відповідає опису або пошкоджений — одразу відмовляйтеся від нього.",
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    icon: Lock,
    title: "Захистіть свій акаунт",
    description: "Використовуйте надійний, унікальний пароль. Якщо ви помітили підозрілу активність у своєму профілі — негайно змініть пароль та зверніться до служби підтримки.",
    color: "bg-purple-100 text-purple-600"
  }
];

export default function SafetyRulesPage() {
  return (
    <div className="min-h-[70vh] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-full mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Правила безпеки на Tsundere
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ваша безпека — наш пріоритет. Дотримуйтесь цих простих правил, щоб захистити свої гроші та особисті дані під час покупок і продажів.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {SAFETY_RULES.map((rule) => {
            const Icon = rule.icon;
            return (
              <div key={rule.title} className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow border border-gray-100">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${rule.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{rule.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-8 sm:p-10 border border-red-100">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 bg-white p-4 rounded-full shadow-sm">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Зіткнулися з шахраями?
              </h2>
              <p className="text-red-800 text-lg mb-4">
                Якщо ви помітили підозріле оголошення або повідомлення, обов'язково повідомте нам. Натисніть кнопку "Поскаржитись" на сторінці товару або напишіть у службу підтримки. Ми оперативно заблокуємо зловмисника.
              </p>
              <a href="mailto:security@tsundere.com" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-red-700 bg-red-100 hover:bg-red-200 transition-colors">
                Повідомити про порушення
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
