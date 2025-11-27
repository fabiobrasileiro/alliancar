interface VistoriaData {
  id: number;
  placa: string;
  idUsuario: number;
  bateria: string;
  marcaBateria: string;
  cidade: string;
  contrato: string;
  localVistoria: string;
  motorista: string;
  data: string;
  hora: string;
  emailCliente: string;
  tipoVistoria: "1" | "2" | "3" | "4"; // 1: entrega 2:devolucao 3:entrega com colega 4:previstoria
  termosAceiteVistoria: string;
  observacao: string;
  fotos: any[];
  veiculo: {
    ano: number;
    nivelCombustivel: number;
    placa: string;
    nome: string;
    odometro: number;
    chassi: string;
    tipoVeiculo: string;
    qtdePneus: number;
    cor: string;
    pneus: {
      esquerdoTraseiro: any;
      esquerdoDianteiro: any;
      direitoTraseiro: any;
      direitoDianteiro: any;
      estepe: any;
    };
  };
  cliente: {
    nome: string;
    email: string;
    fone: string;
  };
}

interface PneuData {
  marca: string;
  situacao: string;
}

export class VistoriaService {
  private baseURL = process.env.VISTORIA_BASE_URL || 'https://sua-api-vistoria.com.br';

  async criarDadosVistoria(placa: string, customerData: any, vehicleData: any, paymentData: any): Promise<VistoriaData> {
    
    // Criar objeto pneu padrão
    const pneu: PneuData = {
      marca: "Michelin",
      situacao: "Novo"
    };

    // Montar objeto completo da vistoria
    const vistoriaData: VistoriaData = {
      id: this.gerarIdUnico(),
      placa: placa.toUpperCase(),
      idUsuario: 0, // Pode ser ajustado conforme seu sistema
      bateria: "",
      marcaBateria: "",
      cidade: customerData.cidade || "",
      contrato: paymentData.payment?.id || "",
      localVistoria: "",
      motorista: "",
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      emailCliente: customerData.email,
      tipoVistoria: "1", // 1: entrega
      termosAceiteVistoria: "",
      observacao: "",
      fotos: [],

      veiculo: {
        ano: parseInt(vehicleData.anoFabricacao) || 2020,
        nivelCombustivel: 8, // Valor padrão
        placa: placa.toUpperCase(),
        nome: `${vehicleData.marca} ${vehicleData.modelo}`,
        odometro: 1,
        chassi: vehicleData.chassi || "",
        tipoVeiculo: "",
        qtdePneus: 4,
        cor: vehicleData.cor || "BRANCO",
        pneus: {
          esquerdoTraseiro: pneu,
          esquerdoDianteiro: pneu,
          direitoTraseiro: pneu,
          direitoDianteiro: pneu,
          estepe: pneu
        }
      },

      cliente: {
        nome: customerData.name,
        email: customerData.email,
        fone: customerData.telefone
      }
    };

    return vistoriaData;
  }

  async enviarParaVistoria(vistoriaData: VistoriaData) {
    try {
      console.log('🚀 Enviando dados para vistoria:', vistoriaData);

      // Aqui você faria a chamada para a API de vistoria
      // Por enquanto, vamos simular o retorno
      
      const response = {
        success: true,
        vistoriaUrl: `${this.baseURL}/vistoria?placa=${vistoriaData.placa}&id=${vistoriaData.id}&contrato=${vistoriaData.contrato}`,
        dados: vistoriaData
      };

      console.log('✅ Dados de vistoria preparados:', response);
      return response;

    } catch (error: any) {
      console.error('❌ Erro ao enviar para vistoria:', error);
      throw new Error(`Erro na vistoria: ${error.message}`);
    }
  }

  private gerarIdUnico(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

export const vistoriaService = new VistoriaService();