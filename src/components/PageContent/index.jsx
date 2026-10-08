import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageThunk } from "../../thunkActionsCreator/pagesThunks";
import Loader from "../Loader";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import "./index.scss";

// Contenu d'une page WordPress (mentions légales, CGV...) retrouvée par son slug :
// le client modifie le texte directement dans l'admin WordPress
export default function PageContent({ slug }) {
  const page = useSelector((state) => state.pages.items[slug]);
  const loading = useSelector((state) => state.pages.loading);
  const error = useSelector((state) => state.pages.error);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPageThunk(slug));
  }, [dispatch, slug]);

  if (!page && error) {
    return (
      <article className="page-content">
        <p className="page-content-message">
          Cette page n'est pas disponible pour le moment.
        </p>
      </article>
    );
  }
  if (!page || loading) return <Loader size="lg" />;

  return (
    <article className="page-content">
      <h1
        className="page-content-title"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.title?.rendered) }}
      />
      <div
        className="page-content-body"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content?.rendered) }}
      />
    </article>
  );
}
