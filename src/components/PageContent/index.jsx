import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageThunk } from "../../thunkActionsCreator/pagesThunks";
import Loader from "../Loader";
import "./index.scss";

export default function PageContent({ slug }) {
  const page = useSelector((state) => state.pages.items[slug]);
  const loading = useSelector((state) => state.pages.loading);
  const error = useSelector((state) => state.pages.error);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPageThunk(slug));
  }, [dispatch, slug]);

  if (!page && error) return <p>{error}</p>;
  if (!page || loading) return <Loader size="lg" />;

  const title = page.title ?? "";
  const content = page.content ?? "";
  return (
    <div className="pageContent">
      <h2 dangerouslySetInnerHTML={{ __html: title.rendered }} />
      <div dangerouslySetInnerHTML={{ __html: content.rendered }} />
    </div>
  );
}
