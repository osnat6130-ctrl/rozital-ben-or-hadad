import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Accessibility from "@/pages/Accessibility";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* שלושת דפי השירות משתמשים באותה קומפוננטה, עם נתונים שונים */}
          <Route path="/lectures" element={<ServicePage id="lectures" />} />
          <Route path="/laughter-yoga" element={<ServicePage id="laughter-yoga" />} />
          <Route path="/bat-mitzvah" element={<ServicePage id="bat-mitzvah" />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
