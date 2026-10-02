import { useSelector } from "react-redux";
import PageContent from "../../components/PageContent";
import "./index.scss";

export default function Contact() {
  const email = useSelector((state) => state.site.store_email);
  return (
    <main className="contact-page">
      <PageContent slug="contact" />

      <a href={"mailto:" + email}>
        <button>Envoyer un message</button>
      </a>
    </main>
  );
}
