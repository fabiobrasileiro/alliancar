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
}

export interface FormState {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    mobilePhone: string;
    address: string;
    addressNumber: string;
    complement: string;
    province: string;
    postalCode: string;
    value: string;
    description: string;
    creditCard: CreditCard;
    creditCardHolderInfo: CreditCardHolderInfo;
    externalReference: string | undefined;
    vehicleInfo: VehicleInfo;
}

// types/insurance.ts
export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
}

export interface InsurancePlan {
  id: string;
  category: string;
  adesao: number;
  vehicle_range: string;
  min_value: number;
  max_value: number;
  monthly_payment: number;
  percentual_75: number;
  percentual_70: number;
  participation_min: string;
  vehicles: string[];
  coverages: {
    theft: number;
    collision: number;
    third_party: number;
    assistance: number;
    glass: number;
  };
}

export interface CalculatedCoverage {
  theft: number;
  collision: number;
  third_party: number;
  assistance: number;
  glass: number;
}

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
}

export interface FormState {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    mobilePhone: string;
    address: string;
    addressNumber: string;
    complement: string;
    province: string;
    postalCode: string;
    value: string;
    description: string;
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