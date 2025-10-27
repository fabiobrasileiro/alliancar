interface FormStep3Props {
  form: {
    pwrStt: string;
    pwrCt: string;
    taxiApp: boolean;
    pwrObs: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function FormStep3({ form, onChange, onBack, onSubmit, loading }: FormStep3Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pwrStt" className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select 
          required 
          id="pwrStt" 
          name="pwrStt"
          value={form.pwrStt}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">Selecione o estado</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="pwrCt" className="block text-sm font-medium text-gray-700 mb-1">
          Cidade
        </label>
        <select 
          required 
          id="pwrCt" 
          name="pwrCt"
          value={form.pwrCt}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">Selecione a cidade</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input 
          type="checkbox" 
          id="taxiApp" 
          name="taxiApp"
          checked={form.taxiApp}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="taxiApp" className="ml-2 block text-sm text-gray-700">
          Taxi/App (Uber, 99, etc)
        </label>
      </div>
      
      <div>
        <label htmlFor="pwrObs" className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea 
          id="pwrObs" 
          name="pwrObs" 
          rows={3}
          value={form.pwrObs}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
      </div>
      
      <input type="hidden" value="4lli4nc4r club487" id="pwrCmpnHsh" name="pwrCmpnHsh" />
      <input type="hidden" value="DOarNyQe" id="pwrFrmCode" name="pwrFrmCode" />
      <input type="hidden" value="1" id="pwrPplnClmn" name="pwrPplnClmn" />
      <input type="hidden" value="14588" id="pwrLdSrc" name="pwrLdSrc" />
      
      <div className="flex justify-between pt-4">
        <button 
          type="button" 
          className="bg-background0 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-background0 focus:ring-offset-2"
          onClick={onBack}
        >
          Voltar
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={onSubmit}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}