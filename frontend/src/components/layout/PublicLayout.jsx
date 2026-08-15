import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import ScrollToTopButton from "./ScrollToTopButton";
import PageTransition from "./PageTransition";
import SkipLink from "./SkipLink";

/**
 * Public marketing shell: skip link, gold scroll progress, premium navbar,
 * routed content (with page transition), footer, and back-to-top button.
 */
const PublicLayout = () => (
  <div className="flex min-h-screen flex-col">
    <SkipLink />
    <ScrollProgress />
    <Navbar />
    <main id="main-content" className="flex-1">
      <PageTransition>
        <Outlet />
      </PageTransition>
    </main>
    <Footer />
    <ScrollToTopButton />
  </div>
);

export default PublicLayout;
