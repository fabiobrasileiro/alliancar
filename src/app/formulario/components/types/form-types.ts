// src/types/form-types.ts
export interface FormData {
  pwrClntNm: string;
  pwrCltPhn: string;
  pwrClntMl: string;
  pwrVhclPlt: string;
  pwrVhclTyp: string;
  pwrVhclBrnch: string;
  pwrVhclYr: string;
  pwrVhclMdl: string;
  pwrStt: string;
  pwrCt: string;
  taxiApp: boolean;
  pwrObs: string;
  pwrCnsltnt: string;
  pwrCmpnHsh: string;
  pwrFrmCode: string;
  pwrPplnClmn: string;
  pwrLdSrc: string;
}

export interface VehicleBrand {
  id: number;
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  brand_id: number;
}

export interface State {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
}
