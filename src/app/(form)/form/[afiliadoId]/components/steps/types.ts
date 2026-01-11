export interface CreditCard {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
}

export interface CreditCardHolderInfo {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement: string;
    phone: string;
    mobilePhone: string;
}

export interface VehicleInfo {
    plate: string;
    vehicleType: string;
    brand: string;
    year: string;
    model: string;
    state: string;
    city: string;
    isTaxiApp: boolean;
    observations: string;
    category: string; // Categoria do carro (id da vehicle_categories)
    fipeValue: string; // Valor do carro (FIPE) - vehicle_range
    privateUse: boolean; // Uso particular
}

export interface FormState {
    name: string;
    email: string;
    cpfCnpj: string;
    whatsApp: string;
    street: string;
    addressNumber: string;
    complement: string;
    province: string;
    postalCode: string;
    value: string;
    description: string;
    paymentMethod: string;
    creditCard: CreditCard;
    creditCardHolderInfo: CreditCardHolderInfo;
    externalReference: string | undefined;
    vehicleInfo: VehicleInfo;
}

export interface InsurancePlan {
    id: string;
    category_name: string;
    vehicle_range: string;
    adesao: number;
    monthly_payment: number;
    percentual_7_5: number;
    percentual_70: number;
    participation_min: string;
    vehicles: string[];
}

export interface OrderValues {
    monthly: number;
    membership: number;
    services: number;
    subtotal: number;
    total: number;
}

export interface OptionalService {
    id: string;
    name: string;
    price: number;
    included: boolean;
    description?: string;
}