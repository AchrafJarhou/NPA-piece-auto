import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogDataThunk } from "../../thunkActionsCreator/blogThunks";
import Seo from "../../components/Seo";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import { decodeHtml } from "../../utils/decodeHtml";
import "./index.scss";

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Blog() {
  const dispatch = useDispatch();
  const { posts, categories, loading, loadingMore, error, page, hasMore } =
    useSelector((state) => state.blog);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchBlogDataThunk({ page: 1, perPage: 6 }));
  }, [dispatch]);

  useEffect(() => {
    const onScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300;

      if (nearBottom) {
        dispatch(fetchBlogDataThunk({ page: page + 1, perPage: 6 }));
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [dispatch, loading, loadingMore, hasMore, page]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;

    return posts.filter((post) =>
      post.categories.includes(Number(activeCategory)),
    );
  }, [activeCategory, posts]);

  if (loading) return <Loader size="lg" />;

  if (error) {
    return <div className="blog-error">{error}</div>;
  }

  return (
    <div className="blog-container">
      <Seo
        title="Blog"
        description="Découvrez nos derniers articles classés par catégorie."
      />
      <h1 className="blog-title">Blog</h1>
      <p className="blog-description">
        Découvrez nos derniers articles classés par catégorie.
      </p>

      <div className="blog-filters">
        <label htmlFor="blog-category-select" className="blog-filter-label">
          Catégorie :
        </label>
        <select
          id="blog-category-select"
          value={activeCategory}
          onChange={(event) => setActiveCategory(event.target.value)}
          className="blog-filter-select"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="blog-empty">Aucun article disponible pour le moment.</p>
      ) : (
        <div className="blog-posts-grid">
          {filteredPosts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="blog-link">
              <article className="blog-article">
                <h3 className="blog-article-title">
                  {post.titleText ? decodeHtml(post.titleText) : "Sans titre"}
                </h3>
                <p className="blog-article-date">{formatDate(post.date)}</p>
                <p className="blog-article-excerpt">
                  {post.excerptText
                    ? decodeHtml(post.excerptText)
                    : "Lire l'article complet."}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}

      {loadingMore && <Loader size="lg" />}
      {!hasMore && !loading && (
        <p className="blog-end-message">Tous les articles ont été chargés.</p>
      )}
    </div>
  );
}
