interface FormStep1Props {
  form: {
    pwrClntNm: string;
    pwrCltPhn: string;
    pwrClntMl: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
}

export default function FormStep1({ form, onChange, onNext }: FormStep1Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pwrClntNm" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input 
          type="text" 
          required 
          id="pwrClntNm" 
          name="pwrClntNm"
          value={form.pwrClntNm}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="pwrCltPhn" className="block text-sm font-medium text-gray-700 mb-1">
          Whatsapp
        </label>
        <input 
          type="tel" 
          required 
          placeholder="(__) ____-____" 
          maxLength={11} 
          className="phone_mask w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          id="pwrCltPhn" 
          name="pwrCltPhn" 
          value={form.pwrCltPhn}
          onChange={onChange}
        />
      </div>
      
      <div>
        <label htmlFor="pwrClntMl" className="block text-sm font-medium text-gray-700 mb-1">
          E-mail
        </label>
        <input 
          type="email" 
          required 
          id="pwrClntMl" 
          name="pwrClntMl"
          value={form.pwrClntMl}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="button" 
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onNext}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}