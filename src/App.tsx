import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop/ScrollToTop";
import { ContentPage } from "./pages/ContentPage/ContentPage";
import { HelpPage } from "./pages/HelpPage/HelpPage";
import { HomePage } from "./pages/HomePage/HomePage";
import { MarketingPage } from "./pages/MarketingPage/MarketingPage";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage";
import { PublicationPage } from "./pages/PublicationPage/PublicationPage";

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="publication" element={<PublicationPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
