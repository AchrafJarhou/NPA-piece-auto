import "./index.scss";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../../thunkActionsCreator/productsThunks";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import {
  fetchFacetDefinitionsThunk,
  fetchCollectionDataThunk,
} from "../../thunkActionsCreator/catalogueThunks";
import { setFilters, resetSidebarFilters } from "../../slices/filtersSlice";
import { categoryContent } from "../../config/categories";
import CatalogueHero from "../../components/CatalogueHero";
import CatalogueToolbar from "../../components/CatalogueToolbar";
import CatalogueFilters from "../../components/CatalogueFilters";
import CatalogueProductCard from "../../components/CatalogueProductCard";
import CatalogueServices from "../../components/CatalogueServices";
import Pagination from "../../components/Pagination";
import ReassuranceBand from "../../components/ReassuranceBand";
import Loader from "../../components/Loader";

const PER_PAGE = 12;

export default function Store() {
  const dispatch = useDispatch();
  const resultsRef = useRef(null);
  const filters = useSelector((state) => state.filters);
  const { list, loading, error } = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories.items);
  const { attributes, definitionsLoaded } = useSelector((state) => state.catalogue);

  const category = categories.find((cat) => String(cat.id) === filters.category);
  const recommendation = categoryContent[category?.slug]?.recommendation;

  // Du véhicule, seul l'identifiant compte pour les requêtes (les noms servent à l'affichage)
  const queryFilters = {
    ...filters,
    vehicle: filters.vehicle ? { id: filters.vehicle.id } : null,
  };
  const queryKey = JSON.stringify(queryFilters);
  const { page, orderby, order, ...countFilters } = queryFilters;
  const countKey = JSON.stringify(countFilters);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoriesThunk());
    if (!definitionsLoaded) dispatch(fetchFacetDefinitionsThunk());
  }, [categories.length, definitionsLoaded, dispatch]);

  useEffect(() => {
    dispatch(fetchProductsThunk({ ...JSON.parse(queryKey), per_page: PER_PAGE }));
  }, [queryKey, dispatch]);

  // Véhicule mémorisé qui n'existe plus dans WordPress : on l'oublie
  useEffect(() => {
    if (error === "invalid_vehicle") dispatch(setFilters({ vehicle: null }));
  }, [error, dispatch]);

  useEffect(() => {
    if (!definitionsLoaded) return;
    dispatch(
      fetchCollectionDataThunk({
        filters: JSON.parse(countKey),
        taxonomies: attributes.map((attribute) => attribute.taxonomy),
      }),
    );
  }, [countKey, definitionsLoaded, attributes, dispatch]);

  const changePage = (nextPage) => {
    dispatch(setFilters({ page: nextPage }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const products = list.data || [];

  return (
    <main className="store-page">
      <CatalogueHero />

      <div className="store-page-body">
        <CatalogueToolbar />

        <div className="store-page-layout">
          <CatalogueFilters />

          <div className="store-page-results" ref={resultsRef}>
            {recommendation && (
              <div className="store-page-recommendation">
                <span className="store-page-recommendation-title">
                  Recommandation d'atelier NPA Capelette
                </span>
                <span className="store-page-recommendation-text">
                  {recommendation}
                </span>
              </div>
            )}

            {error && error !== "invalid_vehicle" && (
              <p className="store-page-message">
                Impossible de charger les pièces pour le moment. Réessayez dans
                quelques instants.
              </p>
            )}

            {!error && !loading && products.length === 0 && (
              <div className="store-page-message">
                <p>Aucune pièce ne correspond à votre recherche.</p>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => dispatch(resetSidebarFilters())}
                >
                  Retirer les filtres
                </button>
              </div>
            )}

            {loading && products.length === 0 ? (
              <Loader size="lg" />
            ) : (
              <div className={`store-page-grid ${loading ? "is-loading" : ""}`}>
                {products.map((product) => (
                  <CatalogueProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {products.length > 0 && (
              <Pagination
                page={list.page}
                totalPages={list.totalPages}
                total={list.total}
                perPage={list.perPage}
                onChange={changePage}
              />
            )}

            <CatalogueServices />
          </div>
        </div>
      </div>

      <ReassuranceBand />
    </main>
  );
}
