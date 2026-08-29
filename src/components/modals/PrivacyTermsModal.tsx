import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'privacy' | 'terms';
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
        {mode === 'privacy' ? (
          <>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Your Privacy at TypeForge
            </h4>
            <p>
              TypeForge respects your privacy. When using the application anonymously, your typing session results and preferences are stored locally on your device via standard browser storage.
            </p>
            <p>
              When you choose to sign in with Google:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>We receive your Google public profile (display name, email address, and avatar image).</li>
              <li>Your completed test statistics, typing speed (WPM), accuracy, and streak dates are stored in Firebase Cloud Firestore to provide synchronization across your devices.</li>
              <li>We never store passwords or sell personal information to third parties.</li>
            </ul>
            <p>
              You can export or permanently delete your stored profile and test history at any time from your Profile page.
            </p>
          </>
        ) : (
          <>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Terms of Service
            </h4>
            <p>
              By accessing and using TypeForge, you agree to use the platform for fair typing practice, education, and entertainment.
            </p>
            <p>
              Community Leaderboard Guidelines:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Submissions made with automated scripts, bot engines, or memory injectors are subject to automated filtering.</li>
              <li>Typing records are verified by keystroke interval consistency and realistic human speed boundaries.</li>
            </ul>
            <p>
              TypeForge is provided on an &quot;as is&quot; basis for personal improvement and learning.
            </p>
          </>
        )}

        <div className="flex justify-end pt-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
