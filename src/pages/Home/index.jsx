import "./index.scss";

import HomeHero from "../../components/HomeHero";
import Reassurance from "../../components/Reassurance";
import HomeFamilies from "../../components/HomeFamilies";
import ProBanner from "../../components/ProBanner";
import StoreLocation from "../../components/StoreLocation";

export default function Home() {
  return (
    <main className="home">
      <HomeHero />
      <Reassurance />
      <HomeFamilies />
      <ProBanner />
      <StoreLocation />
    </main>
  );
}
