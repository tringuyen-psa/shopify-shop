'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    CloudArrowUpIcon,
    UserIcon,
    BuildingOfficeIcon,
    CreditCardIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

import { useShop } from '@/hooks/useShop';
import { uploadFile, createKycVerification, uploadKycDocument } from '@/libstripe-connect';

interface KycStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    completed: boolean;
    current: boolean;
}

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    idNumber: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}

interface BusinessInfo {
    companyName: string;
    registrationNumber: string;
    taxId: string;
    businessEstablishedDate: string;
    businessDescription: string;
    website?: string;
    mcc?: string;
    businessAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}

interface BankInfo {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
    accountType: 'checking' | 'savings';
    bankName?: string;
}

interface UploadedDocument {
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
}

export default function KycOnboardingFlow() {
    const { t } = useTranslation();
    const router = useRouter();
    const { shop } = useShop();

    const [currentStep, setCurrentStep] = useState(0);
    const [verificationType, setVerificationType] = useState<'individual' | 'company'>('individual');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);

    // Form data
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        firstName: '',
        lastName: '',
        email: shop?.email || '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
        idNumber: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
        },
    });

    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        companyName: '',
        registrationNumber: '',
        taxId: '',
        businessEstablishedDate: '',
        businessDescription: '',
        website: shop?.website || '',
        mcc: '',
        businessAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
        },
    });

    const [bankInfo, setBankInfo] = useState<BankInfo>({
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        accountType: 'checking',
        bankName: '',
    });

    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

    // KYC steps
    const [kycSteps, setKycSteps] = useState<KycStep[]>([
        {
            id: 'type',
            title: t('kyc.steps.type.title', 'Account Type'),
            description: t('kyc.steps.type.description', 'Choose your account type'),
            icon: UserIcon,
            completed: false,
            current: true,
        },
        {
            id: 'personal',
            title: t('kyc.steps.personal.title', 'Personal Information'),
            description: t('kyc.steps.personal.description', 'Provide your personal details'),
            icon: UserIcon,
            completed: false,
            current: false,
        },
        {
            id: 'business',
            title: t('kyc.steps.business.title', 'Business Information'),
            description: t('kyc.steps.business.description', 'Provide business details'),
            icon: BuildingOfficeIcon,
            completed: false,
            current: false,
        },
        {
            id: 'documents',
            title: t('kyc.steps.documents.title', 'Identity Documents'),
            description: t('kyc.steps.documents.description', 'Upload verification documents'),
            icon: DocumentTextIcon,
            completed: false,
            current: false,
        },
        {
            id: 'bank',
            title: t('kyc.steps.bank.title', 'Bank Information'),
            description: t('kyc.steps.bank.description', 'Add your bank account'),
            icon: CreditCardIcon,
            completed: false,
            current: false,
        },
        {
            id: 'review',
            title: t('kyc.steps.review.title', 'Review & Submit'),
            description: t('kyc.steps.review.description', 'Review and submit your application'),
            icon: ShieldCheckIcon,
            completed: false,
            current: false,
        },
    ]);

    // Required documents based on verification type
    const getRequiredDocuments = () => {
        const baseDocuments = [
            { id: 'id_front', name: t('kyc.documents.idFront', 'ID Document (Front)'), required: true },
            { id: 'id_back', name: t('kyc.documents.idBack', 'ID Document (Back)'), required: true },
            { id: 'proof_of_address', name: t('kyc.documents.proofOfAddress', 'Proof of Address'), required: true },
        ];

        if (verificationType === 'company') {
            baseDocuments.push(
                { id: 'business_registration', name: t('kyc.documents.businessRegistration', 'Business Registration'), required: true },
                { id: 'tax_document', name: t('kyc.documents.taxDocument', 'Tax Document'), required: true }
            );
        }

        return baseDocuments;
    };

    // Update step completion status
    const updateStepStatus = (stepId: string, completed: boolean) => {
        setKycSteps(prev => prev.map(step =>
            step.id === stepId ? { ...step, completed } : step
        ));
    };

    // Navigate to next step
    const nextStep = async () => {
        if (currentStep < kycSteps.length - 1) {
            const currentStepData = kycSteps[currentStep];

            // Validate current step
            if (await validateStep(currentStepData.id)) {
                updateStepStatus(currentStepData.id, true);
                setCurrentStep(prev => prev + 1);
                setKycSteps(prev => prev.map((step, index) => ({
                    ...step,
                    current: index === currentStep + 1
                })));
            }
        }
    };

    // Navigate to previous step
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setKycSteps(prev => prev.map((step, index) => ({
                ...step,
                current: index === currentStep - 1
            })));
        }
    };

    // Validate current step
    const validateStep = async (stepId: string): Promise<boolean> => {
        switch (stepId) {
            case 'type':
                return true; // Type is always selected

            case 'personal':
                return validatePersonalInfo();

            case 'business':
                return verificationType === 'individual' || validateBusinessInfo();

            case 'documents':
                return validateDocuments();

            case 'bank':
                return validateBankInfo();

            case 'review':
                return true;

            default:
                return true;
        }
    };

    const validatePersonalInfo = (): boolean => {
        const { firstName, lastName, email, phone, dateOfBirth, nationality, address } = personalInfo;

        if (!firstName || !lastName || !email || !phone || !dateOfBirth || !nationality) {
            toast.error(t('kyc.validation.personal.required', 'Please fill in all required personal fields'));
            return false;
        }

        if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.country) {
            toast.error(t('kyc.validation.address.required', 'Please fill in all address fields'));
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error(t('kyc.validation.email.invalid', 'Please enter a valid email address'));
            return false;
        }

        return true;
    };

    const validateBusinessInfo = (): boolean => {
        const { companyName, registrationNumber, taxId, businessAddress } = businessInfo;

        if (!companyName || !registrationNumber || !taxId) {
            toast.error(t('kyc.validation.business.required', 'Please fill in all required business fields'));
            return false;
        }

        if (!businessAddress.line1 || !businessAddress.city || !businessAddress.state ||
            !businessAddress.postalCode || !businessAddress.country) {
            toast.error(t('kyc.validation.businessAddress.required', 'Please fill in all business address fields'));
            return false;
        }

        return true;
    };

    const validateDocuments = (): boolean => {
        const requiredDocs = getRequiredDocuments().filter(doc => doc.required);
        const uploadedDocTypes = uploadedDocuments.map(doc => doc.type);

        const missingDocs = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc.id));

        if (missingDocs.length > 0) {
            toast.error(
                t('kyc.validation.documents.missing', 'Please upload all required documents: {{docs}}', {
                    docs: missingDocs.map(doc => doc.name).join(', ')
                })
            );
            return false;
        }

        return true;
    };

    const validateBankInfo = (): boolean => {
        const { accountNumber, routingNumber, accountHolderName } = bankInfo;

        if (!accountNumber || !routingNumber || !accountHolderName) {
            toast.error(t('kyc.validation.bank.required', 'Please fill in all bank information fields'));
            return false;
        }

        // Basic routing number validation (US)
        if (routingNumber.length !== 9 || !/^\d+$/.test(routingNumber)) {
            toast.error(t('kyc.validation.routingNumber.invalid', 'Please enter a valid 9-digit routing number'));
            return false;
        }

        return true;
    };

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error(t('kyc.validation.fileSize', 'File size must be less than 10MB'));
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error(t('kyc.validation.fileType', 'Only JPG, PNG, and PDF files are allowed'));
            return;
        }

        try {
            setIsSubmitting(true);

            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Upload file
            const uploadResult = await uploadFile({
                file: base64,
                fileName: file.name,
                mimeType: file.type,
                purpose: 'identity_document',
            });

            // Add to uploaded documents
            const newDocument: UploadedDocument = {
                type: documentType,
                fileName: file.name,
                fileUrl: uploadResult.url,
                fileSize: file.size,
                uploadedAt: new Date(),
            };

            setUploadedDocuments(prev => [
                ...prev.filter(doc => doc.type !== documentType),
                newDocument
            ]);

            toast.success(t('kyc.documents.uploadSuccess', 'Document uploaded successfully'));
        } catch (error) {
            console.error('File upload error:', error);
            toast.error(t('kyc.documents.uploadError', 'Failed to upload document'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit KYC verification
    const submitKycVerification = async () => {
        try {
            setIsSubmitting(true);

            const kycData: any = {
                verificationType: verificationType,
                businessType: verificationType === 'company' ? 'company' : 'individual',
                personalInfo: {
                    ...personalInfo,
                    address: personalInfo.address,
                },
                documents: uploadedDocuments.map(doc => ({
                    documentType: doc.type,
                    fileName: doc.fileName,
                    fileUrl: doc.fileUrl,
                    base64Data: doc.fileUrl, // In real implementation, this would be the base64 data
                })),
            };

            if (verificationType === 'company') {
                kycData.businessInfo = {
                    ...businessInfo,
                    businessAddress: businessInfo.businessAddress,
                };
            }

            kycData.bankInfo = bankInfo;

            const result = await createKycVerification(kycData);
            setVerificationId(result.data.verificationId);

            // Upload documents to KYC verification
            if (result.data.verificationId) {
                for (const doc of uploadedDocuments) {
                    await uploadKycDocument(result.data.verificationId, {
                        documentType: doc.type,
                        fileName: doc.fileName,
                        fileUrl: doc.fileUrl,
                    });
                }
            }

            toast.success(t('kyc.submission.success', 'KYC verification submitted successfully!'));

            // Redirect to onboarding link or status page
            if (result.data.stripeAccountId) {
                router.push(`/dashboard/shop/kyc/onboarding?verificationId=${result.data.verificationId}`);
            } else {
                router.push(`/dashboard/shop/kyc/status?verificationId=${result.data.verificationId}`);
            }
        } catch (error) {
            console.error('KYC submission error:', error);
            toast.error(t('kyc.submission.error', 'Failed to submit KYC verification'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render current step content
    const renderStepContent = () => {
        const currentStepData = kycSteps[currentStep];

        switch (currentStepData.id) {
            case 'type':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('kyc.typeSelection.title', 'Choose Your Account Type')}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {t('kyc.typeSelection.description', 'Select the type of account you want to create')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setVerificationType('individual')}
                                className={`p-6 border-2 rounded-lg text-left transition-all ${verificationType === 'individual'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <UserIcon className="h-12 w-12 text-blue-500 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('kyc.types.individual.title', 'Individual Account')}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {t('kyc.types.individual.description', 'For individual sellers and freelancers')}
                                </p>
                            </button>

                            <button
                                onClick={() => setVerificationType('company')}
                                className={`p-6 border-2 rounded-lg text-left transition-all ${verificationType === 'company'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <BuildingOfficeIcon className="h-12 w-12 text-blue-500 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('kyc.types.company.title', 'Company Account')}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {t('kyc.types.company.description', 'For registered businesses and companies')}
                                </p>
                            </button>
                        </div>
                    </div>
                );

            case 'personal':
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('kyc.personalInfo.title', 'Personal Information')}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {t('kyc.personalInfo.description', 'Please provide your personal details')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.firstName', 'First Name')} *
                                </label>
                                <input
                                    type="text"
                                    value={personalInfo.firstName}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.lastName', 'Last Name')} *
                                </label>
                                <input
                                    type="text"
                                    value={personalInfo.lastName}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.email', 'Email')} *
                                </label>
                                <input
                                    type="email"
                                    value={personalInfo.email}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.phone', 'Phone Number')} *
                                </label>
                                <input
                                    type="tel"
                                    value={personalInfo.phone}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.dateOfBirth', 'Date of Birth')} *
                                </label>
                                <input
                                    type="date"
                                    value={personalInfo.dateOfBirth}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.nationality', 'Nationality')} *
                                </label>
                                <input
                                    type="text"
                                    value={personalInfo.nationality}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, nationality: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.personalInfo.idNumber', 'ID Number')} *
                                </label>
                                <input
                                    type="text"
                                    value={personalInfo.idNumber}
                                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, idNumber: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {t('kyc.personalInfo.address.title', 'Residential Address')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.personalInfo.address.line1', 'Address Line 1')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.address.line1}
                                        onChange={(e) => setPersonalInfo(prev => ({
                                            ...prev,
                                            address: { ...prev.address, line1: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.personalInfo.address.line2', 'Address Line 2')}
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.address.line2}
                                        onChange={(e) => setPersonalInfo(prev => ({
                                            ...prev,
                                            address: { ...prev.address, line2: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.personalInfo.address.city', 'City')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.address.city}
                                        onChange={(e) => setPersonalInfo(prev => ({
                                            ...prev,
                                            address: { ...prev.address, city: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.personalInfo.address.state', 'State/Province')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.address.state}
                                        onChange={(e) => setPersonalInfo(prev => ({
                                            ...prev,
                                            address: { ...prev.address, state: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.personalInfo.address.postalCode', 'Postal Code')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.address.postalCode}
                                        onChange={(e) => setPersonalInfo(prev => ({
                                            ...prev,
                                            address: { ...prev.address, postalCode: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.personalInfo.address.country', 'Country')} *
                                    </label>
                                    <select
                                        value={personalInfo.address.country}
                                        onChange={(e) => setPersonalInfo(prev => ({
                                            ...prev,
                                            address: { ...prev.address, country: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="AU">Australia</option>
                                        {/* Add more countries as needed */}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'business':
                if (verificationType !== 'company') {
                    return nextStep(); // Skip business step for individuals
                }

                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('kyc.businessInfo.title', 'Business Information')}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {t('kyc.businessInfo.description', 'Please provide your business details')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.companyName', 'Company Name')} *
                                </label>
                                <input
                                    type="text"
                                    value={businessInfo.companyName}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.registrationNumber', 'Registration Number')} *
                                </label>
                                <input
                                    type="text"
                                    value={businessInfo.registrationNumber}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.taxId', 'Tax ID')} *
                                </label>
                                <input
                                    type="text"
                                    value={businessInfo.taxId}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, taxId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.establishedDate', 'Business Established Date')}
                                </label>
                                <input
                                    type="date"
                                    value={businessInfo.businessEstablishedDate}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessEstablishedDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.description', 'Business Description')}
                                </label>
                                <textarea
                                    value={businessInfo.businessDescription}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessDescription: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.website', 'Website')}
                                </label>
                                <input
                                    type="url"
                                    value={businessInfo.website}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.businessInfo.mcc', 'Merchant Category Code')}
                                </label>
                                <input
                                    type="text"
                                    value={businessInfo.mcc}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, mcc: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 5399"
                                />
                            </div>
                        </div>

                        {/* Business Address */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {t('kyc.businessInfo.address.title', 'Business Address')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.businessInfo.address.line1', 'Address Line 1')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={businessInfo.businessAddress.line1}
                                        onChange={(e) => setBusinessInfo(prev => ({
                                            ...prev,
                                            businessAddress: { ...prev.businessAddress, line1: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.businessInfo.address.city', 'City')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={businessInfo.businessAddress.city}
                                        onChange={(e) => setBusinessInfo(prev => ({
                                            ...prev,
                                            businessAddress: { ...prev.businessAddress, city: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.businessInfo.address.state', 'State/Province')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={businessInfo.businessAddress.state}
                                        onChange={(e) => setBusinessInfo(prev => ({
                                            ...prev,
                                            businessAddress: { ...prev.businessAddress, state: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.businessInfo.address.postalCode', 'Postal Code')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={businessInfo.businessAddress.postalCode}
                                        onChange={(e) => setBusinessInfo(prev => ({
                                            ...prev,
                                            businessAddress: { ...prev.businessAddress, postalCode: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('kyc.businessInfo.address.country', 'Country')} *
                                    </label>
                                    <select
                                        value={businessInfo.businessAddress.country}
                                        onChange={(e) => setBusinessInfo(prev => ({
                                            ...prev,
                                            businessAddress: { ...prev.businessAddress, country: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="AU">Australia</option>
                                        {/* Add more countries as needed */}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'documents':
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('kyc.documents.title', 'Identity Documents')}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {t('kyc.documents.description', 'Please upload the required verification documents')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {getRequiredDocuments().map((doc) => {
                                const uploadedDoc = uploadedDocuments.find(d => d.type === doc.id);

                                return (
                                    <div key={doc.id} className="border rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                                                <div>
                                                    <h3 className="font-medium">{doc.name}</h3>
                                                    {doc.required && (
                                                        <span className="text-sm text-red-600">
                                                            {t('kyc.documents.required', 'Required')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {uploadedDoc && (
                                                <div className="flex items-center space-x-2 text-green-600">
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                    <span className="text-sm">{uploadedDoc.fileName}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {uploadedDoc
                                                    ? t('kyc.documents.replace', 'Replace document')
                                                    : t('kyc.documents.upload', 'Upload document')
                                                }
                                            </label>

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={(e) => handleFileUpload(e, doc.id)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />

                                            <p className="mt-1 text-xs text-gray-500">
                                                {t('kyc.documents.fileFormats', 'Accepted formats: JPG, PNG, PDF. Max size: 10MB')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        {t('kyc.documents.securityNote', 'Security Note')}
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>{t('kyc.documents.encryption', 'All documents are encrypted and securely transmitted to Stripe for verification.')}</p>
                                        <p className="mt-1">{t('kyc.documents.privacy', 'Your information is protected by bank-level security standards.')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bank':
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('kyc.bankInfo.title', 'Bank Information')}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {t('kyc.bankInfo.description', 'Add your bank account for receiving payments')}
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        {t('kyc.bankInfo.securityNote', 'Secure Bank Information')}
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>{t('kyc.bankInfo.encryption', 'Your bank information is encrypted and securely stored. We use bank-level security to protect your data.')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.bankInfo.accountHolderName', 'Account Holder Name')} *
                                </label>
                                <input
                                    type="text"
                                    value={bankInfo.accountHolderName}
                                    onChange={(e) => setBankInfo(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.bankInfo.accountType', 'Account Type')} *
                                </label>
                                <select
                                    value={bankInfo.accountType}
                                    onChange={(e) => setBankInfo(prev => ({
                                        ...prev,
                                        accountType: e.target.value as 'checking' | 'savings'
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="checking">{t('kyc.bankAccountTypes.checking', 'Checking')}</option>
                                    <option value="savings">{t('kyc.bankAccountTypes.savings', 'Savings')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.bankInfo.accountNumber', 'Account Number')} *
                                </label>
                                <input
                                    type="text"
                                    value={bankInfo.accountNumber}
                                    onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.bankInfo.routingNumber', 'Routing Number')} *
                                </label>
                                <input
                                    type="text"
                                    value={bankInfo.routingNumber}
                                    onChange={(e) => setBankInfo(prev => ({ ...prev, routingNumber: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="9-digit routing number"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('kyc.bankInfo.bankName', 'Bank Name')}
                                </label>
                                <input
                                    type="text"
                                    value={bankInfo.bankName}
                                    onChange={(e) => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'review':
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('kyc.review.title', 'Review & Submit')}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {t('kyc.review.description', 'Please review your information before submitting')}
                            </p>
                        </div>

                        {/* Review sections */}
                        <div className="space-y-6">
                            {/* Personal Info Review */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    {t('kyc.review.personalInfo', 'Personal Information')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">{t('kyc.personalInfo.name', 'Name')}:</span>
                                        <p>{personalInfo.firstName} {personalInfo.lastName}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('kyc.personalInfo.email', 'Email')}:</span>
                                        <p>{personalInfo.email}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('kyc.personalInfo.phone', 'Phone')}:</span>
                                        <p>{personalInfo.phone}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('kyc.personalInfo.dateOfBirth', 'Date of Birth')}:</span>
                                        <p>{personalInfo.dateOfBirth}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Info Review (if company) */}
                            {verificationType === 'company' && (
                                <div className="border rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">
                                        {t('kyc.review.businessInfo', 'Business Information')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">{t('kyc.businessInfo.companyName', 'Company Name')}:</span>
                                            <p>{businessInfo.companyName}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">{t('kyc.businessInfo.registrationNumber', 'Registration Number')}:</span>
                                            <p>{businessInfo.registrationNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Documents Review */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    {t('kyc.review.documents', 'Documents')}
                                </h3>
                                <div className="space-y-2">
                                    {uploadedDocuments.map((doc, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            <span>{doc.fileName}</span>
                                            <span className="text-gray-500">({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    ))}
                                    {uploadedDocuments.length === 0 && (
                                        <p className="text-sm text-gray-500">{t('kyc.review.noDocuments', 'No documents uploaded')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Bank Info Review */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    {t('kyc.review.bankInfo', 'Bank Information')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">{t('kyc.bankInfo.accountHolderName', 'Account Holder')}:</span>
                                        <p>{bankInfo.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('kyc.bankInfo.accountType', 'Account Type')}:</span>
                                        <p>{t(`kyc.bankAccountTypes.${bankInfo.accountType}`, bankInfo.accountType)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('kyc.bankInfo.routingNumber', 'Routing Number')}:</span>
                                        <p>{bankInfo.routingNumber}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('kyc.bankInfo.accountNumber', 'Account Number')}:</span>
                                        <p>{'•'.repeat(bankInfo.accountNumber.length - 4)}{bankInfo.accountNumber.slice(-4)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="bg-gray-50 border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {t('kyc.review.terms', 'Terms and Conditions')}
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>
                                    {t('kyc.review.termsText', 'By submitting this application, you agree to:')}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{t('kyc.review.term1', 'Provide accurate and truthful information')}</li>
                                    <li>{t('kyc.review.term2', 'Authorize us to verify your identity and business information')}</li>
                                    <li>{t('kyc.review.term3', 'Comply with all applicable laws and regulations')}</li>
                                    <li>{t('kyc.review.term4', 'Allow Stripe to process payments on your behalf')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Progress Steps */}
            <div className="mb-8">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center justify-center">
                        {kycSteps.map((step, stepIdx) => (
                            <li
                                key={step.id}
                                className={cn(
                                    stepIdx !== kycSteps.length - 1 ? 'pr-8 sm:pr-20' : '',
                                    'relative'
                                )}
                            >
                                {step.completed ? (
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-green-600" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                )}

                                <div className="relative flex items-center justify-center">
                                    {step.completed ? (
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                                            <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                                        </span>
                                    ) : step.current ? (
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-blue-600">
                                            {stepIdx + 1}
                                        </span>
                                    ) : (
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500">
                                            {stepIdx + 1}
                                        </span>
                                    )}

                                    <div className="absolute mt-8 w-32 text-center">
                                        <step.icon
                                            className={cn(
                                                'mx-auto h-6 w-6',
                                                step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-400'
                                            )}
                                            aria-hidden="true"
                                        />
                                        <p className={cn(
                                            'mt-2 text-sm font-medium',
                                            step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                                        )}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* Step Content */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-8">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="border-t px-6 py-4 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={cn(
                            'flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                            currentStep === 0 && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        {t('common.previous', 'Previous')}
                    </button>

                    {currentStep === kycSteps.length - 1 ? (
                        <button
                            onClick={submitKycVerification}
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {t('kyc.submitting', 'Submitting...')}
                                </>
                            ) : (
                                <>
                                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                                    {t('kyc.submit', 'Submit Application')}
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            disabled={isSubmitting}
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {t('kyc.validating', 'Validating...')}
                                </>
                            ) : (
                                <>
                                    {t('common.next', 'Next')}
                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}