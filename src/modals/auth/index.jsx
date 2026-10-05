import "./index.scss";
import { useDispatch } from "react-redux";
import { updateModalProps } from "../../slices/modalSlice";
import AuthForm from "../../components/AuthForm";
import ResetPasswordForm from "../../components/ResetPasswordForm/ResetPasswordForm";
import logo from "../../assets/images/logo.png";
import { site } from "../../config/site";

const titles = {
  login: {
    title: "Connexion à votre compte",
    subtitle: "Accédez à vos commandes, factures et tarifs comptoir Capelette",
  },
  register: {
    title: "Créer votre compte",
    subtitle: "Suivez vos commandes et profitez des tarifs comptoir Capelette",
  },
  "reset-password": {
    title: "Mot de passe oublié",
    subtitle: "Recevez un lien pour réinitialiser votre mot de passe",
  },
};

const tabs = [
  { view: "login", label: "Connexion" },
  { view: "register", label: "Inscription" },
];

export default function AuthModalContent({ view = "login", ...props }) {
  const dispatch = useDispatch();
  const { title, subtitle } = titles[view] || titles.login;

  return (
    <div className="auth-modal">
      <div className="auth-modal-header">
        <img src={logo} alt={site.name} className="auth-modal-logo" />
        <h2 className="auth-modal-title">{title}</h2>
        <p className="auth-modal-subtitle">{subtitle}</p>
      </div>

      {view !== "reset-password" && (
        <div className="auth-modal-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.view}
              type="button"
              role="tab"
              aria-selected={view === tab.view}
              className={`auth-modal-tab ${view === tab.view ? "is-active" : ""}`}
              onClick={() => dispatch(updateModalProps({ view: tab.view }))}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {view === "reset-password" ? (
        <ResetPasswordForm {...props} />
      ) : (
        // key : on repart d'un formulaire vide en changeant d'onglet
        <AuthForm key={view} view={view} {...props} />
      )}
    </div>
  );
}
