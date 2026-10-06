import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchProductByIdThunk } from "../../thunkActionsCreator/productsThunks";
import useOpenCategory from "../../hooks/useOpenCategory";
import { stripHtml } from "../../utils/stripHtml";
import Seo from "../../components/Seo";
import Breadcrumb from "../../components/Breadcrumb";
import ProductGallery from "../../components/ProductGallery";
import ProductDimensions from "../../components/ProductDimensions";
import ProductPurchase from "../../components/ProductPurchase";
import ProductTabs from "../../components/ProductTabs";
import SimilarProducts from "../../components/SimilarProducts";
import Review from "../../components/Review";
import StoreContact from "../../components/StoreContact";
import ReassuranceBand from "../../components/ReassuranceBand";
import Loader from "../../components/Loader";

import "./index.scss";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const openCategory = useOpenCategory();
  const { list, singleProduct, loadingSingle, errorSingle } = useSelector(
    (state) => state.products,
  );

  // La fiche complète (véhicules, galerie...) est toujours demandée à l'API.
  // En attendant, on affiche le produit du catalogue s'il est déjà chargé.
  useEffect(() => {
    if (id) dispatch(fetchProductByIdThunk(id));
  }, [id, dispatch]);

  const fullProduct = String(singleProduct?.id) === String(id) ? singleProduct : null;
  const placeholder = list?.data?.find((p) => String(p.id) === String(id));
  const product = fullProduct || placeholder;

  if (!product) {
    if (loadingSingle) return <Loader size="lg" />;
    return (
      <main className="product-page">
        <p className="product-page-message">
          {errorSingle ? "Ce produit n'existe pas ou n'est plus disponible." : "Chargement…"}
        </p>
      </main>
    );
  }

  const name = stripHtml(product.name);
  const categoryPath = product.npa?.category_path || product.categories || [];
  const breadcrumb = [
    { label: "Accueil", to: "/" },
    ...categoryPath.map((category) => ({
      label: stripHtml(category.name),
      to: "/catalogue",
      onClick: (e) => {
        e.preventDefault();
        openCategory(category.slug);
      },
    })),
    { label: name },
  ];

  return (
    <main className="product-page">
      <Seo
        title={name}
        description={product.short_description || product.description}
        image={product.images?.[0]?.src}
        url={window.location.href}
        type="product"
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          name,
          sku: product.sku || undefined,
          brand: product.brands?.[0]?.name
            ? { "@type": "Brand", name: stripHtml(product.brands[0].name) }
            : undefined,
          description: stripHtml(product.short_description || product.description),
          image: (product.images || []).map((image) => image.src),
          offers: {
            "@type": "Offer",
            priceCurrency: product.prices?.currency_code || "EUR",
            price: product.prices?.price
              ? (parseFloat(product.prices.price) / 100).toFixed(2)
              : undefined,
            availability: product.is_in_stock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }}
      />

      <div className="product-page-body">
        <div className="product-page-inner">
          <Breadcrumb items={breadcrumb} />

          <div className="product-page-layout">
            <div className="product-page-media">
              <ProductGallery product={product} />
              <ProductDimensions product={product} />
            </div>
            <div className="product-page-info">
              <ProductPurchase product={product} />
            </div>
          </div>

          <ProductTabs product={product} />

          <section id="avis" className="product-page-reviews">
            <Review productId={product.id} />
          </section>

          <SimilarProducts currentProduct={product} reduxProducts={list?.data} />

          <StoreContact />
        </div>
      </div>

      <ReassuranceBand />
    </main>
  );
}
