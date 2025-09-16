iew_dashboard_afiliado
Filter columns
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
nome_completo

No description

text	text		
email

No description

text	text		
numero_placas

No description

integer	int4		
receita_total

No description

numeric	numeric		
receita_pendente

No description

numeric	numeric		
total_clientes

No description

bigint	int8		
clientes_ativos

No description

bigint	int8		
comissao_total

No description

numeric	numeric		
comissao_recebida

No description

numeric	numeric		
comissao_pendente

No description

numeric	numeric		
total_conquistas

No description

bigint	int8		
ranking_atual

No description
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
cliente_id

No description

uuid	uuid		
cliente_nome

No description

text	text		
placa_veiculo

No description

character varying	varchar		
valor_contrato

No description

numeric	numeric		
porcentagem_comissao

No description

real	float4		
valor_comissao

No description

numeric	numeric		
mes_referencia

No description

date	date		
status

No description

USER-DEFINED	status_pagamento		
data_pagamento

No description

date	date		
data_formatada

No description

text	text		
valor_formatado

No description

text	text		
comissao_formatada

No description
Database Tables
view_performance_afiliado
Filter columns
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
cliente_id

No description

uuid	uuid		
cliente_nome

No description

text	text		
placa_veiculo

No description

character varying	varchar		
valor_contrato

No description

numeric	numeric		
porcentagem_comissao

No description

real	float4		
valor_comissao

No description

numeric	numeric		
mes_referencia

No description

date	date		
status

No description

USER-DEFINED	status_pagamento		
data_pagamento

No description

date	date		
data_formatada

No description

text	text		
valor_formatado

No description

text	text		
comissao_formatada

No description

text	text		
Database Tables
view_dashboard_afiliado
Filter columns
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
nome_completo

No description

text	text		
email

No description

text	text		
numero_placas

No description

integer	int4		
receita_total

No description

numeric	numeric		
receita_pendente

No description

numeric	numeric		
total_clientes

No description

bigint	int8		
clientes_ativos

No description

bigint	int8		
comissao_total

No description

numeric	numeric		
comissao_recebida

No description

numeric	numeric		
comissao_pendente

No description

numeric	numeric		
total_conquistas

No description

bigint	int8		
ranking_atual

No description

integer	int4
Database Tables
ranking_afiliados
Filter columns

New column
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
mes_referencia

No description

date	date		
posicao

No description

integer	int4		
total_vendas

No description

integer	int4		
total_comissao

No description

numeric	numeric		
criado_em

No description

timestamp with time zone	timestamptz		
atualizado_em

No description

timestamp with time zone	timestamptz
Database Tables
vw_negociacoes_avaliacoes
Filter columns
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
placa

No description

character varying	varchar		
ano_modelo

No description

character varying	varchar		
modelo

No description

character varying	varchar		
marca

No description

character varying	varchar		
afiliado_id

No description

uuid	uuid		
contato_id

No description

uuid	uuid		
status

No description

USER-DEFINED	status_negociacao		
valor_negociado

No description

numeric	numeric		
observacoes

No description

text	text		
criado_em

No description

timestamp with time zone	timestamptz		
atualizado_em

No description

timestamp with time zone	timestamptz		
status_avaliacao

No description

USER-DEFINED	status_pagamento		
valor_comissao

No description

numeric	numeric		
aprovado

No description

boolean	bool		
data_aprovacao

No description

timestamp with time zone	timestamptz
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
cliente_id

No description

uuid	uuid		
placa_veiculo

No description

character varying	varchar		
valor_contrato

No description

numeric	numeric		
porcentagem_comissao

No description

real	float4		
valor_comissao

No description

numeric	numeric		
mes_referencia

No description

date	date		
status

No description

USER-DEFINED	status_pagamento		
data_pagamento

No description

date	date		
criado_em

No description

timestamp with time zone	timestamptz		
atualizado_em

No description

timestamp with time zone	timestamptz
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
valor

No description

numeric	numeric		
descricao

No description

text	text		
mes_referencia

No description

date	date		
status

No description

USER-DEFINED	status_pagamento		
data

No description

date	date		
criado_em

No description

timestamp with time zone	timestamptz		
atualizado_em

No description

timestamp with time zone	timestamptz
Database Tables
pagamentos
Filter columns

New column
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
valor

No description

numeric	numeric		
descricao

No description

text	text		
mes_referencia

No description

date	date		
status

No description

USER-DEFINED	status_pagamento		
data

No description

date	date		
criado_em

No description

timestamp with time zone	timestamptz		
atualizado_em

No description

timestamp with time zone	timestamptz		
Database Tables
saques
Filter columns

New column
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
valor

No description

numeric	numeric		
metodo

No description

character varying	varchar		
dados_banco

No description

jsonb	jsonb		
status

No description

USER-DEFINED	status_pagamento		
observacao

No description

text	text		
criado_em

No description

timestamp with time zone	timestamptz		
processado_em

No description

timestamp with time zone	timestamptz		
Database Tables
metas_afiliados
Filter columns

New column
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
mes_referencia

No description

date	date		
valor_meta

No description

numeric	numeric		
vendas_meta

No description

integer	int4		
atingido

No description

boolean	bool		
criado_em

No description

timestamp with time zone	timestamptz		
Database Tables
atividades
Filter columns

New column
Name	Description	Data Type	Format	Nullable	
id

No description

uuid	uuid		
afiliado_id

No description

uuid	uuid		
titulo

No description

text	text		
descricao

No description

text	text		
prazo

No description

date	date		
prioridade

No description

USER-DEFINED	prioridade_atividade		
tipo

No description

USER-DEFINED	tipo_atividade		
status

No description

USER-DEFINED	status_atividade		
concluida_em

No description

timestamp with time zone	timestamptz		
criado_em

No description

timestamp with time zone	timestamptz		
