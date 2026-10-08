import "./index.scss";
import PageContent from "../../components/PageContent";
import ContactForm from "../../components/ContactForm";
import ContactInfo from "../../components/ContactInfo";
import ReassuranceBand from "../../components/ReassuranceBand";

export default function Contact() {
  return (
    <main className="contact-page">
      <div className="contact-page-body">
        <div className="contact-page-inner">
          <div className="contact-page-main">
            {/* Texte d'introduction modifiable par le client dans la page WordPress "contact" */}
            <PageContent slug="contact" />
            <ContactForm />
          </div>
          <div className="contact-page-aside">
            <ContactInfo />
          </div>
        </div>
      </div>

      <ReassuranceBand />
    </main>
  );
}
