import { API_BASE_URL } from './index';

export interface CreateKycVerificationData {
  verificationType: 'individual' | 'company';
  businessType: 'individual' | 'company';
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    idNumber?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  businessInfo?: {
    companyName?: string;
    registrationNumber?: string;
    taxId?: string;
    businessEstablishedDate?: string;
    businessDescription?: string;
    website?: string;
    mcc?: string;
    businessAddress?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  bankInfo?: {
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    accountType?: 'checking' | 'savings';
    bankName?: string;
  };
  documents?: Array<{
    documentType: string;
    fileName: string;
    fileUrl?: string;
    base64Data?: string;
  }>;
  stripeAccountId?: string;
  skipOnboarding?: boolean;
}

export interface UploadFileData {
  file: string; // base64 string
  fileName: string;
  mimeType: string;
  purpose: string;
}

export interface UploadKycDocumentData {
  documentType: string;
  fileName: string;
  fileUrl?: string;
  base64Data?: string;
  description?: string;
  isPrimaryDocument?: boolean;
  expiresAt?: string;
}

// KYC Verification API calls
export async function createKycVerification(data: CreateKycVerificationData) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create KYC verification');
  }

  return response.json();
}

export async function getMyKycVerifications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/kyc-verification/my-verifications?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch KYC verifications');
  }

  return response.json();
}

export async function getKycVerification(verificationId: string) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch KYC verification');
  }

  return response.json();
}

export async function updateKycVerification(verificationId: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update KYC verification');
  }

  return response.json();
}

export async function uploadKycDocument(verificationId: string, data: UploadKycDocumentData) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload document');
  }

  return response.json();
}

export async function submitKycForReview(verificationId: string) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}/submit-for-review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit for review');
  }

  return response.json();
}

export async function cancelKycVerification(verificationId: string) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel verification');
  }

  return response.json();
}

export async function createKycOnboardingLink(verificationId: string) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}/onboarding-link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create onboarding link');
  }

  return response.json();
}

export async function syncKycStatus(verificationId: string) {
  const response = await fetch(`${API_BASE_URL}/kyc-verification/${verificationId}/sync-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync status');
  }

  return response.json();
}

// Legacy Stripe Connect API calls
export async function createStripeConnectAccount(shopId?: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/create-account`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create Stripe Connect account');
  }

  return response.json();
}

export async function createOnboardingLink(shopId?: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/onboarding-link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create onboarding link');
  }

  return response.json();
}

export async function createLoginLink(shopId?: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/login-link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create login link');
  }

  return response.json();
}

export async function getAccountDetails(shopId?: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/account-details`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch account details');
  }

  return response.json();
}

export async function checkStripeAccountStatus(accountId: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/check/${accountId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to check account status');
  }

  return response.json();
}

export async function updateStripeStatus(shopId?: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/update-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update status');
  }

  return response.json();
}

export async function deleteStripeAccount(shopId?: string) {
  const response = await fetch(`${API_BASE_URL}/stripe-connect/delete-account`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete account');
  }

  return response.json();
}

// File upload utility
export async function uploadFile(data: UploadFileData) {
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload file');
  }

  return response.json();
}

// KYC status utilities
export const KYC_STATUSES = {
  NONE: 'none',
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  ADDITIONAL_INFORMATION_REQUIRED: 'additional_information_required',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESTRICTED: 'restricted',
} as const;

export const KYC_DOCUMENT_TYPES = {
  ID_FRONT: 'id_front',
  ID_BACK: 'id_back',
  PASSPORT: 'passport',
  DRIVING_LICENSE_FRONT: 'driving_license_front',
  DRIVING_LICENSE_BACK: 'driving_license_back',
  PROOF_OF_ADDRESS: 'proof_of_address',
  BUSINESS_REGISTRATION: 'business_registration',
  TAX_DOCUMENT: 'tax_document',
  BANK_STATEMENT: 'bank_statement',
  ARTICLES_OF_ASSOCIATION: 'articles_of_association',
  SHAREHOLDER_REGISTRY: 'shareholder_registry',
  OWNERSHIP_DECLARATION: 'ownership_declaration',
  ADDITIONAL_DOCUMENT: 'additional_document',
} as const;

export function getKycStatusColor(status: string): string {
  switch (status) {
    case KYC_STATUSES.APPROVED:
      return 'text-green-600 bg-green-50';
    case KYC_STATUSES.IN_REVIEW:
      return 'text-blue-600 bg-blue-50';
    case KYC_STATUSES.ADDITIONAL_INFORMATION_REQUIRED:
      return 'text-yellow-600 bg-yellow-50';
    case KYC_STATUSES.REJECTED:
    case KYC_STATUSES.RESTRICTED:
      return 'text-red-600 bg-red-50';
    case KYC_STATUSES.PENDING:
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getKycStatusLabel(status: string): string {
  switch (status) {
    case KYC_STATUSES.APPROVED:
      return 'Approved';
    case KYC_STATUSES.IN_REVIEW:
      return 'In Review';
    case KYC_STATUSES.ADDITIONAL_INFORMATION_REQUIRED:
      return 'Additional Information Required';
    case KYC_STATUSES.REJECTED:
      return 'Rejected';
    case KYC_STATUSES.RESTRICTED:
      return 'Restricted';
    case KYC_STATUSES.PENDING:
      return 'Pending';
    default:
      return 'Not Started';
  }
}

export function getKycStatusDescription(status: string): string {
  switch (status) {
    case KYC_STATUSES.APPROVED:
      return 'Your account has been fully verified and can receive payments.';
    case KYC_STATUSES.IN_REVIEW:
      return 'Your verification is currently under review. This typically takes 1-3 business days.';
    case KYC_STATUSES.ADDITIONAL_INFORMATION_REQUIRED:
      return 'We need some additional information to complete your verification.';
    case KYC_STATUSES.REJECTED:
      return 'Your verification could not be completed. Please review the feedback and try again.';
    case KYC_STATUSES.RESTRICTED:
      return 'Your account has restrictions. Please contact support for assistance.';
    case KYC_STATUSES.PENDING:
      return 'Your verification process has started but is not yet submitted for review.';
    default:
      return 'Start your verification process to begin receiving payments.';
  }
}

export function getRequiredDocumentsForType(verificationType: 'individual' | 'company'): string[] {
  const baseDocuments = [
    KYC_DOCUMENT_TYPES.ID_FRONT,
    KYC_DOCUMENT_TYPES.ID_BACK,
    KYC_DOCUMENT_TYPES.PROOF_OF_ADDRESS,
  ];

  if (verificationType === 'company') {
    baseDocuments.push(
      KYC_DOCUMENT_TYPES.BUSINESS_REGISTRATION,
      KYC_DOCUMENT_TYPES.TAX_DOCUMENT
    );
  }

  return baseDocuments;
}