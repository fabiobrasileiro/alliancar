const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Tentar carregar de ambos os arquivos
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {}
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {}

// Carregar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Estrutura de referência baseada no tabelas.md
const estruturaReferencia = {
  afiliados: {
    colunas: [
      { nome: 'id', tipo: 'string (uuid)', exemplo: 'ca70d710-506b-47d7-bc93-c39c91aae07a' },
      { nome: 'cnpj', tipo: 'string', exemplo: '58169785000100' },
      { nome: 'meta', tipo: 'number', exemplo: 2500 },
      { nome: 'tipo', tipo: 'string', exemplo: 'afiliado' },
      { nome: 'ativo', tipo: 'boolean', exemplo: true },
      { nome: 'email', tipo: 'string', exemplo: 'obraboguns@gmail.com' },
      { nome: 'auth_id', tipo: 'string (uuid)', exemplo: '350e8276-2d85-454c-9d3e-6e2b68512af8' },
      { nome: 'telefone', tipo: 'string | null', exemplo: null },
      { nome: 'criado_em', tipo: 'string (timestamp)', exemplo: '2025-10-31T23:56:24.932588+00:00' },
      { nome: 'super_admin', tipo: 'boolean', exemplo: false },
      { nome: 'valor_adesao', tipo: 'number', exemplo: 0 },
      { nome: 'atualizado_em', tipo: 'string (timestamp)', exemplo: '2025-10-31T23:56:24.932588+00:00' },
      { nome: 'nome_completo', tipo: 'string', exemplo: 'EVERSON LUIZ CARVALHO DE SOUZA' },
      { nome: 'foto_perfil_url', tipo: 'string | null', exemplo: null },
      { nome: 'porcentagem_comissao', tipo: 'number', exemplo: 0.03 },
      { nome: 'referral_id', tipo: 'string (uuid) | null', exemplo: null }
    ]
  }
};

async function getTableStructure(tableName) {
  try {
    const structure = {
      columns: [],
      constraints: [],
      indexes: []
    };

    // Primeiro, tentar buscar dados para inferir estrutura
    const { data: sampleData, error: dataError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (!dataError && sampleData && sampleData.length > 0) {
      // Inferir estrutura dos dados
      const firstRow = sampleData[0];
      structure.columns = Object.keys(firstRow).map(key => {
        const value = firstRow[key];
        let tipo = Array.isArray(value) ? 'array' : value === null ? 'unknown' : typeof value;
        
        // Melhorar detecção de tipos
        if (typeof value === 'string') {
          if (value.match(/^\d{4}-\d{2}-\d{2}T/)) tipo = 'timestamp';
          else if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) tipo = 'uuid';
        }
        
        return {
          nome: key,
          tipo: tipo,
          exemplo: value !== null && value !== undefined 
            ? (typeof value === 'object' && !Array.isArray(value) 
                ? JSON.stringify(value).substring(0, 100) 
                : String(value).substring(0, 100))
            : null,
          nullable: value === null
        };
      });
    } else if (estruturaReferencia[tableName]) {
      // Se não há dados mas temos referência, usar ela
      structure.columns = estruturaReferencia[tableName].colunas;
    } else {
      // Tentar verificar se a tabela existe mesmo sem dados
      const { error: testError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (testError && testError.message.includes('schema cache')) {
        // Tabela não existe
        return null;
      }
      
      // Tabela existe mas está vazia e não temos referência
      structure.columns = [];
    }

    return structure;
  } catch (err) {
    return null;
  }
}

async function getAllTableData(tableName) {
  try {
    // Buscar TODOS os dados da tabela (sem limite)
    let allData = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        allData = allData.concat(data);
        offset += limit;
        hasMore = data.length === limit;
      } else {
        hasMore = false;
      }
    }

    return allData;
  } catch (err) {
    console.warn(`⚠️  Erro ao buscar dados de ${tableName}:`, err.message);
    return [];
  }
}

async function exportAllTables() {
  console.log('🔄 Iniciando exportação COMPLETA do banco de dados...\n');
  console.log('📦 Isso pode levar alguns minutos dependendo do tamanho do banco...\n');

  const exportData = {
    exportado_em: new Date().toISOString(),
    supabase_url: supabaseUrl,
    informacoes: {
      total_tabelas: 0,
      total_registros: 0,
      tabelas_com_dados: 0,
      tabelas_vazias: 0
    },
    estrutura_completa: {},
    dados_completos: {}
  };

  // Lista de tabelas conhecidas do sistema (baseado no código e tabelas.md)
  const knownTables = [
    'afiliados',
    'customers',
    'payments',
    'subscriptions',
    'saques',
    'atividades',
    'contatos',
    'negociacoes',
    'insurance_plans',
    'vehicle_categories',
    'preco_adesao',
    'afiliado_bank_data',
    'afiliado_dashboard',
    'afiliado_ranking',
    'financeiro_dashboard',
    'hotlinks',
    'documentos'
  ];

  console.log('📋 Processando tabelas conhecidas...\n');

  for (const tableName of knownTables) {
    try {
      console.log(`  🔍 Processando: ${tableName}...`);

      // Buscar estrutura da tabela
      const structure = await getTableStructure(tableName);
      
      // Buscar TODOS os dados da tabela
      const allData = await getAllTableData(tableName);

      if (structure && structure.columns && structure.columns.length > 0) {
        exportData.estrutura_completa[tableName] = {
          existe: true,
          total_colunas: structure.columns.length,
          colunas: structure.columns,
          total_registros: allData.length,
          exemplo_registro: allData.length > 0 ? allData[0] : null
        };

        exportData.dados_completos[tableName] = {
          total_registros: allData.length,
          dados: allData
        };

        if (allData.length > 0) {
          exportData.informacoes.tabelas_com_dados++;
          exportData.informacoes.total_registros += allData.length;
          console.log(`     ✅ ${allData.length} registros exportados`);
        } else {
          exportData.informacoes.tabelas_vazias++;
          console.log(`     ⚠️  Tabela vazia`);
        }
      } else {
        // Tabela existe mas não conseguimos pegar estrutura
        const { data: testData, error: testError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!testError) {
          exportData.estrutura_completa[tableName] = {
            existe: true,
            observacao: 'Estrutura não pôde ser inferida automaticamente'
          };

          const allData = await getAllTableData(tableName);
          exportData.dados_completos[tableName] = {
            total_registros: allData.length,
            dados: allData
          };

          if (allData.length > 0) {
            exportData.informacoes.tabelas_com_dados++;
            exportData.informacoes.total_registros += allData.length;
            console.log(`     ✅ ${allData.length} registros exportados (estrutura inferida)`);
          } else {
            exportData.informacoes.tabelas_vazias++;
            console.log(`     ⚠️  Tabela vazia`);
          }
        } else {
          exportData.estrutura_completa[tableName] = {
            existe: false,
            erro: testError.message
          };
          exportData.dados_completos[tableName] = {
            total_registros: 0,
            dados: [],
            erro: testError.message
          };
          console.log(`     ❌ Erro: ${testError.message}`);
        }
      }

      console.log('');

    } catch (error) {
      console.error(`     ❌ Erro ao processar ${tableName}:`, error.message);
      exportData.estrutura_completa[tableName] = {
        existe: false,
        erro: error.message
      };
      exportData.dados_completos[tableName] = {
        total_registros: 0,
        dados: [],
        erro: error.message
      };
    }
  }

  // Tentar descobrir outras tabelas dinamicamente
  console.log('🔍 Procurando outras tabelas no banco...\n');
  
  try {
    // Listar views também (como afiliado_dashboard, financeiro_dashboard, etc)
    const views = [
      'afiliado_dashboard',
      'afiliado_ranking', 
      'financeiro_dashboard'
    ];

    for (const viewName of views) {
      if (!knownTables.includes(viewName)) {
        try {
          const allData = await getAllTableData(viewName);
          if (allData.length > 0 || !exportData.estrutura_completa[viewName]) {
            const structure = await getTableStructure(viewName);
            exportData.estrutura_completa[viewName] = {
              existe: true,
              tipo: 'view',
              colunas: structure?.columns || [],
              total_registros: allData.length
            };
            exportData.dados_completos[viewName] = {
              total_registros: allData.length,
              dados: allData
            };
            console.log(`  ✅ View ${viewName}: ${allData.length} registros`);
          }
        } catch (err) {
          // Ignorar
        }
      }
    }
  } catch (err) {
    console.log('  ⚠️  Não foi possível listar views automaticamente\n');
  }

  exportData.informacoes.total_tabelas = Object.keys(exportData.estrutura_completa).length;

  // Salvar arquivo JSON completo e organizado
  const fileName = 'supabase_export_completo_estruturado.json';
  fs.writeFileSync(fileName, JSON.stringify(exportData, null, 2));
  
  console.log(`\n✅ Exportação COMPLETA concluída!`);
  console.log(`📄 Arquivo salvo: ${fileName}`);
  console.log(`\n📊 Resumo:`);
  console.log(`   - Total de tabelas/views: ${exportData.informacoes.total_tabelas}`);
  console.log(`   - Tabelas com dados: ${exportData.informacoes.tabelas_com_dados}`);
  console.log(`   - Tabelas vazias: ${exportData.informacoes.tabelas_vazias}`);
  console.log(`   - Total de registros: ${exportData.informacoes.total_registros}`);
  
  // Verificar tabelas importantes
  console.log(`\n🔍 Verificações importantes:`);
  
  if (exportData.estrutura_completa['preco_adesao']?.existe) {
    console.log(`   ✅ Tabela 'preco_adesao' encontrada!`);
    console.log(`      Registros: ${exportData.dados_completos['preco_adesao']?.total_registros || 0}`);
  } else {
    console.log(`   ⚠️  Tabela 'preco_adesao' NÃO encontrada`);
  }

  if (exportData.estrutura_completa['afiliados']?.existe) {
    const afiliadosData = exportData.dados_completos['afiliados']?.dados || [];
    const comValorAdesao = afiliadosData.filter(a => a.valor_adesao && a.valor_adesao > 0);
    console.log(`   ✅ Tabela 'afiliados' encontrada!`);
    console.log(`      Total de afiliados: ${afiliadosData.length}`);
    console.log(`      Com valor_adesao definido: ${comValorAdesao.length}`);
    if (comValorAdesao.length > 0) {
      console.log(`      Valores encontrados: ${comValorAdesao.map(a => `R$ ${a.valor_adesao}`).join(', ')}`);
    }
  }

  console.log(`\n💾 Arquivo gerado com:`);
  console.log(`   - Estrutura completa de todas as tabelas`);
  console.log(`   - Todos os dados de todas as tabelas`);
  console.log(`   - Informações sobre colunas e tipos`);
  console.log(`   - Exemplos de registros`);
}

// Executar exportação
exportAllTables().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
