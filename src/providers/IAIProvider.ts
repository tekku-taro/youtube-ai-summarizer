import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';

export interface IAIProvider {
  generate(request: GenerateRequest): Promise<GenerateResponse>;
  getModels(): Promise<ModelListResult>;
}
