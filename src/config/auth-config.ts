/**
 * @fileoverview Auth UI text configuration
 * @description Creates localized text maps for the auth components (sign in, sign up,
 * password reset) using i18next translations and Firebase error message mapping.
 */

import type { AuthTexts, AuthErrorTexts } from '@sudobility/components/auth';
import type { TFunction } from 'i18next';
import { getFirebaseErrorMessage } from '@sudobility/auth_lib';

/**
 * Create localized auth UI text map from i18next translations.
 * @param t - i18next translation function (should include "auth" namespace)
 * @returns Complete AuthTexts object for the auth components
 */
export function createAuthTexts(t: TFunction): AuthTexts {
  return {
    // Titles
    signInTitle: t('signInTitle'),
    signInWithEmail: t('signInWithEmail'),
    createAccount: t('createAccount'),
    resetPassword: t('resetPassword'),

    // Buttons
    signIn: t('signIn'),
    signUp: t('signUp'),
    logout: t('logout'),
    login: t('login'),
    continueWithGoogle: t('continueWithGoogle'),
    continueWithApple: 'Continue with Apple',
    continueWithEmail: t('continueWithEmail'),
    sendResetLink: t('sendResetLink'),
    backToSignIn: t('backToSignIn'),
    close: t('close'),

    // Labels
    email: t('email'),
    password: t('password'),
    confirmPassword: t('confirmPassword'),
    displayName: t('displayName'),

    // Placeholders
    emailPlaceholder: t('emailPlaceholder'),
    passwordPlaceholder: t('passwordPlaceholder'),
    confirmPasswordPlaceholder: t('confirmPasswordPlaceholder'),
    displayNamePlaceholder: t('displayNamePlaceholder'),

    // Links
    forgotPassword: t('forgotPassword'),
    noAccount: t('noAccount'),
    haveAccount: t('haveAccount'),
    or: t('or'),

    // Messages
    resetEmailSent: t('resetEmailSent'),
    resetEmailSentDesc: t('resetEmailSentDesc'),
    passwordMismatch: t('passwordMismatch'),
    passwordTooShort: t('passwordTooShort'),
    loading: t('loading'),
  };
}

/**
 * Create auth error text map using Firebase error message mappings.
 * Maps Firebase auth error codes to user-friendly error messages.
 * @returns Complete AuthErrorTexts object for the auth components
 */
export function createAuthErrorTexts(): AuthErrorTexts {
  return {
    'auth/user-not-found': getFirebaseErrorMessage('auth/user-not-found'),
    'auth/wrong-password': getFirebaseErrorMessage('auth/wrong-password'),
    'auth/invalid-email': getFirebaseErrorMessage('auth/invalid-email'),
    'auth/invalid-credential': getFirebaseErrorMessage('auth/invalid-credential'),
    'auth/email-already-in-use': getFirebaseErrorMessage('auth/email-already-in-use'),
    'auth/weak-password': getFirebaseErrorMessage('auth/weak-password'),
    'auth/too-many-requests': getFirebaseErrorMessage('auth/too-many-requests'),
    'auth/network-request-failed': getFirebaseErrorMessage('auth/network-request-failed'),
    'auth/popup-closed-by-user': getFirebaseErrorMessage('auth/popup-closed-by-user'),
    'auth/popup-blocked': getFirebaseErrorMessage('auth/popup-blocked'),
    'auth/account-exists-with-different-credential': getFirebaseErrorMessage(
      'auth/account-exists-with-different-credential'
    ),
    'auth/operation-not-allowed': getFirebaseErrorMessage('auth/operation-not-allowed'),
    default: getFirebaseErrorMessage(''),
  };
}
