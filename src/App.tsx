import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop/ScrollToTop";
import { appRoutes } from "./config/routes";
import { ContentPage } from "./pages/ContentPage/ContentPage";
import { AdminPage } from "./pages/AdminPage/AdminPage";
import { AccessPage } from "./pages/AccessPage/AccessPage";
import { HelpPage } from "./pages/HelpPage/HelpPage";
import { HistoryPage } from "./pages/HistoryPage/HistoryPage";
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
          <Route path={appRoutes.content.slice(1)} element={<ContentPage />} />
          <Route path={appRoutes.publication.slice(1)} element={<PublicationPage />} />
          <Route path={appRoutes.marketing.slice(1)} element={<MarketingPage />} />
          <Route path={appRoutes.access.slice(1)} element={<AccessPage />} />
          <Route path={appRoutes.history.slice(1)} element={<HistoryPage />} />
          <Route path={appRoutes.admin.slice(1)} element={<AdminPage />} />
          <Route path={appRoutes.help.slice(1)} element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
