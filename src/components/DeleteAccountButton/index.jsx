import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteCurrentUserThunk } from "../../thunkActionsCreator/userThunks";
import "./index.scss";

export default function DeleteAccountButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.",
    );

    if (!confirmed) return;

    const password = window.prompt(
      "Entrez votre mot de passe pour confirmer la suppression :",
    );

    if (!password) return;

    dispatch(deleteCurrentUserThunk({ password }))
      .unwrap()
      .then(() => {
        alert("Votre compte a été supprimé avec succès.");
        navigate("/"); // Redirection vers l'accueil après suppression
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression :", err);
      });
  };

  return (
    <div className="delete-account-section">
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{ backgroundColor: "red", color: "white" }}
      >
        {loading ? "Suppression en cours..." : "Supprimer mon compte"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
