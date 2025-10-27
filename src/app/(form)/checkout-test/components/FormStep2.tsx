interface FormStep2Props {
  form: {
    pwrVhclPlt: string;
    pwrVhclTyp: string;
    pwrVhclBrnch: string;
    pwrVhclYr: string;
    pwrVhclMdl: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FormStep2({ form, onChange, onNext, onBack }: FormStep2Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pwrVhclPlt" className="block text-sm font-medium text-gray-700 mb-1">
          Placa
        </label>
        <input 
          type="text" 
          required 
          placeholder="XXX0000" 
          maxLength={7} 
          id="pwrVhclPlt" 
          name="pwrVhclPlt"
          value={form.pwrVhclPlt}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="pwrVhclTyp" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo do veículo
        </label>
        <select 
          required 
          id="pwrVhclTyp" 
          name="pwrVhclTyp"
          value={form.pwrVhclTyp}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">Selecione o tipo</option>
          <option value="1">Carro ou utilitário pequeno</option>
          <option value="2">Moto</option>
          <option value="3">Caminhão ou micro-ônibus</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="pwrVhclBrnch" className="block text-sm font-medium text-gray-700 mb-1">
          Marca do veículo
        </label>
        <select 
          required 
          id="pwrVhclBrnch" 
          name="pwrVhclBrnch"
          value={form.pwrVhclBrnch}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">Selecione a marca</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="pwrVhclYr" className="block text-sm font-medium text-gray-700 mb-1">
          Ano do modelo
        </label>
        <select 
          required 
          id="pwrVhclYr" 
          name="pwrVhclYr"
          value={form.pwrVhclYr}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">Selecione o ano</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="pwrVhclMdl" className="block text-sm font-medium text-gray-700 mb-1">
          Modelo
        </label>
        <select 
          required 
          id="pwrVhclMdl" 
          name="pwrVhclMdl"
          value={form.pwrVhclMdl}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">Selecione o modelo</option>
        </select>
      </div>
      
      <div className="flex justify-between pt-4">
        <button 
          type="button" 
          className="bg-background0 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-background0 focus:ring-offset-2"
          onClick={onBack}
        >
          Voltar
        </button>
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