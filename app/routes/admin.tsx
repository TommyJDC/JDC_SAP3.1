import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, Link } from '@remix-run/react';
import type { AppUser, UserProfile } from '~/types/firestore.types';
import { Card, CardHeader, CardBody } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { EditUserModal } from '~/components/EditUserModal';
// Removed SignupForm import
import {
  getAllUserProfilesSdk,
  updateUserProfileSdk
} from '~/services/firestore.service';
// Removed signUpAndCreateProfile import from auth.service
import { useToast } from '~/context/ToastContext';

// Define the context type expected from the outlet (matching root.tsx)
interface OutletContext {
  user: AppUser | null;
  profile: UserProfile | null;
  loadingAuth: boolean;
}

// Define available sectors and roles here for consistency
const AVAILABLE_SECTORS = ['CHR', 'HACCP', 'Kezia', 'Tabac'];
const AVAILABLE_ROLES = ['Admin', 'Technician', 'Viewer'];

export default function AdminPanel() {
  const { user, profile, loadingAuth } = useOutletContext<OutletContext>();
  const { addToast } = useToast();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  // State for the Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Removed state related to SignupForm (isSigningUp, signupError)

  // Determine authorization
  useEffect(() => {
    if (loadingAuth) {
      setIsAuthorized(null);
      return;
    }
    const isAdmin = user && profile?.role?.toLowerCase() === 'admin';
    setIsAuthorized(isAdmin);
  }, [user, profile, loadingAuth]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    console.log('[AdminPanel] Fetching user list...');
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const fetchedUsers = await getAllUserProfilesSdk();
      console.log('[AdminPanel] User list fetched successfully:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('[AdminPanel] Error fetching user list:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setErrorUsers(`Impossible de charger la liste des utilisateurs: ${errorMessage}. Vérifiez les permissions Firestore ou la console.`);
      addToast({ type: "error", message: "Erreur lors du chargement des utilisateurs." }); // Use object format
    } finally {
      setLoadingUsers(false);
    }
  }, [addToast]); // Keep addToast dependency

  // Fetch users effect
  useEffect(() => {
    if (isAuthorized === true) {
      fetchUsers();
    } else if (isAuthorized === false) {
      setUsers([]);
    }
  }, [isAuthorized, fetchUsers]);

  // --- Modal Handlers ---
  const handleOpenEditModal = (userToEdit: UserProfile) => {
    console.log('[AdminPanel] Opening edit modal for user:', userToEdit.uid);
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    console.log('[AdminPanel] Closing edit modal.');
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // --- Save User Handler (Edit) ---
  const handleSaveUser = async (updatedUser: UserProfile) => {
    if (!editingUser) return;
    console.log('[AdminPanel] Attempting to save user (client-side):', updatedUser.uid, updatedUser);

    const dataToUpdate: Partial<UserProfile> = {};
    if (updatedUser.displayName !== editingUser.displayName) {
      dataToUpdate.displayName = updatedUser.displayName;
    }
    if (updatedUser.role !== editingUser.role) {
      dataToUpdate.role = updatedUser.role;
    }
    const sortedCurrentSectors = [...(editingUser.secteurs || [])].sort();
    const sortedUpdatedSectors = [...(updatedUser.secteurs || [])].sort();
    if (JSON.stringify(sortedCurrentSectors) !== JSON.stringify(sortedUpdatedSectors)) {
       dataToUpdate.secteurs = updatedUser.secteurs || [];
    }

     if (Object.keys(dataToUpdate).length === 0) {
       addToast({ type: "info", message: "Aucune modification détectée." }); // Use object format
       handleCloseEditModal();
       return;
     }

    try {
      await updateUserProfileSdk(editingUser.uid, dataToUpdate);
      addToast({ type: "success", message: "Utilisateur mis à jour avec succès." }); // Use object format
      handleCloseEditModal();
      fetchUsers(); // Refetch user list after update
    } catch (error: any) {
      console.error("[AdminPanel] Error saving user (client-side SDK):", error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      addToast({ type: "error", message: `Erreur lors de la mise à jour : ${errorMessage}` }); // Use object format
      throw error; // Re-throw for the modal to catch
    }
  };

  // Removed handleSignup function

  // --- Render Logic ---
  if (loadingAuth || isAuthorized === null) {
    return <div className="flex justify-center items-center h-64"><p className="text-jdc-gray-400 animate-pulse">Vérification de l'accès...</p></div>;
  }

  if (!isAuthorized) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Accès Refusé</h1>
        <p className="text-jdc-gray-300">Vous n'avez pas les permissions nécessaires.</p>
        <Link to="/dashboard" className="text-jdc-yellow hover:underline mt-4 inline-block">Retour au tableau de bord</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6">Panneau d'Administration</h1>

      {/* Admin Info Card */}
      <Card>
        <CardHeader><h2 className="text-lg font-medium text-white">Informations Administrateur</h2></CardHeader>
        <CardBody>
            <p className="text-jdc-gray-300">Connecté en tant que : <span className="font-medium text-white">{profile?.email}</span></p>
            <p className="text-jdc-gray-300">Rôle : <span className="font-medium text-white">{profile?.role}</span></p>
        </CardBody>
      </Card>

      {/* REMOVED Create New User Section */}
      {/* The SignupForm component and its card have been removed */}


      {/* User Management Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-white">Gestion des Utilisateurs Existants</h2>
          <p className="mt-1 text-sm text-jdc-gray-400">Modifier les rôles et les secteurs des utilisateurs.</p>
        </CardHeader>
        <CardBody>
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Attention Sécurité ! </strong>
            <span className="block sm:inline">La modification des utilisateurs est effectuée côté client via SDK. Ceci est INSECURISÉ pour les opérations sensibles (changement de rôle admin) et doit être remplacé par des fonctions backend sécurisées (ex: Cloud Functions) à terme.</span>
          </div>
           <div className="bg-yellow-900 border border-yellow-700 text-yellow-100 px-4 py-3 rounded relative mb-4" role="alert">
             <strong className="font-bold">Info : </strong>
             <span className="block sm:inline">La création de nouveaux utilisateurs se fait désormais via la fenêtre de connexion (bouton "Créer un compte").</span>
           </div>

          {loadingUsers && <div className="text-center py-4"><p className="text-jdc-gray-400 animate-pulse">Chargement de la liste...</p></div>}
          {errorUsers && !loadingUsers && <div className="text-center py-4 text-red-400"><p>{errorUsers}</p></div>}

          {!loadingUsers && !errorUsers && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-jdc-gray-700">
                <thead className="bg-jdc-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider">Secteurs</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-jdc-card divide-y divide-jdc-gray-700">
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{u.displayName || <i className="text-jdc-gray-500">Non défini</i>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300">{u.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300">{u.secteurs?.join(', ') || <i className="text-jdc-gray-500">Aucun</i>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditModal(u)}
                          // Optional: Prevent editing self if needed
                          // disabled={u.uid === user?.uid}
                        >
                          Modifier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingUsers && !errorUsers && users.length === 0 && (
            <div className="text-center py-4 text-jdc-gray-400"><p>Aucun utilisateur trouvé.</p></div>
          )}
        </CardBody>
      </Card>

      {/* Render the Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={editingUser}
        onSave={handleSaveUser}
        availableRoles={AVAILABLE_ROLES}
        availableSectors={AVAILABLE_SECTORS}
      />
    </div>
  );
}
