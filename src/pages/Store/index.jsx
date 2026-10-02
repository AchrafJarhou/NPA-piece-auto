import { useSelector } from "react-redux";
import Feed from "../../components/Feed";
import Filters from "../../components/Filters";
import "./index.scss";

export default function Store() {
  const catId = useSelector((state) => state.filters.category);
  const categories = useSelector((state) => state.categories.items);
  const category = categories.find((cat) => cat.id.toString() === catId);
  const bg = category?.image?.src;

  return (
    <main className="store-page">
      <Filters />
      <div>
        <Feed />
        <div
          className="category-bg"
          style={{ "--cat-bg": bg ? `url(${bg})` : "none" }}
        ></div>
      </div>
    </main>
  );
}
