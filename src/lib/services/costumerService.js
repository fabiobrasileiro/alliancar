class CustomerService {
    constructor() {
        this.asaasApiKey = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE4ZTY5NmU1LTE4MjAtNDMyNS1hZjJiLThjMDJmOWFiY2Y0MTo6JGFhY2hfMDU3ZDlmNDAtZTgyYy00M2Q1LWIxMzktNjQ0ZTRkYzc1MTQ4";
        this.asaasBaseURL = 'https://sandbox.asaas.com/api/v3';
    }

    async createCustomer(customerData) {
        try {
            // Validação básica
            this.validateCustomerData(customerData);

            // Preparar dados para o Asaas
            const asaasData = this.formatAsaasData(customerData);

            // Criar no Asaas
            const asaasCustomer = await this.createAsaasCustomer(asaasData);

            // Salvar no nosso banco
            const localCustomer = await this.saveLocalCustomer(customerData, asaasCustomer);

            return {
                success: true,
                data: localCustomer
            };

        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    validateCustomerData(data) {
        const required = ['name', 'email', 'cpfCnpj'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            throw new Error(`Campos obrigatórios: ${missing.join(', ')}`);
        }

        // Validar CPF/CNPJ
        if (!this.isValidCpfCnpj(data.cpfCnpj)) {
            throw new Error('CPF/CNPJ inválido');
        }

        // Validar email
        if (!this.isValidEmail(data.email)) {
            throw new Error('Email inválido');
        }
    }

    isValidCpfCnpj(document) {
        const cleanDoc = document.replace(/\D/g, '');
        return cleanDoc.length === 11 || cleanDoc.length === 14;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    formatAsaasData(customerData) {
        return {
            name: customerData.name,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ''),
            mobilePhone: customerData.mobilePhone?.replace(/\D/g, ''),
            postalCode: customerData.postalCode?.replace(/\D/g, ''),
            address: customerData.address,
            addressNumber: customerData.addressNumber,
            province: customerData.province
        };
    }

    async createAsaasCustomer(asaasData) {
        const response = await fetch(`${this.asaasBaseURL}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': this.asaasApiKey
            },
            body: JSON.stringify(asaasData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
        }

        return await response.json();
    }

    async saveLocalCustomer(customerData, asaasCustomer) {
        // Aqui você salva no seu banco de dados
        // Vou simular por enquanto
        return {
            id: 'local_' + Date.now(),
            asaasCustomerId: asaasCustomer.id,
            name: customerData.name,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj,
            createdAt: new Date()
        };
    }
}

export const customerService = new CustomerService();