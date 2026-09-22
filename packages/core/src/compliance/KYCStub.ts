import { AntigravityError } from '../errors';

export interface KYCVerificationRequest {
  userId: string;
  documentType: 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE';
  documentFrontBase64: string;
  documentBackBase64?: string;
  selfieBase64: string;
}

export interface KYCVerificationResult {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  providerRef: string;
  rejectionReason?: string;
}

export interface KYCProvider {
  submitVerification(req: KYCVerificationRequest): Promise<KYCVerificationResult>;
  checkStatus(providerRef: string): Promise<KYCVerificationResult>;
}

export class StubKYCProvider implements KYCProvider {
  async submitVerification(_req: KYCVerificationRequest): Promise<KYCVerificationResult> {
    throw new AntigravityError(
      'NOT_IMPLEMENTED',
      'KYC provider is not configured. Real verification requires Sumsub/Onfido credentials.',
    );
  }

  async checkStatus(_providerRef: string): Promise<KYCVerificationResult> {
    throw new AntigravityError(
      'NOT_IMPLEMENTED',
      'KYC status check is not configured.',
    );
  }
}
