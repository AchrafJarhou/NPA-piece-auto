import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchBlogPostBySlugThunk } from "../../thunkActionsCreator/blogThunks";
import Loader from "../Loader";
import Seo from "../Seo";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import "./index.scss";

export default function BlogPostComponent() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { singlePost, loadingSingle, errorSingle } = useSelector(
    (state) => state.blog,
  );
  const baseUrl = window.location.origin;

  useEffect(() => {
    dispatch(fetchBlogPostBySlugThunk(slug));
  }, [slug, dispatch]);

  if (loadingSingle) {
    return <Loader size="md" />;
  }

  if (errorSingle || !singlePost) {
    return <div>Article introuvable.</div>;
  }

  return (
    <div className="blog-post">
      <Seo
        title={singlePost.titleText}
        description={singlePost.excerptText}
        image={singlePost.image}
        url={`${baseUrl}/blog/${singlePost.id}`}
        type="article"
      />

      <h2 dangerouslySetInnerHTML={{ __html: sanitizeHtml(singlePost.titleText) }} />
      <p className="blog-post-date">
        {new Date(singlePost.date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(singlePost.contentHtml) }} />
    </div>
  );
}
