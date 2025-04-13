import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, useRevalidator } from "@remix-run/react"; // Importer useRevalidator
import { useState, useEffect } from "react";
// Importer searchArticles, addArticleImageUrl, et deleteArticleImageUrl
import { searchArticles, addArticleImageUrl, deleteArticleImageUrl } from "~/services/firestore.service.server";
import type { Article, AppUser, UserProfile } from "~/types/firestore.types";
import { useOutletContext } from "@remix-run/react";
import { useRef } from "react"; // Importer useRef pour l'input fichier caché
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importer pour icônes
import { faPlus, faSpinner, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Importer icônes + faTrashAlt

// Loader: Ne récupère plus les articles, renvoie juste les searchParams
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim() || "";
  const nom = url.searchParams.get("nom")?.trim() || "";
  console.log("Articles Loader: Returning search params", { code, nom });
  // Ne renvoie plus articles ni error depuis le loader
  return json({ searchParams: { code, nom } });
}

// Interface pour le contexte de l'outlet
interface OutletContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loadingAuth: boolean;
}

// Composant pour la page de recherche
export default function ArticlesSearch() {
  const { searchParams: loaderSearchParams } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { user, loadingAuth } = useOutletContext<OutletContextType>(); // Récupérer user et loadingAuth

  // États locaux pour les articles, le chargement et les erreurs côté client
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Initialiser l'état local du formulaire avec les paramètres du loader (qui viennent de l'URL)
  const [codeSearch, setCodeSearch] = useState(loaderSearchParams.code);
  const [nomSearch, setNomSearch] = useState(loaderSearchParams.nom);

  // États pour gérer l'upload d'image (par article)
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Référence pour l'input fichier caché
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour la modale d'image
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // État pour gérer la suppression d'image
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null); // Stocke l'URL en cours de suppression
  const [deleteError, setDeleteError] = useState<string | null>(null); // Erreur spécifique à la suppression

  // Effet pour lancer la recherche côté client lorsque les paramètres ou l'état d'auth changent
  useEffect(() => {
    // Récupérer les paramètres actuels de l'URL pour la recherche
    const currentCode = searchParams.get("code")?.trim() || "";
    const currentNom = searchParams.get("nom")?.trim() || "";

    // Mettre à jour les champs du formulaire si l'URL change (ex: bouton retour)
    setCodeSearch(currentCode);
    setNomSearch(currentNom);

    // Ne lancer la recherche que si l'authentification est terminée,
    // l'utilisateur est connecté, et au moins un critère est fourni
    if (!loadingAuth && user && (currentCode || currentNom)) {
      const performSearch = async () => {
        setIsLoading(true);
        setFetchError(null);
        setLocalArticles([]); // Vider les anciens résultats
        console.log("Client Search: Performing search for", { code: currentCode, nom: currentNom });
        try {
          const results = await searchArticles({ code: currentCode, nom: currentNom });
          setLocalArticles(results);
          console.log("Client Search: Found results", results);
        } catch (err: any) {
          console.error("Client Search: Error fetching articles", err);
          setFetchError(err.message || "Erreur lors de la recherche côté client.");
        } finally {
          setIsLoading(false);
        }
      };
      performSearch();
    } else {
      // Si pas de recherche à lancer (pas connecté, pas de critères), vider les résultats
      setLocalArticles([]);
      setIsLoading(false);
      setFetchError(null);
    }
    // Dépendances : searchParams (pour réagir aux changements d'URL), loadingAuth, user
  }, [searchParams, loadingAuth, user]);

  // --- Fonctions pour gérer l'upload ---
  const handleAddPhotoClick = (articleId: string) => {
    setUploadError(null);
    setUploadingImageId(null);
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-article-id', articleId);
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const targetArticleId = event.target.getAttribute('data-article-id');

    if (file && targetArticleId) {
      console.log(`Fichier sélectionné: ${file.name} pour l'article ID: ${targetArticleId}`);
      setUploadingImageId(targetArticleId);
      setUploadError(null);
      setDeleteError(null); // Clear delete error on new upload attempt

      const CLOUDINARY_CLOUD_NAME = "dkeqzl54y";
      const CLOUDINARY_UPLOAD_PRESET = "jdc-img";
      const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        console.log(`Upload vers Cloudinary pour l'article ${targetArticleId}...`);
        const response = await fetch(CLOUDINARY_API_URL, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API Cloudinary:", errorData);
          throw new Error(errorData.error?.message || `Échec de l'upload Cloudinary (HTTP ${response.status})`);
        }

        const data = await response.json();
        const imageUrl = data.secure_url;
        console.log("Upload Cloudinary réussi. URL:", imageUrl);

        await addArticleImageUrl(targetArticleId, imageUrl);
        console.log("Mise à jour Firestore terminée pour", targetArticleId);

        setLocalArticles(prevArticles =>
          prevArticles.map(art => {
            if (art.id === targetArticleId) {
              const updatedUrls = [...(art.imageUrls || []), imageUrl];
              return { ...art, imageUrls: updatedUrls };
            }
            return art;
          })
        );

      } catch (error: any) {
        console.error("Erreur pendant l'upload ou la mise à jour Firestore:", error);
        setUploadError(error.message || "Échec de l'upload de l'image.");
      } finally {
        setUploadingImageId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
          fileInputRef.current.removeAttribute('data-article-id');
        }
      }
    } else {
       if (fileInputRef.current) {
           fileInputRef.current.removeAttribute('data-article-id');
       }
    }
  };

  // --- Fonctions pour la modale image ---
  const openImageModal = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  // --- Fonction pour gérer la suppression d'image ---
  const handleDeleteImage = async (articleId: string, imageUrl: string) => {
    // Confirmation avant suppression
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.")) {
      return;
    }

    console.log(`Tentative de suppression de l'image: ${imageUrl} pour l'article: ${articleId}`);
    setDeletingImageUrl(imageUrl); // Marquer cette URL comme en cours de suppression
    setDeleteError(null); // Réinitialiser l'erreur de suppression
    setUploadError(null); // Clear upload error as well

    try {
      // Appeler la fonction de service pour supprimer l'URL de Firestore
      await deleteArticleImageUrl(articleId, imageUrl);
      console.log("Suppression de l'URL dans Firestore réussie.");

      // Mettre à jour l'état local pour retirer l'image immédiatement
      setLocalArticles(prevArticles =>
        prevArticles.map(art => {
          if (art.id === articleId) {
            // Filtrer l'URL supprimée du tableau
            const updatedUrls = (art.imageUrls || []).filter(url => url !== imageUrl);
            return { ...art, imageUrls: updatedUrls };
          }
          return art;
        })
      );

      // Note: La suppression du fichier sur Cloudinary n'est pas gérée ici
      // car elle nécessiterait une API backend sécurisée avec vos clés Cloudinary.
      // L'approche actuelle supprime juste la référence.

    } catch (error: any) {
      console.error("Erreur pendant la suppression de l'URL de l'image:", error);
      setDeleteError(error.message || "Échec de la suppression de l'image.");
    } finally {
      setDeletingImageUrl(null); // Fin de la tentative de suppression
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-100">Recherche d'Articles</h1>

      {/* Formulaire de recherche */}
      <Form method="get" className="mb-6 p-4 border border-gray-700 rounded-lg shadow-sm bg-jdc-blue-darker">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
              Code Article
            </label>
            <input
              type="text"
              name="code"
              id="code"
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-jdc-gray-800 text-gray-100 placeholder-gray-400"
              placeholder="Code exact"
            />
          </div>
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-1">
              Nom Article
            </label>
            <input
              type="text"
              name="nom"
              id="nom"
              value={nomSearch}
              onChange={(e) => setNomSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-jdc-gray-800 text-gray-100 placeholder-gray-400"
              placeholder="Nom partiel ou complet"
            />
          </div>
          <div className="md:pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Rechercher
            </button>
          </div>
        </div>
      </Form>

      {/* Section des résultats */}
      <div className="bg-jdc-blue-darker p-4 border border-gray-700 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Résultats</h2>

        {isLoading && <p className="text-gray-400 italic">Chargement des articles...</p>}
        {fetchError && !isLoading && <p className="text-red-500 text-sm">{fetchError}</p>}
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>} {/* Afficher l'erreur de suppression */}


        {!isLoading && !fetchError && (
          <>
            {localArticles.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {localArticles.map((article) => {
                  const isUploadingCurrent = uploadingImageId === article.id;
                  return (
                    <li key={article.id} className="py-4 px-1 hover:bg-jdc-gray-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-100">Code: {article.Code}</p>
                          <p className="text-sm text-gray-300">Désignation: {article.Désignation}</p>
                          {article.imageUrls && article.imageUrls.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {article.imageUrls.map((url, index) => {
                                const isDeletingCurrent = deletingImageUrl === url;
                                return (
                                  <div key={index} className="relative group"> {/* Conteneur relatif pour le bouton */}
                                    <img
                                      src={url}
                                      alt={`Image ${index + 1} pour ${article.Code}`}
                                      className={`h-16 w-16 object-cover rounded border border-gray-600 transition-opacity ${isDeletingCurrent ? 'opacity-50' : 'group-hover:opacity-70 cursor-pointer'}`}
                                      loading="lazy"
                                      onClick={() => !isDeletingCurrent && openImageModal(url)} // Ouvrir seulement si pas en cours de suppression
                                    />
                                    {/* Bouton Supprimer */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Empêcher d'ouvrir la modale
                                        handleDeleteImage(article.id, url);
                                      }}
                                      disabled={isDeletingCurrent}
                                      className={`absolute top-0 right-0 p-1 bg-red-600 bg-opacity-75 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${isDeletingCurrent ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-700'}`}
                                      aria-label="Supprimer l'image"
                                    >
                                      {isDeletingCurrent ? (
                                        <FontAwesomeIcon icon={faSpinner} spin className="h-3 w-3" />
                                      ) : (
                                        <FontAwesomeIcon icon={faTrashAlt} className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddPhotoClick(article.id)}
                            disabled={isUploadingCurrent}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded shadow-sm text-white ${
                              isUploadingCurrent
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-jdc-blue-darker focus:ring-indigo-500'
                            }`}
                          >
                            {isUploadingCurrent ? (
                              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            ) : (
                              <FontAwesomeIcon icon={faPlus} className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                            )}
                            <span>{isUploadingCurrent ? 'Upload...' : 'Photo'}</span>
                          </button>
                        </div>
                      </div>
                      {uploadError && uploadingImageId === article.id && (
                         <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                       )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400 italic">
                {searchParams.get("code") || searchParams.get("nom")
                  ? "Aucun article trouvé pour ces critères."
                  : "Effectuez une recherche pour afficher les résultats."}
                 {!user && !loadingAuth && " Veuillez vous connecter pour effectuer une recherche."}
              </p>
            )}
          </>
        )}
      </div>

      {/* Input fichier caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/*"
        style={{ display: 'none' }}
        data-article-id=""
      />

      {/* Modale pour afficher l'image en grand */}
      {isImageModalOpen && selectedImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative bg-white p-2 rounded-lg max-w-3xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageUrl}
              alt="Image agrandie"
              className="block max-w-full max-h-[calc(80vh-40px)] object-contain"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-black bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 focus:outline-none"
              aria-label="Fermer l'image"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
