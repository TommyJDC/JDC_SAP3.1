import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faLock, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FcGoogle } from 'react-icons/fc'; // Using react-icons for Google logo
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { signIn, signUpAndCreateProfile, signInWithGoogle } from '~/services/auth.service';
import { useToast } from '~/context/ToastContext'; // Use our toast hook

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // For signup
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Separate loading for Google
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast(); // Get addToast function

  if (!isOpen) return null;

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  const handleClose = () => {
     clearForm();
     setIsSignupMode(false); // Reset mode on close
     onClose();
  };

  const toggleMode = () => {
    clearForm();
    setIsSignupMode(!isSignupMode);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let user;
      if (isSignupMode) {
        // Sign Up
        if (!displayName.trim()) {
            throw new Error("Le nom d'affichage est requis.");
        }
        user = await signUpAndCreateProfile(email, password, displayName);
        addToast({ type: 'success', message: `Compte créé pour ${user.displayName}! Vous êtes connecté.` });
      } else {
        // Sign In
        user = await signIn(email, password);
        addToast({ type: 'success', message: `Bienvenue, ${user.displayName || user.email}!` });
      }
      handleClose(); // Close modal on success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message); // Show error message below the form
      addToast({ type: 'error', message: message }); // Show error toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
        const user = await signInWithGoogle();
        addToast({ type: 'success', message: `Connecté avec Google: ${user.displayName || user.email}` });
        handleClose(); // Close modal on success
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de connexion Google.';
        setError(message);
        addToast({ type: 'error', message: message });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-jdc-card p-6 md:p-8 rounded-lg shadow-xl relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-jdc-gray-400 hover:text-white focus:outline-none"
          aria-label="Fermer la modal"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 id="auth-modal-title" className="text-2xl font-semibold text-white mb-6 text-center">
          {isSignupMode ? 'Créer un compte' : 'Connexion'}
        </h2>

        {/* Google Sign-In Button */}
        <Button
            variant="secondary" // Or another appropriate variant
            className="w-full mb-4 flex items-center justify-center gap-2 border border-jdc-gray-600 hover:bg-jdc-gray-700"
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            disabled={isLoading || isGoogleLoading}
        >
            {isGoogleLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
                <FcGoogle size={20} />
            )}
            <span>{isSignupMode ? 'S\'inscrire avec Google' : 'Se connecter avec Google'}</span>
        </Button>

        {/* Divider */}
        <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-jdc-gray-600" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-jdc-card px-2 text-sm text-jdc-gray-400">OU</span>
            </div>
        </div>


        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignupMode && (
            <Input
              label="Nom d'affichage"
              id="displayName"
              name="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<FontAwesomeIcon icon={faUser} />}
              placeholder="Votre nom ou pseudo"
              required
              disabled={isLoading || isGoogleLoading}
              autoComplete="name"
            />
          )}
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FontAwesomeIcon icon={faEnvelope} />}
            placeholder="votreadresse@email.com"
            required
            disabled={isLoading || isGoogleLoading}
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<FontAwesomeIcon icon={faLock} />}
            placeholder={isSignupMode ? "Minimum 6 caractères" : "********"}
            required
            disabled={isLoading || isGoogleLoading}
            autoComplete={isSignupMode ? "new-password" : "current-password"}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (isSignupMode ? 'Création...' : 'Connexion...') : (isSignupMode ? 'Créer le compte' : 'Se connecter')}
          </Button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-jdc-yellow hover:text-yellow-300 focus:outline-none"
            disabled={isLoading || isGoogleLoading}
          >
            {isSignupMode
              ? 'Vous avez déjà un compte ? Se connecter'
              : 'Pas encore de compte ? Créer un compte'}
          </button>
        </div>
      </div>
    </div>
  );
};
