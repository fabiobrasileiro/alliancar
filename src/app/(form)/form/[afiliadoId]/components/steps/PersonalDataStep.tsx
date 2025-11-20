import { FormState } from "./types";

interface PersonalDataStepProps {
  form: FormState;
  onChange: (name: string, value: string) => void;
  onNext: () => void;
}

export default function PersonalDataStep({ form, onChange, onNext }: PersonalDataStepProps) {
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validateWhatsApp = (phone: string) =>
    /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(phone);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    onChange(e.target.name, formatted);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    onChange(e.target.name, formatted);
  };

  const baseInput = "w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500 placeholder-gray-400";

  const isFormValid =
    form.name.trim() &&
    validateEmail(form.email) &&
    form.cpfCnpj.replace(/\D/g, '').length === 11 &&
    validateWhatsApp(form.whatsApp);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Dados Pessoais</h3>

      <input
        name="name"
        placeholder="Nome completo"
        value={form.name}
        onChange={(e) => onChange(e.target.name, e.target.value)}
        className={baseInput}
        required
      />

      <div className="relative">
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => onChange(e.target.name, e.target.value)}
          className={`${baseInput} ${
            form.email && !validateEmail(form.email)
              ? "border-red-500"
              : "border-gray-600"
          }`}
          required
        />
        {form.email && (
          <span
            className={`absolute right-3 top-3 text-sm ${
              validateEmail(form.email) ? "text-green-500" : "text-red-500"
            }`}
          >
            {validateEmail(form.email) ? "✓" : "✗"}
          </span>
        )}
      </div>

      <input
        name="cpfCnpj"
        placeholder="CPF"
        value={form.cpfCnpj}
        onChange={handleCPFChange}
        maxLength={14}
        className={baseInput}
        required
      />

      <div className="relative">
        <input
          name="whatsApp"
          placeholder="WhatsApp (11) 99999-9999"
          value={form.whatsApp}
          onChange={handleWhatsAppChange}
          className={`${baseInput} ${
            form.whatsApp && !validateWhatsApp(form.whatsApp)
              ? "border-red-500"
              : "border-gray-600"
          }`}
          maxLength={15}
          required
        />
        {form.whatsApp && (
          <span
            className={`absolute right-3 top-3 text-sm ${
              validateWhatsApp(form.whatsApp)
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {validateWhatsApp(form.whatsApp) ? "✓" : "✗"}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!isFormValid}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        Próximo
      </button>
    </div>
  );
}